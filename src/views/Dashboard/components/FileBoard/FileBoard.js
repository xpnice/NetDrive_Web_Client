/* eslint-disable react/no-multi-comp */
import React from 'react';
import MaterialTable from 'material-table';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import FileUpload from '../FileUpload'
import { forwardRef } from 'react';
import config from 'config.json'


import AddBox from '@material-ui/icons/AddBox';
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
import store from 'store'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
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
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

async function download() {
  var can_down = true;
  var Console = console
  const Data = {
    process: 'downloadRequest',
  }
  Console.log('文件下载请求报文:', Data)
  // request
  //   .post('http://' + config.server_addr + ':' + config.server_port)
  //   .send(JSON.stringify(Data))
  //   .withCredentials()
  //   .retry(2)
  //   .end((err, res) => {
  //     if (err) {
  //       Console.log(err.rawResponse)
  //       return
  //     }
  //     //Console.log('upload Request Response', res.body);
  //     if (res.statusCode === 200) {
  //       Console.log('从服务器获得请求响应:', res)
  //     }

  //   })
  if (can_down) {
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
        //let filename = res.headers.get('Content-Disposition');
        let filename = 'hello.docx';
        Console.log(filename)
        if (filename) {
          //filename = filename.match(/\"(.*)\"/)[1]; //提取文件名
          a.href = url;
          a.download = filename; //给下载下来的文件起个名字
          a.click();
          window.URL.revokeObjectURL(url);
          a = null;
        }
      }
      )).catch((err) => {
        Console.log('文件下载失败', err)//请求失败
      });


  }
}

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
function MaterialTableDemo(props) {
  const { prop4store } = props;
  var Console = console
  //var tree = 
  var data = [];
  //var title 
  //if (store.getState().tree)
  //title = store.getState().tree.path
  const [state, setState] = React.useState({
    columns: [
      { title: 'FileName', field: 'filename' },
      { title: 'Size', field: 'size', editable: 'never' },
      { title: 'Upload Time', field: 'uptime', editable: 'never' },
    ],
    data: [
      { filename: 'Mehmet', size: '3MB', uptime: '2019.12.9 20:20' },
      { filename: 'hello', size: '215KB', uptime: '2019.12.9 20:34' },
    ],
    title: store.getState().tree === null ? 'tree' : store.getState().tree.path
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
        data={prop4store.files.files}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                if (oldData) {
                  setState(prevState => {
                    const data = [...prevState.data];
                    data[data.indexOf(oldData)] = newData;
                    return { ...prevState, data };
                  });
                }
              }, 600);
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                setState(prevState => {
                  const data = [...prevState.data];
                  data.splice(data.indexOf(oldData), 1);
                  return { ...prevState, data };
                });
              }, 600);
            }),
        }}
        actions={[
          {
            icon: tableIcons.Add,
            tooltip: 'Upload File',
            isFreeAction: true,
            onClick: handleClickOpen,
          },
          {
            icon: tableIcons.Export,
            tooltip: 'Download File',
            onClick: (event, rowData) => alert("You saved " + rowData.name)
          }
        ]}
      />
      <input type="button" value="下载" onClick={download} />
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
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