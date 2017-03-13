
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import App from '../views/app';
import BackboneLayout from '../components/backbone-layout';

var homeController = require('../controllers/home.js');
var searchController = require('../controllers/search.js');
var storeController = require('../controllers/store.js');
var settingsController = require('../controllers/settings.js');
var snapController = require('../controllers/snaps.js');
var tokenController = require('../controllers/token.js');


const ControllerShim = (controller, method, isQuery = false) =>
  (props) => React.createElement(BackboneLayout, {controller, method, isQuery, ...props});

export default (
  <Route path='/' component={App}>
    <IndexRoute component={ControllerShim(homeController, 'index')}/>
    <Route path='store' component={ControllerShim(storeController, 'index')}/>
    <Route path='store/section/:section' component={ControllerShim(storeController, 'section')}/>
    <Route path='settings' component={ControllerShim(settingsController, 'index')}/>
    <Route path='snap/:id' component={ControllerShim(snapController, 'snap')}/>
    <Route path='search' component={ControllerShim(searchController, 'query', true)}/>
    <Route path='access-control' component={ControllerShim(tokenController, 'index')}/>
    <Redirect from='*' to='/'/>
  </Route>
);
