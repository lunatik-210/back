import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'mobx-react';

import {RootStore} from 'models';


let rootStore = RootStore.create({});


ReactDOM.render(
  <Provider stores={rootStore}>
    <App />
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
