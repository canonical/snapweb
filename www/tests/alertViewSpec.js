var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Backbone = require('backbone');
var AlertView = require('../src/js/views/alerts.js');
var Snap = require('../src/js/models/snap.js');

describe('AlertView', function() {

  beforeEach(function() {
    var model = this.model = new Snap({
      id: 'foo',
      message: 'foo'
    });
    this.view = new AlertView({
      model: model 
    });
  });

  afterEach(function() {
    this.view.destroy();
    delete this.view;
  });

  it('should be an instance of Backbone.View', function() {
    expect(AlertView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('should destroy the view onClose', function() {
    spyOn(this.view, 'destroy');
    this.view.onClose();

    expect(this.view.destroy).toHaveBeenCalled();
  });

  it('should preventDefault on close click', function() {
    var stubbedEvent = {
      preventDefault: function() {}
    };
    spyOn(stubbedEvent, 'preventDefault');
    this.view.onClose(stubbedEvent);
    expect(stubbedEvent.preventDefault).toHaveBeenCalled();
  });

  it('should unset message on the model', function() {
    spyOn(this.model, 'unset');
    this.view.onClose();
    expect(this.model.unset).toHaveBeenCalled();
  });

});
