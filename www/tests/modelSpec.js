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

  describe('parse', function() {

    beforeEach(function() {
      this.model = new Snap();
    });

    afterEach(function() {
      delete this.model;
    });

    it('sets isInstalled', function() {
      var response;

      response = this.model.parse({state: { status: CONF.INSTALL_STATE.REMOVED} });
      expect(response.isInstalled).toBeFalsy();

      response = this.model.parse({state: { status: CONF.INSTALL_STATE.ACTIVE} });
      expect(response.isInstalled).toBeTruthy();

      response = this.model.parse({state: { status: CONF.INSTALL_STATE.REMOVING} });
      expect(response.isInstalled).toBeTruthy();

      response = this.model.parse({state: { status: CONF.INSTALL_STATE.INSTALLED} });
      expect(response.isInstalled).toBeTruthy();

      response = this.model.parse({state: { status: CONF.INSTALL_STATE.INSTALLING} });
      expect(response.isInstalled).toBeFalsy();
    });

    it('sets default icon if empty', function() {
      var response;

      response = this.model.parse({icon: '/icon.png'});
      expect(response.icon).toBe('/icon.png');

      response = this.model.parse({icon: ''});
      expect(response.icon).toBe(this.model.defaults.icon);
    });

    it('sets isInstallable', function() {
      var response;

      expect(this.model.get('isInstallable')).toBeTruthy(); // default

      response = this.model.parse({id: 'snapweb'});
      expect(response.isInstallable).toBe(false);

      response = this.model.parse({id: 'ubuntu-core'});
      expect(response.isInstallable).toBe(false);

      response = this.model.parse({type: 'gadget'});
      expect(response.isInstallable).toBe(false);
    });
  });

  describe('setInstallHTMLClass', function() {

    beforeEach(function() {
      this.model = new Snap({id: 'foo'});
    });

    afterEach(function() {
      delete this.model;
    });

    it('should set installHTMLClass from model status', function() {
      for (var i in CONF.NON_REMOVABLE_SNAP_TYPES) {
        this.model.set('type', CONF.NON_REMOVABLE_SNAP_TYPES[i]);
        this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
        expect(this.model.get('installHTMLClass')).not.toContain('remove');
      }
      this.model.set('type', 'app');

      this.model.set('status', CONF.INSTALL_STATE.REMOVED);
      expect(this.model.get('installHTMLClass')).toContain('install');

      this.model.set('status', CONF.INSTALL_STATE.INSTALLING);
      expect(this.model.get('installHTMLClass')).toContain('thinking');
      expect(this.model.get('installHTMLClass')).toContain('install');

      this.model.set('status', CONF.INSTALL_STATE.REMOVING);
      expect(this.model.get('installHTMLClass')).toContain('remove');
      expect(this.model.get('installHTMLClass')).toContain('thinking');

      this.model.set('status', CONF.INSTALL_STATE.ACTIVE);
      expect(this.model.get('installHTMLClass')).toContain('remove');

      this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
      expect(this.model.get('installHTMLClass')).toContain('remove');
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
      expect(this.model.get('installActionString')).toBe('Remove');

      this.model.set('status', CONF.INSTALL_STATE.ACTIVE);
      expect(this.model.get('installActionString')).toBe('Remove');

      this.model.set('status', CONF.INSTALL_STATE.REMOVED);
      expect(this.model.get('installActionString')).toBe('Install');

      this.model.set('status', CONF.INSTALL_STATE.REMOVING);
      expect(this.model.get('installActionString')).toBe('Removing…');

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

    it('should set pretty byte attr or empty string if bad', function() {
      // installed size
      this.model.set('installed_size', 0);
      expect(this.model.get('prettyInstalledSize')).toBe('0 B');
      // we coerce strings to numbers in the setters
      this.model.set('installed_size', '1');
      expect(this.model.get('prettyInstalledSize')).toBe('1 B');
      // bad
      this.model.set('installed_size', 'foo');
      expect(this.model.get('prettyInstalledSize')).toBe('');

      // download size
      this.model.set('download_size', 0);
      expect(this.model.get('prettyDownloadSize')).toBe('0 B');
      // we coerce strings to numbers in the setters
      this.model.set('download_size', '1');
      expect(this.model.get('prettyDownloadSize')).toBe('1 B');
      // bad
      this.model.set('download_size', 'foo');
      expect(this.model.get('prettyDownloadSize')).toBe('');
    });

    it('should parse response to create prettyInstalledSize', function() {
      this.model.parse({'installed_size': 0});
      expect(this.model.get('prettyInstalledSize')).toBe('0 B');
    });

    it('should parse response to create prettyDownloadSize', function() {
      this.model.parse({'download_size': 0});
      expect(this.model.get('prettyDownloadSize')).toBe('0 B');
    });

  });

  describe('setInstallButtonClass', function() {

    beforeEach(function() {
      this.model = new Snap({id: 'foo'});
    });

    afterEach(function() {
      delete this.model;
    });

    it('sets installButtonClass from the model state', function() {
      this.model.set('status', CONF.INSTALL_STATE.INSTALLED);
      expect(this.model.get('installButtonClass')).toBe('button--secondary');

      this.model.set('status', CONF.INSTALL_STATE.ACTIVE);
      expect(this.model.get('installButtonClass')).toBe('button--secondary');

      this.model.set('status', CONF.INSTALL_STATE.REMOVED);
      expect(this.model.get('installButtonClass')).toBe('button--primary');

      this.model.set('status', CONF.INSTALL_STATE.REMOVING);
      expect(this.model.get('installButtonClass')).toBe('button--primary');

      this.model.set('status', CONF.INSTALL_STATE.INSTALLING);
      expect(this.model.get('installButtonClass')).toBe('button--secondary');
    });
  });

  describe('sync methods', function() {

    beforeAll(function() {
      jasmine.Ajax.install();
    });

    beforeEach(function() {
      this.model = new Snap({id: 'foo'});
      spyOn(this.model, 'save').and.callThrough();
      spyOn(this.model, 'fetch');
    });

    afterEach(function() {
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
