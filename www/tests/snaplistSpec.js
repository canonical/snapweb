var SnapList = require('../src/js/collections/snaplist.js');
var Radio = require('backbone.radio');
var chan = Radio.channel('root');

describe('Snaplist', function() {

  describe('installed', function() {

    beforeEach(function() {
      this.list = new SnapList([{
        id: 'foo',
        status: 'uninstalled'
      }, {
        id: 'bar',
        status: 'installed'
      }]);
    });

    it('returns only active snaps', function() {
      var installed = this.list.installed();
      expect(installed.length).toBe(1);
      expect(installed.at(0).id).toBe('bar');
    });

  });

  describe('fetch', function() {

    beforeEach(function() {
      jasmine.Ajax.install();
      this.list = new SnapList();
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    it('redirects to SSO on authentication error', function() {
      var redirects = 0;
      chan.comply('redirect:sso', function() {
        redirects++;
      });

      this.list.fetch();
      jasmine.Ajax.requests.mostRecent().respondWith({
        'status': 401
      });
      expect(redirects).toBe(1);
    });
  });

});
