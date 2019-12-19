const init_state = {
  copyboard: null,
  tree: {
    //path: store.getState().username,
    path: 'hello',
    content: [
      {
        path: 'hello/空文件夹1',
        content: []
      },
      {
        path: 'hello/文件1',
        info: { size: '3MB', uptime: '2019.12.9 20:20' },
      },
      {
        path: 'hello/文件夹1',
        content: [
          {
            path: 'hello/文件夹1/文件1',
            info: { size: '3MB', uptime: '2019.12.9 20:20' },
          },
          {
            path: 'hello/文件夹1/文件2',
            info: { size: '10MB', uptime: '2019.12.9 20:00' },
          },
          {
            path: 'hello/文件夹1/文件3',
            info: { size: '12MB', uptime: '2019.12.9 20:20' },
          }
        ]
      }
    ]
  },
  init_tree: {
    //path: store.getState().username,
    path: 'hello',
    content: [
      {
        path: 'hello/空文件夹1',
        content: []
      },
      {
        path: 'hello/文件1',
        info: { size: '3MB', uptime: '2019.12.9 20:20' },
      },
      {
        path: 'hello/文件夹1',
        content: [
          {
            path: 'hello/文件夹1/文件1',
            info: { size: '3MB', uptime: '2019.12.9 20:20' },
          },
          {
            path: 'hello/文件夹1/文件2',
            info: { size: '10MB', uptime: '2019.12.9 20:00' },
          },
          {
            path: 'hello/文件夹1/文件3',
            info: { size: '12MB', uptime: '2019.12.9 20:20' },
          }
        ]
      }
    ]
  },
  username: 'hello',
  files: {
    name: 'hello',
    files: []
  }
}

export default (state = init_state, action) => {
  let files, file, info, tree;
  var Console = console
  switch (action.type) {
    case 'signin': {//用户登录，同步用户名和网盘的目录树以及目录结构，缺省打开根目录
      files = {
        name: action.tree.path.slice(action.tree.path.lastIndexOf('/') + 1),
        files: []
      };
      for (file in action.tree.content) {
        if ('info' in action.tree.content[file]) {//如果是文件
          info = {
            filename: action.tree.content[file].path.slice(action.tree.content[file].path.lastIndexOf('/') + 1),
            ...action.tree.content[file].info
          }
        }
        else info = {//否则是文件夹
          filename: action.tree.content[file].path.slice(action.tree.content[file].path.lastIndexOf('/') + 1),
          size: '-',
          uptime: '-'
        }
        files.files.push(info)
      }
      return Object.assign({}, state, { username: action.username, tree: action.tree, files, init_tree: action.tree });
    }
    case 'signout': {//登出
      return null;
    }
    case 'intree': {//目录树点击一个文件夹，目录内容同步更新
      files = {
        name: action.tree.path.slice(action.tree.path.lastIndexOf('/') + 1),
        files: []
      };
      for (file in action.tree.content) {
        if ('info' in action.tree.content[file]) {
          info = {
            filename: action.tree.content[file].path.slice(action.tree.content[file].path.lastIndexOf('/') + 1),
            ...action.tree.content[file].info
          }
        }
        else info = {
          filename: action.tree.content[file].path.slice(action.tree.content[file].path.lastIndexOf('/') + 1),
          size: '-',
          uptime: '-'
        }
        files.files.unshift(info)
      }
      return Object.assign({}, state, { tree: action.tree, files });
    }
    case 'delete': {//删除某个文件
      tree = Object.assign({}, state.tree);
      for (file in tree.content) {
        if (tree.content[file].path === `${state.tree.path}/${action.filename}`) {
          tree.content.splice(file, 1);
          Console.log(`删除目录${state.tree.path}下的文件${action.filename}`)
        }
      }
      files = Object.assign({}, state.files);
      for (file in files.files) {
        if (files.files[file].filename === action.filename) {
          files.files.splice(file, 1)
          // Console.log(`删除目录${state.tree.path}下的文件${action.oldData.filename}`)
        }
      }
      return Object.assign({}, state, { tree, files });
    }
    case 'changename': {//修改文件/文件夹名字
      tree = Object.assign({}, state.tree);
      var oldpath = `${state.tree.path}/${action.oldname}`
      var newpath = `${state.tree.path}/${action.newname}`
      for (file in tree.content) {
        if (tree.content[file].path === `${state.tree.path}/${action.oldname}`) {
          var sub_string = JSON.stringify(tree.content[file])
          sub_string = sub_string.replace(new RegExp(oldpath, 'g'), newpath)
          sub_string = JSON.parse(sub_string)
          Console.log(sub_string)
          tree.content[file] = sub_string
        }
      }
      files = Object.assign({}, state.files);

      for (file in files.files) {
        if (files.files[file].filename === action.oldname) {
          files.files[file].filename = action.newname
          break
        }
      }
      return Object.assign({}, state, { tree, files });
    }
    case 'mkdir': {//新建一个文件夹
      let newdir = { path: `${state.tree.path}/${action.dirname}`, content: [] }
      tree = Object.assign({}, state.tree);
      tree.content.unshift(newdir)
      let newfile = { filename: action.dirname, size: '-', uptime: '-', }
      files = Object.assign({}, state.files);
      files.files.unshift(newfile)
      return Object.assign({}, state, { tree, files });
    }
    case 'upload': {//上传文件
      let newdir = { path: `${state.tree.path}/${action.file.fileName}`, info: { size: action.file.fileSize, uptime: action.file.uptime } }
      tree = Object.assign({}, state.tree);
      tree.content.unshift(newdir)
      let newfile = { filename: action.file.fileName, size: action.file.fileSize, uptime: action.uptime }
      files = Object.assign({}, state.files);
      files.files.unshift(newfile)
      return Object.assign({}, state, { tree, files });
    }
    case 'copy': {
      return Object.assign({}, state, { copyboard: action.copyboard });
    }
    case 'paste': {
      let newdir = {
        path: action.newpath,
        info: {
          size: action.info.size,
          uptime: action.info.uptime
        }
      }
      tree = Object.assign({}, state.tree);
      tree.content.unshift(newdir)
      let newfile = {
        filename: action.newpath.slice(action.newpath.lastIndexOf('/') + 1),
        size: action.info.size,
        uptime: action.info.uptime
      }
      files = Object.assign({}, state.files);
      files.files.unshift(newfile)
      return Object.assign({}, state, { tree, files });
    }

    default:
      return state;
  }
}