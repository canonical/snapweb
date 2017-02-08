var Backbone = require('backbone');
var Snap = require('../src/js/models/snap.js');
var SnapLayoutView = require('../src/js/views/snap-layout.js');
var CONF = require('../src/js/config.js');

describe('PricedSnapView', function() {

  beforeEach(function() {
    this.model = new Snap({
      status: CONF.INSTALL_STATE.PRICED,
      id: 'foo',
      price: '1',
    });
    this.view = new SnapLayoutView({
      model: this.model
    });
    this.view.render();

    this.uiInstaller = this.view.$el.find('.b-installer'); 
  });

  afterEach(function() {
    this.view.remove();
    delete this.model;
    delete this.view;
  });

  it('should be an instance of Backbone.View', function() {
    expect(SnapLayoutView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('priced snap should not be installable', function() {
    var s = this.view.model.get('status');
    this.view.$el.find('button').trigger('click');
    expect(s).toMatch(this.view.model.get('status'));
  });
});
