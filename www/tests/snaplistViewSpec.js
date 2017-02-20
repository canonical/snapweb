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
    delete view;
  });

  it('should not display message for empty collection', function() {
    var view = new SnapListView({
      model: this.model,
      collection: this.empty_collection,
    });
    view.render();
    var l = view.$el.find('.p-card')
    expect(l.length).toBe(0);
    view.remove();
    delete view;
  });
});
