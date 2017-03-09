import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import routes from './routers/router'; // FIXME: silly path

$(document).ajaxError((event, jqxhr, settings, exception) => {
  if (jqxhr.status === 401 && window.location.pathname != '/access-control') {
    browserHistory.push('/access-control');
  }
});

ReactDOM.render(
  <Router
    history={browserHistory}
    routes={routes} />,
  document.getElementById('snapweb')
);


