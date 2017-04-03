var $ = require('jquery');
var Backbone = require('backbone');
var Snap = require('../src/js/models/snap.js');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var SnapDetailsView = require('../src/js/views/snap-details.js');
var CONF = require('../src/js/config.js');

describe('PricedSnapView', function() {

  beforeEach(function() {
    this.model = new Snap({
      status: CONF.INSTALL_STATE.PRICED,
      id: 'foo',
      price: '1',
    });
    this.view = ReactDOMServer.renderToStaticMarkup(
      React.createElement(SnapDetailsView, {
        model: this.model
      }));
  });

  afterEach(function() {
    delete this.model;
  });

  it('should be an instance of Backbone.View', function() {
    expect(SnapDetailsView).toBeDefined();
  });

  it('priced snap should not be installable', function() {
    var s = this.model.get('status');
    $(this.view).find('button').click();
    expect(s).toMatch(this.model.get('status'));
  });
});
