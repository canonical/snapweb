var Snap = require('../src/js/models/snap.js');
var Backbone = require('backbone');

describe('Snap', function() {

  beforeEach(function() {
    this.model = new Snap({id: 'foo'});
  });

  afterEach(function() {
    this.model = null;
  });

  it('should be an instance of Backbone.Model', function() {
    expect(Snap).toBeDefined();
    expect(this.model).toEqual(jasmine.any(Backbone.Model));
  });

  // TODO tie the url to a config?
  it('should have a urlRoot prop', function() {
    expect(this.model.urlRoot).toBe('/api/v2/packages');
  });
});
