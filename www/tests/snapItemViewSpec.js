var Backbone = require('backbone');
var Snap = require('../src/js/models/snap.js');
var SnapItemView = require('../src/js/views/snaplist-item.js');

describe('SnapItemView', function() {

  beforeEach(function() {
    this.view = new SnapItemView({
      model: new Snap({
        id: 'foo'
      })
    });
  });

  afterEach(function() {
    this.view = null;
  });

  it('should be an instance of Backbone.View', function() {
    expect(SnapItemView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('should have a p-card className with type modifier when present in model', function() {
    this.view.model.unset('type');
    expect(this.view.className()).toBe('p-card');
    this.view.model.set('type', 'foo');
    expect(this.view.className()).toBe('p-card p-card-foo');
  });

});
