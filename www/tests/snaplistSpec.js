var SnapList = require('../src/js/collections/snaplist.js');

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

});
