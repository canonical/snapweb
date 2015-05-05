var Backbone = require('backbone');
var Snap = require('../src/js/models/snap.js');
var SnapLayoutView = require('../src/js/views/snap-layout.js');
var CONF = require('../src/js/config.js');

describe('SnapLayoutView', function() {

  beforeEach(function() {
    this.model = new Snap({
      status: CONF.INSTALL_STATE.UNINSTALLED,
      installActionString: 'Install'
    });
    this.view = new SnapLayoutView({
      model: this.model
    });
    this.view.render();
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

  it('should be thinking when installing', function() {
    this.model.set('status', CONF.INSTALL_STATE.INSTALLING);
    expect(this.view.ui.installer.hasClass('b-installer--thinking')).toBeTruthy();
  });

  it('should be thinking when uninstalling', function() {
    this.model.set('status', CONF.INSTALL_STATE.UNINSTALLING);
    expect(this.view.ui.installer.hasClass('b-installer--thinking')).toBeTruthy();
  });

  it('should not be thinking when installed', function() {
    this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
    expect(this.view.ui.installer.hasClass('b-installer--thinking')).toBeFalsy();
  });

  it('should not be thinking when uninstalled', function() {
    this.model.set('status', CONF.INSTALL_STATE.UNINSTALLED);
    expect(this.view.ui.installer.hasClass('b-installer--thinking')).toBeFalsy();
  });

  it('should deactivate install button if model has unrecognised status', function() {
    this.model.set('status', '');
    expect(this.view.ui.installer).not.toBe();
  });

  xit('should inform user when install succeeds', function() {
  });

  xit('should inform user when install fails', function() {
  });

  xit('should inform user of install progress', function() {
  });

  xit('should clear progress bar on completion', function() {
  });

  xit('should clear progress bar on error', function() {
  });
});
