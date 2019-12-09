import React, { Component } from 'react'
//import PropTypes from 'prop-types'
import 'antd/dist/antd.css';

import { Upload, Icon, Button, Progress, Modal, Spin, message } from 'antd'

import request from 'superagent'
import SparkMD5 from 'spark-md5'

const confirm = Modal.confirm
const Dragger = Upload.Dragger

class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preUploading: false,   //预处理
      chunksSize: 0,   // 上传文件分块的总个数
      currentChunks: 0,  // 当前上传的队列个数 当前还剩下多少个分片没上传
      uploadPercent: -1,  // 上传率
      preUploadPercent: -1, // 预处理率  
      uploadRequest: false, // 上传请求，即进行第一个过程中
      uploaded: false, // 表示文件是否上传成功
      uploading: false, // 上传中状态
    }
  }
  showConfirm = () => {
    const _this = this
    confirm({
      title: '是否提交上传?',
      content: '点击确认进行提交',
      onOk() {
        _this.preUpload()
      },
      onCancel() { },
    })
  }


  preUpload = () => {//与服务器交互部分
    //let res = request.post('http://localhost:3000', this.state.uploadParams)
    //console.log(res);
    var Console = console;
    let uploadList = this.state.uploadParams.chunks//分片上传列表
    Console.log(this.state.uploadParams)
    let currentChunks = this.state.uploadParams.file.fileChunks

    var _this = this
    // 获得上传进度
    let uploadPercent = Number(((this.state.chunksSize - currentChunks) / this.state.chunksSize * 100).toFixed(2))
    // 上传之前，先判断文件是否已经上传成功
    if (uploadPercent === 100) {
      message.success('上传成功')
      _this.setState({
        uploaded: true,    // 让进度条消失
        uploading: false
      })
    } else {
      _this.setState({
        uploaded: false,
        uploading: true
      })
    }

    _this.setState({
      uploadRequest: false,    // 上传请求成功
      currentChunks: currentChunks,
      uploadPercent
    })

    //进行分片上传
    this.handlePartUpload(uploadList)
  }

  handlePartUpload = (uploadList) => {
    //let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    const _this = this
    const batchSize = 1,    // 采用分治思想，每批上传的片数，越大越卡
      total = uploadList.length,   //获得分片的总数
      batchCount = total / batchSize    // 需要批量处理多少次
    let batchDone = 0     //已经完成的批处理个数
    doBatchAppend()
    function doBatchAppend() {
      if (batchDone < batchCount) {
        let list = uploadList.slice(batchSize * batchDone, batchSize * (batchDone + 1))
        setTimeout(() => silcePart(list), 2000);
      }
    }

    function silcePart(list) {
      var Console = console
      batchDone += 1;
      doBatchAppend();
      list.forEach((value) => {
        let { fileMd5, chunkMd5, chunk, start, end } = value
        let formData = new FormData(),
          blob = new Blob([_this.state.arrayBufferData[chunk - 1].currentBuffer], { type: 'application/octet-stream' }),
          params = `fileMd5=${fileMd5}&chunkMd5=${chunkMd5}&chunk=${chunk}&start=${start}&end=${end}&chunks=${_this.state.arrayBufferData.length}`

        const chunk_info = '{"subscript":"5","chunk":"5","hash":"81cc181194afc67fa7c52a88e57c2e52","username":"lyp970805@163.com"}'
        formData.append('chunk_info', chunk_info)
        formData.append('chunk', blob, chunkMd5)
        request
          .post('http://192.168.193.80:20521')
          .send(formData)
          .withCredentials()
          .retry(2)
          .end((err, res) => {
            Console.log(res);
            if (err) {
              alert('连接错误，请重新上传')
            }
            if (res.statusCode === 200) {
              let currentChunks = _this.state.currentChunks
              --currentChunks
              // 计算上传进度
              let uploadPercent = Number(((_this.state.chunksSize - currentChunks) / _this.state.chunksSize * 100).toFixed(2))
              _this.setState({
                currentChunks,  // 同步当前所需上传的chunks
                uploadPercent,
                uploading: true
              })
              if (currentChunks === 0) {
                // 调用验证api

                //_this.checkUploadStatus(_this.state.fileMd5)
                _this.setState({
                  uploading: false,
                  uploaded: true
                })
              }
            }
          })
      })
    }
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
      beforeUpload: (file) => {
        // 首先清除一下各种上传的状态
        _this.setState({
          uploaded: false,   // 上传成功
          uploading: false,  // 上传中
          uploadRequest: false   // 上传预处理
        })
        // 兼容性的处理
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
          chunkSize = 1024 * 5,                             // 切片每次5M
          chunks = Math.ceil(file.size / chunkSize),  //切片数量
          currentChunk = 0, // 当前上传的chunk
          spark = new SparkMD5.ArrayBuffer(),
          // 对arrayBuffer数据进行md5加密，产生一个md5字符串
          chunkFileReader = new FileReader(),  // 用于计算出每个chunkMd5
          totalFileReader = new FileReader()  // 用于计算出总文件的fileMd5

        let params = { chunks: [], file: {} },   // 用于上传所有分片的md5信息
          arrayBufferData = []              // 用于存储每个chunk的arrayBuffer对象,用于分片上传使用
        params.file.fileName = file.name
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
          params.chunks.push(obj)

          // 将每一块分片的arrayBuffer存储起来，用来partUpload
          let tmp = {
            chunk: obj.chunk,
            currentBuffer: e.target.result
          }
          arrayBufferData.push(tmp)

          if (currentChunk < chunks) {
            // 当前切片总数没有达到总数时
            loadNext()

            // 计算预处理进度
            _this.setState({
              preUploading: true,
              preUploadPercent: Number((currentChunk / chunks * 100).toFixed(2))
            })
          } else {
            //记录所有chunks的长度
            params.file.fileChunks = params.chunks.length
            //console.log(params)
            // 表示预处理结束，将上传的参数，arrayBuffer的数据存储起来
            _this.setState({
              preUploading: false,
              uploadParams: params,
              arrayBufferData,
              chunksSize: chunks,
              preUploadPercent: 100
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

        // 只允许一份文件上传
        _this.setState({
          fileList: [file],
          file: file
        })
        return false
      },
      //action: 'http://192.168.193.80:20521',
      fileList: _this.state.fileList,
    }



    return (
      <div className="content-inner">
        <Spin
          spinning={preUploading}
          style={{ height: 350 }}
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
          <div style={{ marginTop: 16, height: 250 }}>
            <Dragger {...uploadProp}>
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
            <Button
              disabled={!!(this.state.preUploadPercent < 100)}
              onClick={this.showConfirm}
              type="primary"
            >
              <Icon type="upload" />提交上传
            </Button>
          </div>
        </Spin>
      </div>
    )
  }
}

FileUpload.propTypes = {
  //...
}

export default FileUpload;