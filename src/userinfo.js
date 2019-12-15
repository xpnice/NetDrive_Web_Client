const init_state = {
  tree: {
    "path": "1033173161@qq.com",
    "content": [
      {
        "path": "1033173161@qq.com/01",
        "content": []
      },

      {
        "path": "1033173161@qq.com/2.txt",
        "info": { "size": "12345", "uptime": "2019-12-15 18:58" }
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
        files: []
      };
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