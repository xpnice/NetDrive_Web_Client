import React, { Component } from 'react'
//import PropTypes from 'prop-types'
import 'antd/dist/antd.css';

import { Upload, Icon, Progress, Spin, message } from 'antd'
import {
  Card, Button
} from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import request from 'superagent'
import SparkMD5 from 'spark-md5'
import store from 'store';
import config from 'config.json'
const Dragger = Upload.Dragger

class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preUploading: false,   //预处理
      //chunksSize: 0,   // 上传文件分块的总个数
      uploadPercent: -1,  // 上传率
      preUploadPercent: -1, // 预处理率  
      uploadRequest: false, // 上传请求，即进行第一个过程中
      uploaded: false, // 表示文件是否上传成功
      uploading: false, // 上传中状态
      fileList: [],
      directory: false,
      uploading_sub: 0,
      uploadParams: [],
      arrayBufferData: [],
      chunksSize: [],
      totalchunks: 0,
      pre_chunks_now: 0,
    }
  }
  overack = () => {
    var _this = this,
      Console = console
    const formData = {
      process: 'overack',
      username: store.getState().username,
      hash: _this.state.uploadParams[this.state.uploading_sub].file.fileMd5,
      path: _this.state.uploadParams[this.state.uploading_sub].file.path
    }
    Console.log('确认上传成功请求包:', formData)
    request
      .post('http://' + config.server_addr + ':' + config.server_port)
      .send(JSON.stringify(formData))
      .withCredentials()
      .retry(3)//发起两次重连
      .timeout({
        response: 10000,  // Wait 10 seconds for the server to start sending,
        deadline: 60000, // but allow 1 minute for the file to finish loading.
      })
      .end((err, res) => {
        //Console.log('Send Chunk Response', res.body);
        if (err) {
          Console.log(err);
          alert('连接错误，请重新上传')
          return false
        }
        if (res.statusCode === 200) {
          Console.log('从服务器获得上传成功响应:', res.body)
          if (res.body.status === 'OK') {
            if (this.state.uploading_sub === this.state.fileList.length - 1) {//如果所有文件上传结束
              message.success(`文件${_this.state.uploadParams[this.state.uploading_sub].file.path}上传成功`)
              _this.setState({
                uploaded: true,    // 让进度条消失
                uploading: false
              })
            }
            else {//否则上传下一个文件
              this.setState({ uploading_sub: this.state.uploading_sub + 1 })
              this.preUpload()
            }
            return
          }
          alert('服务器响应错误!请重试')
          return false
        }
      })
  }
  showConfirm = () => {
    const _this = this
    _this.preUpload()
  }
  preUpload = () => {//与服务器交互部分
    var _this = this
    var Console = console;
    let uploadList = this.state.uploadParams[this.state.uploading_sub].chunks//分片上传列表

    const Data = {
      process: 'uploadRequest',
      username: store.getState().username,
      hash: _this.state.uploadParams[this.state.uploading_sub].file.fileMd5,
      size: _this.state.uploadParams[this.state.uploading_sub].file.fileSize.toString(),
      path: _this.state.uploadParams[this.state.uploading_sub].file.path
    }
    Console.log(`文件${Data.path}分块结果:`, this.state.uploadParams[this.state.uploading_sub])
    Console.log(`文件${Data.path}上传请求报文:`, Data)
    request
      .post('http://' + config.server_addr + ':' + config.server_port)
      .send(JSON.stringify(Data))
      .withCredentials()
      .retry(2)
      .end((err, res) => {
        if (err) {
          alert('连接错误，请重新上传')
          return
        }
        if (res.statusCode === 200) {
          Console.log('从服务器获得请求响应:', res.body)
          if (res.body.status === 'OK') {//允许发送文件
            // 获得上传进度
            let uploadPercent = Number((parseInt(res.body.NextChunk) / this.state.chunksSize[this.state.uploading_sub] * 100).toFixed(2))
            _this.setState({
              uploaded: false,
              uploading: true,
              uploadRequest: false,
              uploadPercent
            })
            //进行分片上传
            this.handlePartUpload(uploadList[parseInt(res.body.NextChunk)], res.body.subscript)
            return
          }
          if (res.body.status === 'OVER') {//妙传
            this.overack()
            return
          }
          alert('服务器响应错误!请重试')
          return
        }

      })
  }
  handlePartUpload = (Chunk_Now, sub) => {
    const _this = this
    var Console = console
    let { chunkMd5, chunk } = Chunk_Now
    let formData = new FormData(),
      blob = new Blob([_this.state.arrayBufferData[this.state.uploading_sub][chunk - 1].currentBuffer], { type: 'application/octet-stream' })
    const chunk_info = {
      subscript: sub,
      chunk: (chunk - 1).toString(),
      hash: _this.state.uploadParams[this.state.uploading_sub].file.fileMd5,
      username: store.getState().username
    }
    Console.log('发送第' + chunk_info.chunk + '块:', chunk_info)
    formData.append('chunk_info', JSON.stringify(chunk_info))
    formData.append('chunk', blob, chunkMd5)
    request
      .post('http://' + config.server_addr + ':' + config.server_port)
      .send(formData)
      .withCredentials()
      .retry(100)//发起两次重连
      .timeout({
        response: 10000,  // Wait 10 seconds for the server to start sending,
        deadline: 60000, // but allow 1 minute for the file to finish loading.
      })
      .end((err, res) => {
        //Console.log('Send Chunk Response', res.body);
        if (err) {
          console.log(err);
          alert('连接错误，请重新上传')
          return
        }
        if (res.statusCode === 200) {
          Console.log('从服务器获得请求响应:', res.body)
          if (res.body.status === 'OK') {
            // 计算上传进度
            let uploadPercent = Number(((chunk) / _this.state.chunksSize[_this.state.uploading_sub] * 100).toFixed(2))
            _this.setState({
              uploadPercent,
              uploading: true
            })
            _this.handlePartUpload(_this.state.uploadParams[this.state.uploading_sub].chunks[parseInt(res.body.NextChunk)], res.body.subscript)//上传下一块
            return
          }
          if (res.body.status === 'OVER') {
            this.overack()
            return
          }
          alert('服务器响应错误!请重试')
          return
        }
      })
  }
  render() {
    const { preUploading, uploadPercent, preUploadPercent, uploadRequest, uploaded, uploading } = this.state
    const _this = this
    const uploadProp = {
      onRemove: (file) => {
        _this.setState(({ fileList }) => {
          const index = fileList.indexOf(file)
          const newFileList = fileList.slice()
          newFileList.splice(index, 1)
          return {
            fileList: newFileList,
          }
        })
      },
      directory: this.state.directory,
      multiple: true,
      beforeUpload: (file) => {
        // 首先清除一下各种上传的状态
        _this.setState({
          uploaded: false,   // 上传成功
          uploading: false,  // 上传中
          uploadRequest: false   // 上传预处理
        })
        // 兼容性的处理
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
          chunkSize = config.chunk_size,                             // 切片每次5M
          chunks = Math.ceil(file.size / chunkSize),  //切片数量
          currentChunk = 0, // 当前上传的chunk
          spark = new SparkMD5.ArrayBuffer(),
          // 对arrayBuffer数据进行md5加密，产生一个md5字符串
          chunkFileReader = new FileReader(),  // 用于计算出每个chunkMd5
          totalFileReader = new FileReader()  // 用于计算出总文件的fileMd5

        let params = { chunks: [], file: {} },   // 用于上传所有分片的md5信息
          arrayBuffer = []              // 用于存储每个chunk的arrayBuffer对象,用于分片上传使用
        params.file.fileName = file.name
        if (file.webkitRelativePath !== '')
          params.file.path = `${store.getState().tree.path}/${file.webkitRelativePath}`
        else
          params.file.path = `${store.getState().tree.path}/${file.name}`
        params.file.fileSize = file.size



        totalFileReader.readAsArrayBuffer(file)
        totalFileReader.onload = function (e) {
          // 对整个totalFile生成md5
          spark.append(e.target.result)
          params.file.fileMd5 = spark.end() // 计算整个文件的fileMd5

        }

        chunkFileReader.onload = function (e) {
          // 对每一片分片进行md5加密
          spark.append(e.target.result)
          // 每一个分片需要包含的信息
          let obj = {
            chunk: currentChunk + 1,
            start: currentChunk * chunkSize, // 计算分片的起始位置
            end: ((currentChunk * chunkSize + chunkSize) >= file.size) ? file.size : currentChunk * chunkSize + chunkSize, // 计算分片的结束位置
            chunkMd5: spark.end(),
            chunks
          }
          // 每一次分片onload,currentChunk都需要增加，以便来计算分片的次数

          currentChunk++;
          _this.setState({ pre_chunks_now: _this.state.pre_chunks_now + 1 })
          params.chunks.push(obj)

          // 将每一块分片的arrayBuffer存储起来，用来partUpload
          let tmp = {
            chunk: obj.chunk,
            currentBuffer: e.target.result
          }
          arrayBuffer.push(tmp)

          if (currentChunk < chunks) {
            // 当前切片总数没有达到总数时
            loadNext()

            // 计算预处理进度
            _this.setState({
              preUploading: true,
              preUploadPercent: Number((_this.state.pre_chunks_now / _this.state.totalchunks * 100).toFixed(2))
            })
          } else {
            //记录所有chunks的长度
            var Console = console;
            params.file.fileChunks = params.chunks.length
            let chunksSize = _this.state.chunksSize,
              uploadParams = _this.state.uploadParams,
              arrayBufferData = _this.state.arrayBufferData
            chunksSize.push(chunks);
            uploadParams.push(params);
            arrayBufferData.push(arrayBuffer)
            // 表示预处理结束，将上传的参数，arrayBuffer的数据存储起来
            if (_this.state.pre_chunks_now === _this.state.totalchunks) {
              Console.log('所有文件预处理完成')
              _this.setState({
                preUploading: false,
                uploadParams,
                arrayBufferData,
                chunksSize,
                preUploadPercent: 100
              })
            }
            else _this.setState({
              uploadParams,
              arrayBufferData,
              chunksSize,
            })
          }
        }
        chunkFileReader.onerror = function () {
          var Console = console
          Console.warn('oops, something went wrong.');
        };
        function loadNext() {
          var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
          chunkFileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
        loadNext()
        let fileList = _this.state.fileList
        fileList.push(file)
        //console.log('文件列表:', fileList)
        let totalchunks = fileList.reduce(function (partial, file) {
          return partial + Math.ceil(file.size / config.chunk_size);
        }, 0)
        _this.setState({
          totalchunks,
          fileList: fileList,
          file: file
        })
        return false
      },
      fileList: _this.state.fileList,
    }



    return (
      <Card style={{ position: 'relative', height: '100%' }}>
        <FormControlLabel
          style={{ marginTop: 8 }}
          control={
            <Switch
              checked={this.state.directory}
              onChange={() => { this.setState({ directory: !this.state.directory }) }}
              color="primary"

            />
          }
          label="是否支持上传文件夹"
          labelPlacement="start"
        />
        <div className="content-inner" style={{ height: 430 }}>
          <Spin
            spinning={preUploading}
            //style={{ height: '80%' }}
            tip={
              <div >
                <h3
                  style={{ margin: '10px auto', color: '#1890ff' }}
                >
                  文件预处理中...
                </h3>
                <Progress
                  percent={preUploadPercent}
                  status="active"
                  type="circle"
                  width={80}
                />
              </div>
            }
          >
            <div style={{ marginTop: 8, height: '50%' }}>
              <Dragger {...uploadProp} style={{ backgroundColor: '#ffffff' }}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">点击或者拖拽文件进行上传</p>
                <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
              </Dragger>

              {uploadPercent >= 0 && !!uploading && <div style={{ marginTop: 20, width: '95%' }}>
                <Progress
                  percent={uploadPercent}
                  status="active"
                />
                <h4>文件上传中，请勿关闭窗口</h4>
              </div>}
              {!!uploadRequest && <h4 style={{ color: '#1890ff' }}>上传请求中...</h4>}
              {!!uploaded && <h4 style={{ color: '#52c41a' }}>文件上传成功</h4>}

            </div>
          </Spin>

        </div>

        <Button
          color="primary"
          disabled={!!(this.state.preUploadPercent < 100 || this.state.fileList.length === 0)}
          fullWidth
          onClick={this.showConfirm}
          variant="contained"
          style={{ position: 'absolute', bottom: 0 }}
        >
          <Icon type="upload" /> 提交上传
        </Button>



      </Card>
    )
  }
}

FileUpload.propTypes = {
  //...
}


export default FileUpload;