import React, { Component } from 'react'
import PropTypes from 'prop-types'
import 'antd/dist/antd.css';

import { Upload, Icon, Button, Progress, Checkbox, Modal, Spin, Radio, message } from 'antd'

//import request from 'superagent'
//import SparkMD5 from 'spark-md5'

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


  preUpload = () => {
    // requestUrl,返回可以上传的分片队列
    //...
  }

  handlePartUpload = (uploadList) => {
    // 分片上传
    // ...
  }
  render() {
    const { preUploading, uploadPercent, preUploadPercent, uploadRequest, uploaded, uploading } = this.state
    const _this = this
    const uploadProp = {
      onRemove: (file) => {
        // ...
      },
      beforeUpload: (file) => {
        // ...对文件的预处理

      },
      fileList: this.state.fileList,
    }

    return (
      <div className="content-inner">
        <Spin
          tip={
            <div >
              <h3
                style={{ margin: '10px auto', color: '#1890ff' }}>
                文件预处理中...
              </h3>
              <Progress width={80}
                percent={preUploadPercent}
                type="circle"
                status="active" />
            </div>
          }
          spinning={preUploading}
          style={{ height: 350 }}>
          <div style={{ marginTop: 16, height: 250 }}>
            <Dragger {...uploadProp}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">点击或者拖拽文件进行上传</p>
              <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
            </Dragger>
            {uploadPercent >= 0 && !!uploading && <div style={{ marginTop: 20, width: '95%' }}>
              <Progress percent={uploadPercent} status="active" />
              <h4>文件上传中，请勿关闭窗口</h4>
            </div>}
            {!!uploadRequest && <h4 style={{ color: '#1890ff' }}>上传请求中...</h4>}
            {!!uploaded && <h4 style={{ color: '#52c41a' }}>文件上传成功</h4>}
            <Button type="primary" onClick={this.showConfirm} disabled={!!(this.state.preUploadPercent < 100)}>
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