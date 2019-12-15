import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
//import store from 'store'

import * as serviceWorker from './serviceWorker';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
