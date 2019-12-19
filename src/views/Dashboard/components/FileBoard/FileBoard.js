/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import MaterialTable from 'material-table';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import FileUpload from '../FileUpload'
import TreeContent from '../TreeContent'
import { forwardRef } from 'react';
import config from 'config.json'
import request from 'superagent'
import store from 'store'
import PropTypes from 'prop-types';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import { connect } from 'react-redux'
import md5 from 'md5'
import CircularIndeterminate from '../../../loading'
import { Progress, notification, Modal } from 'antd'
import 'antd/dist/antd.css';



//import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront';
import PanToolIcon from '@material-ui/icons/PanTool';
const tableIcons = {
  Add: forwardRef((props, ref) => <CreateNewFolderIcon {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
  CreateNewFolderIcon: forwardRef((props, ref) => <CreateNewFolderIcon {...props} ref={ref} />),
  CloudUploadIcon: forwardRef((props, ref) => <CloudUploadIcon {...props} ref={ref} />),
  Copy: forwardRef((props, ref) => <FlipToBackIcon {...props} ref={ref} />),
  Paste: forwardRef((props, ref) => <FlipToFrontIcon {...props} ref={ref} />),
  Move: forwardRef((props, ref) => <PanToolIcon {...props} ref={ref} />)
};
function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
const mapStateToProps = (store) => {
  return {
    prop4store: store
  }
}
//检查目录下是否由重名文件
function check_exist(path, tree) {
  for (var sub in tree.content) {
    if (tree.content[sub].path === path)
      return true
  }
  return false
}

//文件/文件夹改名
async function changename_request(newname, oldname) {
  var Console = console
  var oldpath = `${store.getState().tree.path}/${oldname}`
  var newpath = `${store.getState().tree.path}/${newname}`
  if (await check_exist(newpath, store.getState().tree)) {
    notification.error({
      message: '文件名重复！',
      description:
        '请不要重复命名，这会让我很迷惑',
      placement: 'bottomRight'
    });
    return
  }
  let data = { process: 'changename', username: store.getState().username, oldpath, newpath, oldpath_hash: md5(oldpath), newpath_hash: md5(newpath) }
  Console.log(`修改文件${oldname}名为${newname}请求:`, data)
  const url = 'http://' + config.server_addr + ':' + config.server_port;
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const json = await response.json();
    if (json.status === 'WRONG') {
      alert('建立文件夹失败')
      return
    }
    if (json.status === 'OK') {
      store.dispatch({ type: 'changename', oldname, newname })
      Console.log(`${oldname}删除成功`)
      return
    }
  } catch (error) {
    Console.error('Error:', error);
    alert('与服务器连接失败，请稍后重试!')
  }
}
//创建文件夹
async function mkdir_request(dirname) {
  var Console = console

  let data = { process: 'mkdir', username: store.getState().username, path: `${store.getState().tree.path}/${dirname}`, path_hash: md5(`${store.getState().tree.path}/${dirname}`) }
  if (await check_exist(data.path, store.getState().tree)) {
    notification.warn({
      message: '文件夹名重复！',
      description:
        `${dirname}已存在，换个名字吧`,
      placement: 'bottomRight'
    });
    return
  }
  Console.log('新建文件夹请求:', data)
  const url = 'http://' + config.server_addr + ':' + config.server_port;
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const json = await response.json();
    if (json.status === 'WRONG') {
      alert('建立文件夹失败')
      return
    }
    if (json.status === 'OK') {
      store.dispatch({ type: 'mkdir', dirname })
      Console.log('新建文件夹成功', dirname)
      return
    }

  } catch (error) {
    Console.error('Error:', error);
    alert('与服务器连接失败，请稍后重试!')
  }
}
//删除单个文件
async function single_delete(option, filename) {
  var Console = console
  // store.dispatch({ type: 'delete', filename })
  let data = { process: option, username: store.getState().username, path: `${store.getState().tree.path}/${filename}`, path_hash: md5(`${store.getState().tree.path}/${filename}`) }
  Console.log(`删除文件${filename}请求:`, data)
  const url = 'http://' + config.server_addr + ':' + config.server_port;
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const json = await response.json();
    if (json.status === 'WRONG') {
      alert('删除文件夹失败')
      return
    }
    if (json.status === 'OK') {
      store.dispatch({ type: 'delete', filename })
      Console.log(`${filename}删除成功`)
      return
    }

  } catch (error) {
    Console.error('Error:', error);
    Console.error('Rawresponse', error.rawResponse)
    alert('与服务器连接失败，请稍后重试!')
  }
}
//删除子文件夹遍历
async function traverse_delete(tree) {
  //如果是文件
  var init_tree = store.getState().tree
  if ('info' in tree)
    await single_delete('deletefile', tree.path.slice(tree.path.lastIndexOf('/') + 1))
  //如果是空文件夹
  else if (tree.content.length === 0)
    await single_delete('deletedir', tree.path.slice(tree.path.lastIndexOf('/') + 1))
  //非空文件夹
  else {
    store.dispatch({ type: 'intree', tree })//进入子目录
    while (true) {
      if (tree.content.length === 0)
        break;
      else {
        var content = tree.content.pop()
        if ('info' in content)
          await single_delete('deletefile', content.path.slice(content.path.lastIndexOf('/') + 1))
        //如果是空文件夹
        else if (content.content.length === 0)
          await single_delete('deletedir', content.path.slice(content.path.lastIndexOf('/') + 1))
        else {
          await traverse_delete(content)//遍历删除目录中的所有文件和文件夹
        }
      }
    }
    store.dispatch({ type: 'intree', tree: init_tree })//回到当前目录
    await single_delete('deletedir', tree.path.slice(tree.path.lastIndexOf('/') + 1))//最后删除自己
  }
}
//删除文件夹
async function delete_request(tree, oldData) {
  var Console = console
  var path_now = `${tree.path}/${oldData.filename}`
  var sub_tree
  for (var sub in tree.content)
    if (tree.content[sub].path === path_now) {
      sub_tree = tree.content[sub]
      break
    }
  Console.log('将要删除的树', sub_tree)
  await traverse_delete(sub_tree)//等待子目录删除完毕
  Console.log('完事了')
}
//文件显示窗口渲染
function MaterialTableDemo(props) {
  const { prop4store } = props;
  const [state, setState] = React.useState({
    selectedRow: null,
    dlpercent: 0,
    visible: false,
    confirmLoading: false,
    moveloading: false,
    columns: [
      {
        pasteinfo: null,
        field: 'url',
        title: 'Type',
        cellStyleL: { width: 60 },
        editable: 'never',
        render: rowData => {
          if (typeof (rowData) === 'undefined' || rowData.size === '-')
            return <FolderOutlinedIcon style={{ width: 40, borderRadius: '50%' }} />
          else
            return <InsertDriveFileOutlinedIcon style={{ width: 40, borderRadius: '50%' }} />
        }
      },
      { title: 'FileName', field: 'filename' },
      { title: 'Size', field: 'size', editable: 'never', type: 'numeric' },
      { title: 'Upload Time', field: 'uptime', editable: 'never', type: 'datetime' }
    ]
  });
  const [ulopen, setulOpen] = React.useState(false);
  const [dlopen, setdlOpen] = React.useState(false);
  const [mvopen, setmvOpen] = React.useState(false);
  const ulClickOpen = () => {
    setulOpen(true);
  };
  const ulhandleClose = () => {
    setulOpen(false);
  };
  const mvClickOpen = () => {
    setmvOpen(true);
  };
  const mvhandleClose = () => {
    setmvOpen(false);
  };
  const dlClickOpen = () => {
    setdlOpen(true);
  };
  const dlhandleClose = () => {
    setdlOpen(false);
  };
  //文件的下载
  const download = (path, rowData) => {
    //var can_down = false;

    var Console = console
    const Data = {
      process: 'downloadRequest',
      path: `${path}/${rowData.filename}`,
      path_hash: md5(`${path}/${rowData.filename}`)
    }
    Console.log('文件下载请求报文:', Data)
    request
      .post('http://' + config.server_addr + ':' + config.server_port)
      .send(JSON.stringify(Data))
      .withCredentials()
      .retry(2)
      .end((err, res) => {
        if (err) {
          Console.log('err', err.rawResponse)
          return
        }
        //Console.log('upload Request Response', res.body);
        if (res.statusCode === 200) {
          Console.log('从服务器获得请求响应:', res)
          if (res.body.status === 'OK') {
            var fileSize = res.body.size//获取文件大小
            Data.process = 'download'
            const url = 'http://' + config.server_addr + ':' + config.server_port;
            Promise.race([
              fetch(url, { method: 'POST', body: JSON.stringify(Data) }),
              new Promise(function (resolve, reject) {
                setTimeout(() => reject(new Error('request timeout')), 200000)
              })
            ])
              .then(async res => {
                let clone = res.clone()
                const reader = clone.body.getReader();
                // Step 3: read the data
                let receivedLength = 0; // received that many bytes at the moment
                let chunks = []; // array of received binary chunks (comprises the body)
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    break;
                  }
                  chunks.push(value);
                  receivedLength += value.length;
                  //Console.log(`收到 ${receivedLength}`)
                  setState({
                    ...state,
                    dlpercent: Number((receivedLength / fileSize * 100).toFixed(2))
                  })
                }
                return (res)
              })
              .then(res => res.blob().then(blob => {
                let a = document.createElement('a');
                let url = window.URL.createObjectURL(blob);
                let filename = rowData.filename;
                a.href = url;
                a.download = filename; //给下载下来的文件起个名字
                a.click();
                window.URL.revokeObjectURL(url);
                a = null;
                Console.log(`文件${rowData.filename}下载成功`)
                dlhandleClose()
              }
              )).catch((err) => {
                Console.log(`文件${rowData.filename}下载失败`, err)//请求失败
                dlhandleClose()
              });
          }
          else {
            alert('服务器响应错误')
            return
          }
        }
      })
  }
  //文件|文件夹的复制
  const copy = () => {
    if (state.selectedRow === null) {
      notification.warn({
        message: '无内容可复制！',
        description:
          '请先点击文件列表中的文件或文件夹再点击复制按钮',
        placement: 'bottomRight'
      });
    }
    else {
      let copy_path = `${prop4store.tree.path}/${state.selectedRow.filename}`
      for (var sub in prop4store.tree.content) {
        if (prop4store.tree.content[sub].path === copy_path) {
          let copyboard = prop4store.tree.content[sub]
          store.dispatch({ type: 'copy', copyboard })
          notification.success({
            message: ('content' in prop4store.tree.content[sub] ? `成功复制文件夹${state.selectedRow.filename}` : `成功复制文件${state.selectedRow.filename}`),
            description:
              '进入其他目录进行粘贴吧!',
            placement: 'bottomRight'
          });
        }
      }
    }
  }
  //获取复制的文件列表并更新
  const get_pastelist = (paste_list, tree_now) => {
    for (var sub in tree_now.content) {
      if ('info' in tree_now.content[sub]) //如果是文件加入粘贴文件列表
        paste_list.push(tree_now.content[sub])
      else if (tree_now.content[sub].content.length !== 0)  //如果是非空文件夹
        get_pastelist(paste_list, tree_now.content[sub])
    }
  }
  //粘贴请求
  const paste_request = async list => {
    const { info, username, oldpath, newpath, oldpath_hash, newpath_hash } = list
    var Console = console
    let data = {
      process: 'paste', username, path: oldpath, newpath, path_hash: oldpath_hash, newpath_hash
    }
    Console.log('粘贴请求:', data)
    //store.dispatch({ type: 'paste', info, newpath })
    const url = 'http://' + config.server_addr + ':' + config.server_port;
    try {
      const response = await fetch(url, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const json = await response.json();
      if (json.status === 'WRONG') {
        alert('粘贴失败')
        return
      }
      if (json.status === 'OK') {
        store.dispatch({ type: 'paste', info, newpath })
        Console.log('粘贴成功', info)
        return
      }
    } catch (error) {
      Console.error('Error:', error);
      alert('与服务器连接失败，请稍后重试!')
    }

  }
  //粘贴
  const paste = async () => {
    let tree = prop4store.tree
    let paste_list = []
    if ('content' in prop4store.copyboard && prop4store.copyboard.content.length === 0)//当前粘贴空文件夹
      mkdir_request(prop4store.copyboard.path.slice(prop4store.copyboard.path.lastIndexOf('/') + 1))
    else if ('info' in prop4store.copyboard)//当前粘贴文件
      paste_list.push(prop4store.copyboard)
    else get_pastelist(paste_list, prop4store.copyboard)//当前粘贴非空文件夹
    let request_list = []
    let dirname = prop4store.copyboard.path.slice(prop4store.copyboard.path.lastIndexOf('/'))
    for (var sub in paste_list) {
      request_list.push({
        username: prop4store.username,
        info: paste_list[sub].info,
        oldpath: paste_list[sub].path,
        newpath: paste_list[sub].path.replace(new RegExp(prop4store.copyboard.path, 'g'), `${tree.path}${dirname}`),
        oldpath_hash: md5(paste_list[sub].path),
        newpath_hash: md5(paste_list[sub].path.replace(new RegExp(prop4store.copyboard.path, 'g'), `${tree.path}${dirname}`))
      })
      await goto_path(request_list[sub].newpath)
      await paste_request(request_list[sub])
    }
    console.log('粘贴文件更新列表', request_list)
    store.dispatch({ type: 'intree', tree })//返回根目录
  }
  const move = async () => {
    if (-1 === prop4store.copyboard.path.slice(0, prop4store.copyboard.path.lastIndexOf('/')).indexOf(prop4store.tree.path)) {
      notification.error({
        message: '套娃行为是严厉禁止的！',
        description:
          '请不要把父文件夹移动到子文件夹中',
        placement: 'bottomRight'
      });
      return
    }
    setState({
      ...state,
      moveloading: true
    });
    await paste()
    await store.dispatch({ type: 'intree', tree: state.oldtree })//进入原目录进行删除
    await delete_request(state.oldtree, state.rowData)
    setState({
      ...state,
      moveloading: false
    });
  }
  const showModal = () => {
    if (prop4store.copyboard === null) {
      notification.warning({
        message: '无内容可粘贴！',
        description:
          '请先点击文件列表中的文件或文件夹再点击复制按钮',
        placement: 'bottomRight'
      });
    }
    else {
      setState({
        ...state,
        pasteinfo: prop4store.copyboard.path,
        visible: true,
      });
    }

  };
  const goto_path = async path => {
    var Console = console
    var temp_path = path.slice()
    var dirnames = temp_path.split('/')
    Console.log(dirnames)
    if (store.getState().init_tree.path !== dirnames[0]) {//跟目录名字不匹配
      alert('根目录名不匹配，请检查')
      return
    }
    dirnames.splice(0, 1)//删除路径中的根目录
    dirnames.pop()//删除路径中的文件名
    var tree_now = store.getState().init_tree//获取根目录
    store.dispatch({ type: 'intree', tree: tree_now })//进入根目录
    var content_now = store.getState().tree.content//获取根目录的文件内容
    for (var pos in dirnames) {
      Console.log(`正在查找${dirnames[pos]}文件夹 `)
      var found = false//初始化未找到
      for (var dir in content_now) {
        //如果找到了文件夹，则寻找下一个子目录
        if ('content' in content_now[dir] && dirnames[pos] === content_now[dir].path.slice(content_now[dir].path.lastIndexOf('/') + 1)) {
          Console.log(`找到了${dirnames[pos]}文件夹`)
          found = true
          break
        }
      }
      //如果没找到
      if (!found) {
        Console.log(`未找到${dirnames[pos]}文件夹，正在新建`)
        await mkdir_request(dirnames[pos])
      }
      //进入目录的下一层
      content_now = store.getState().tree.content//获取更新后当前目录的文件内容
      for (dir in content_now) {
        if ('content' in content_now[dir] && dirnames[pos] === content_now[dir].path.slice(content_now[dir].path.lastIndexOf('/') + 1)) {
          store.dispatch({ type: 'intree', tree: content_now[dir] })//进入该子目录
          content_now = content_now[dir].content//获取该子目录的目录文件
          break;
        }
      }
    }
  }
  const handleOk = async () => {
    setState({
      ...state,
      confirmLoading: true,
    });
    //检查目录下是否由重名文件
    if (check_exist(prop4store.copyboard.path, prop4store.tree)) {
      setState({
        ...state,
        visible: false,
        confirmLoading: false,
      });
      Modal.error({
        title: '当前路径下存在同名文件',
        content: '请检查路径，删除同名文件或修改文件名',
      });
    }
    else {
      await paste()
      new Promise((resolve) => {
        setTimeout(() => {
          setState({
            ...state,
            visible: false,
            confirmLoading: false,
          });
          resolve();
        }, 600);
      })

    }
  };
  const handleCancel = () => {
    console.log('Clicked cancel button');
    setState({
      ...state,
      visible: false,
    });
  };
  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title={prop4store.files.name}
        columns={state.columns}
        doubleHorizontalScroll={true}
        data={prop4store.files.files}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              
              setTimeout(() => {
                //在store中更新目录树和目录内容
                changename_request(newData.filename, oldData.filename)
                resolve()
              }, 600)
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                delete_request(prop4store.tree, oldData)
                resolve();
              }, 600);
              notification.success({
                message: '删除成功！',
                description:
                  `${oldData.filename}已经删除干净了`,
                placement: 'bottomRight'
              });
            }),
          onRowAdd: (newData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                //在store中更新目录树和目录内容
                mkdir_request(newData.filename)
                resolve()
              }, 600)
              notification.success({
                message: '文件夹新建成功！',
                description:
                  `${newData.filename}建立成功`,
                placement: 'bottomRight'
              });
            }),
        }}
        actions={[
          {
            icon: tableIcons.Copy,
            tooltip: 'Copy',
            isFreeAction: true,
            onClick: copy,
          },
          {
            icon: tableIcons.Paste,
            tooltip: 'Paste',
            isFreeAction: true,
            onClick: showModal,
          },
          {
            icon: tableIcons.Move,
            tooltip: 'Move File To',
            isFreeAction: false,
            onClick: (event, rowData) => {
              var oldtree = store.getState().tree
              mvClickOpen()
              let copy_path = `${prop4store.tree.path}/${rowData.filename}`
              for (var sub in prop4store.tree.content) {
                if (prop4store.tree.content[sub].path === copy_path) {
                  let copyboard = prop4store.tree.content[sub]
                  store.dispatch({ type: 'copy', copyboard })
                }
              }
              setState({ ...state, oldtree, rowData })
            }
          },
          {
            icon: tableIcons.CloudUploadIcon,
            tooltip: 'Upload File',
            isFreeAction: true,
            onClick: ulClickOpen,
          },
          {
            icon: tableIcons.Export,
            tooltip: 'Download File',
            onClick: (event, rowData) => {
              if (rowData.size === '-') {
                notification.info({
                  message: '下载失败！',
                  description:
                    '很抱歉我们暂不支持文件夹下载',
                  placement: 'bottomRight'
                });
              }
              else {
                dlClickOpen()
                download(prop4store.tree.path, rowData)
              }

            }
          }
        ]}
        onRowClick={((evt, selectedRow) => {
          if (evt.nativeEvent.detail === 1) {
            if (state.selectedRow === null || selectedRow.tableData.id !== state.selectedRow.tableData.id) {
              setState({ ...state, selectedRow })
              return
            }
            if (selectedRow.tableData.id === state.selectedRow.tableData.id)
              setState({ ...state, selectedRow: null })
          }
          if (evt.nativeEvent.detail === 2 && selectedRow.size === '-') {
            let tree_now = prop4store.tree.content.filter(tree_temp => { return tree_temp.path === `${prop4store.tree.path}/${selectedRow.filename}` });
            //console.log(tree_now[0])
            store.dispatch({ type: 'intree', tree: tree_now[0] })
          }
        })}
        options={{
          actionsColumnIndex: state.columns.length,
          addRowPosition: 'first',
          rowStyle: rowData => ({
            backgroundColor: (state.selectedRow && state.selectedRow.tableData.id === rowData.tableData.id) ? '#EEE' : '#FFF'
          })
        }}
      />
      <Dialog
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        onClose={ulhandleClose}
        open={ulopen}
        maxWidth='md'
        scroll="paper"
        fullWidth={true}
      >
        <FileUpload />
      </Dialog>
      <Dialog
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        onClose={mvhandleClose}
        open={mvopen}
        maxWidth='md'
        scroll="paper"
        fullWidth={true}

      >
        <DialogTitle id="max-width-dialog-title">选择目标文件夹</DialogTitle>
        <DialogContent style={{ height: 500 }}>
          <TreeContent store={store} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => move()} color="primary" disabled={state.moveloading ? true : false}>
            {state.moveloading ? <CircularIndeterminate /> : '确认'}
          </Button>
          <Button onClick={() => setmvOpen(false)} color="primary">
            取消
          </Button>
        </DialogActions>

      </Dialog>
      <Dialog
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        open={dlopen}
      >
        <Progress
          type="circle"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          style={{ marginTop: 60, marginBottom: 60, marginLeft: 60, marginRight: 60 }}
          percent={state.dlpercent}
        />
      </Dialog>
      <Modal
        title="Title"
        visible={state.visible}
        onOk={handleOk}
        confirmLoading={state.confirmLoading}
        onCancel={handleCancel}
        forceRender={true}
        mask={false}
      >
        {`确认要把${state.pasteinfo}粘贴到当前目录吗`}
      </Modal>
    </div >
  );
}
export default connect(mapStateToProps)(MaterialTableDemo)
MaterialTableDemo.propTypes = {
  prop4store: PropTypes.object
};