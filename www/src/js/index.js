import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import routes from './routers/router'; // FIXME: silly path


ReactDOM.render(
  <Router
    history={browserHistory}
    routes={routes} />,
  document.getElementById('snapweb')
);
