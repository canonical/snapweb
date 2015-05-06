var _ = require('lodash');
var Snap = require('../src/js/models/snap.js');
var Backbone = require('backbone');
var CONF = require('../src/js/config.js');

describe('Snap', function() {

  describe('instance/construction', function() {

    beforeEach(function() {
      this.model = new Snap({id: 'foo'});
    });

    afterEach(function() {
      delete this.model;
    });

    it('should be an instance of Backbone.Model', function() {
      expect(Snap).toBeDefined();
      expect(this.model).toEqual(jasmine.any(Backbone.Model));
    });

    it('should have urlRoot prop from config', function() {
      var expectedPath = CONF.PACKAGES;
      expect(this.model.urlRoot).toBe(CONF.PACKAGES);
    });

    it('should have default icon', function() {
      expect(this.model.get('icon')).toBeDefined();
    });

  });

  describe('setInstallActionString', function() {

    beforeEach(function() {
      this.model = new Snap({id: 'foo'});
    });

    afterEach(function() {
      delete this.model;
    });

    it('should set installActionString from model state', function() {
      this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
      expect(this.model.get('installActionString')).toBe('Uninstall');

      this.model.set('status', CONF.INSTALL_STATE.UNINSTALLED);
      expect(this.model.get('installActionString')).toBe('Install');

      this.model.set('status', CONF.INSTALL_STATE.UNINSTALLING);
      expect(this.model.get('installActionString')).toBe('Uninstalling…');

      this.model.set('status', CONF.INSTALL_STATE.INSTALLING);
      expect(this.model.get('installActionString')).toBe('Installing…');

    });

    it('should unset installActionString if unrecognised model state', function() {
      this.model.set('status', 'errror');
      expect(this.model.get('installActionString')).toBe(undefined);

      this.model.set('status', 'foo');
      expect(this.model.get('installActionString')).toBe(undefined);

      this.model.unset('status');
      expect(this.model.get('installActionString')).toBe(undefined);
    });

  });

  describe('sync methods', function() {

    beforeEach(function() {
      jasmine.Ajax.install();
      this.model = new Snap({id: 'foo'});
      spyOn(this.model, 'save').and.callThrough();
      spyOn(this.model, 'fetch');
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
      delete this.model;
      this.model = null;
    });

    it('should poll fetch on save() HTTP 202 until HTTP 200', function(done) {
      var model = this.model;
      model.on('sync', function() {
        _.delay(function(model) {
          expect(model.fetch).toHaveBeenCalled();
          done();
        }, CONF.INSTALL_POLL_WAIT * 2, model);
      });
      model.save({
        status: 'installing'
      });
      expect(model.save).toHaveBeenCalled();
      expect(model.fetch).not.toHaveBeenCalled();

      jasmine.Ajax.requests.mostRecent().respondWith({
        'status': 202,
        'contentType': 'application/json',
        'responseText': '{}'
      });
    });

    it('should not poll fetch on save() and HTTP 200', function(done) {
      var model = this.model;
      model.on('sync', function() {
        _.delay(function(model) {
          expect(model.fetch).not.toHaveBeenCalled();
          done();
        }, CONF.INSTALL_POLL_WAITi * 2, model);
      });
      model.save({
        status: 'installing'
      });
      expect(model.save).toHaveBeenCalled();
      expect(model.fetch).not.toHaveBeenCalled();

      jasmine.Ajax.requests.mostRecent().respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': '{}'
      });
    });
  });
});
