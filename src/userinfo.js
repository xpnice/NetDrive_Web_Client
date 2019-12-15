const init_state = {
  tree: {
    //path: store.getState().username,
    path: 'hello',
    content: [
      {
        path: '/空文件夹1',
        content: []
      },
      {
        path: '/文件1',
        info: { size: '3MB', uptime: '2019.12.9 20:20' },
      },
      {
        path: '/文件夹1',
        content: [
          {
            path: '/文件夹1/文件1',
            info: { size: '3MB', uptime: '2019.12.9 20:20' },
          },
          {
            path: '/文件夹1/文件2',
            info: { size: '10MB', uptime: '2019.12.9 20:00' },
          },
          {
            path: '/文件夹1/文件3',
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
  switch (action.type) {
    case 'sign': {
      return Object.assign({}, state, { username: action.username });
    }
    case 'signout': {
      return null;
    }
    case 'intree': {
      let files = { 
        name: action.tree.path.slice(action.tree.path.lastIndexOf('/') + 1), 
        files: [] };
      for (var file in action.tree.content) {
        let info
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
        files.files.push(info)
      }
      return Object.assign({}, state, { tree: action.tree, files });
    }
    default:
      return state;
  }
}