export default (state = { username: 'lyp970805' }, action) => {
  switch (action.type) {
    case 'sign': {
      return Object.assign({}, state, { username: action.username });
    }
    case 'signout': {
      return null;
    }
    default:
      return state;
  }
}