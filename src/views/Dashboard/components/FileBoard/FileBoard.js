/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import MaterialTable from 'material-table';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import FileUpload from '../FileUpload'
import { forwardRef } from 'react';
import config from 'config.json'
import request from 'superagent'
import store from 'store'
import PropTypes from 'prop-types';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import { connect } from 'react-redux'


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
  CloudUploadIcon: forwardRef((props, ref) => <CloudUploadIcon {...props} ref={ref} />)

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
//文件的下载
async function download(path, rowData) {
  //var can_down = false;
  var Console = console
  const Data = {
    process: 'downloadRequest',
    path: `${path}/${rowData.filename}`
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
                Console.log(`收到 ${receivedLength}`)
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
            }
            )).catch((err) => {
              Console.log(`文件${rowData.filename}下载失败`, err)//请求失败
            });
        }
        else {
          alert('服务器响应错误')
          return
        }
      }
    })
}
//文件/文件夹改名
async function changename_request(newname, oldname) {
  var Console = console
  var oldpath = `${store.getState().tree.path}/${oldname}`
  var newpath = `${store.getState().tree.path}/${newname}`
  let data = { process: 'changename', username: store.getState().username, oldpath, newpath }
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
  let data = { process: 'mkdir', username: store.getState().username, path: `${store.getState().tree.path}/${dirname}` }
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
async function single_delete(oldData) {
  var Console = console
  let data = { process: 'deletedir', username: store.getState().username, path: `${store.getState().tree.path}/${oldData.filename}` }
  Console.log(`删除文件${oldData.filename}请求:`, data)
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
      store.dispatch({ type: 'delete', oldData })
      Console.log(`${oldData.filename}删除成功`, oldData.filename)
      return
    }

  } catch (error) {
    Console.error('Error:', error);
    Console.error('Rawresponse', error.rawResponse)
    alert('与服务器连接失败，请稍后重试!')
  }
}
//删除文件夹
async function delete_request(oldData) {
  var Console = console
  Console.log(oldData)
  single_delete(oldData)
}
function MaterialTableDemo(props) {
  const { prop4store } = props;
  const [state, setState] = React.useState({
    selectedRow: null,
    columns: [
      {
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
    ],
    data: [
      { filename: 'Mehmet', size: '3MB', uptime: '2019.12.9 20:20' },
      { filename: 'hello', size: '215KB', uptime: '2019.12.9 20:34' },
    ],
    //title: store.getState().tree === null ? 'tree' : store.getState().tree.path
  });
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
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
                delete_request(oldData)
                resolve();
              }, 600);
            }),
          onRowAdd: (newData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                //在store中更新目录树和目录内容
                mkdir_request(newData.filename)
                resolve()
              }, 600)
            }),
        }}
        actions={[
          {
            icon: tableIcons.CloudUploadIcon,
            tooltip: 'Upload File',
            isFreeAction: true,
            onClick: handleClickOpen,
          },
          {
            icon: tableIcons.Export,
            tooltip: 'Download File',
            onClick: (event, rowData) => download(prop4store.tree.path, rowData)
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
        onClose={handleClose}
        open={open}
      >
        <FileUpload />
      </Dialog>
    </div>
  );
}
export default connect(mapStateToProps)(MaterialTableDemo)
MaterialTableDemo.propTypes = {
  prop4store: PropTypes.object
};