var fs = require('fs');
var Snap = require('../src/js/models/snap.js');

describe('modelSpec', function() {

  beforeEach(function() {
    this.model = new Snap({id: 'foo'});
  });

  afterEach(function() {
    this.model = null;
  });

  it('Snap should exist', function() {
    expect(Snap).toBeDefined();
  });

  it('Snap should construct model instance', function() {
    expect(this.model.get('id')).toBe('foo');
    expect(typeof this.model).toBe('object');
  });

  it('snap model instance should have a urlRoot prop', function() {
    expect(this.model.urlRoot).toBe('/api/v2/packages');
  });
});
