var Backbone = require('backbone');
var SnapList = require('../src/js/collections/snaplist.js');
var SnapListView = require('../src/js/views/snaplist.js');

describe('SnapListView', function() {

  beforeEach(function() {
    this.model = new Backbone.Model({});
    this.snap_collection = new SnapList([{
      id: 'foo',
      status: 'uninstalled'
    }, {
      id: 'bar',
      status: 'installed'
    }]);
    this.empty_collection = new SnapList([]);
  });

  afterEach(function() {
    delete this.model;
    delete this.empty_collection;
    delete this.snap_collection;
  });

  it('should display snaps collection', function() {
    var view = new SnapListView({
      model: this.model,
      collection: this.snap_collection,
    });
    view.render();
    var l = view.$el.find('.p-card')
    expect(l.length).not.toBeLessThan(2);
    view.remove();
  });

  it('should not display message for empty collection if requested', function() {
    var view = new SnapListView({
      doNotDisplayEmptyList: true,
      model: this.model,
      collection: this.empty_collection,
    });
    view.render();
    var l = view.$el.find('.p-card')
    expect(l.length).toBe(0);
    expect(view.$el.html().indexOf('No results')).toBe(-1);
    view.remove();
  });

  it('should not display message for empty collection by default', function() {
    var view = new SnapListView({
      model: this.model,
      collection: this.empty_collection,
    });
    view.render();
    var l = view.$el.find('.p-card')
    expect(l.length).toBe(0);
    expect(view.$el.html().indexOf('No results')).not.toBe(-1);
    view.remove();
  });
});
