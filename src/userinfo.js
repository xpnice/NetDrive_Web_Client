export default (state = { username: null }, action) => {
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