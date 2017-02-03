var Backbone = require('backbone');
var Snap = require('../src/js/models/snap.js');
var SnapLayoutView = require('../src/js/views/snap-layout.js');
var CONF = require('../src/js/config.js');

describe('SnapLayoutView', function() {

  beforeEach(function() {
    this.mockModelFetchResponse = {
      status: CONF.INSTALL_STATE.INSTALLED,
      installActionString: 'Install',
      type: 'app',
    };

    this.model = new Snap(this.mockModelFetchResponse);
    this.view = new SnapLayoutView({
      model: this.model
    });
    this.view.render();

    this.uiInstaller = this.view.$el.find('.b-installer'); 
    this.uiEnabler = this.view.$el.find('.b-enabler');

    var self = this;
    this.model.fetch = function() {
      return self.mockModelFetchResponse;
    }
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
    expect(this.uiInstaller.hasClass('b-installer_thinking')).toBeTruthy();
  });

  it('should be thinking when removing', function() {
    this.model.set('status', CONF.INSTALL_STATE.REMOVING);
    expect(this.uiInstaller.hasClass('b-installer_thinking')).toBeTruthy();
  });

  it('should not be thinking when installed', function() {
    this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
    expect(this.uiInstaller.hasClass('b-installer_thinking')).toBeFalsy();
  });

  it('should not be thinking when removed', function() {
    this.model.set('status', CONF.INSTALL_STATE.REMOVED);
    expect(this.uiInstaller.hasClass('b-installer_thinking')).toBeFalsy();
  });

  it('should deactivate install button if model has unrecognised status', function() {
    this.model.set('status', '');
    expect(this.uiInstaller).not.toBe();
    expect(this.uiEnabler).not.toBe();
  });

  it('should not show enable/disable button for non removable snaps', function() {
    for (var i in CONF.NON_REMOVABLE_SNAP_TYPES) {
      this.mockModelFetchResponse.type =
        CONF.NON_REMOVABLE_SNAP_TYPES[i];
      this.model.fetch();
      this.view.render();
      var uiEnabler = this.view.$el.find('.b-enabler');
      expect(uiEnabler.length).toBe(0);
    }
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
