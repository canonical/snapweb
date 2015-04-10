var _ = require('lodash');
var Snap = require('../src/js/models/snap.js');
var Backbone = require('backbone');
var CONF = require('../src/js/config.js');

describe('Snap', function() {
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

});

describe('Snap sync methods', function() {

  beforeEach(function() {
    jasmine.Ajax.install();
    this.model = new Snap({id: 'foo'});
    spyOn(this.model, 'fetch').and.callThrough();
    spyOn(this.model, 'save').and.callThrough();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    delete this.model;
  });

  it('should poll fetch on HTTP 202 until HTTP 200', function(done) {
    var model = this.model;
    model.save();
    expect(model.save).toHaveBeenCalled();
    expect(model.fetch).not.toHaveBeenCalled();
    model.on('sync', function(model) {
      _.delay(function(model) {
        expect(model.fetch).toHaveBeenCalled();
        done();
      }, 100, model);
    });
    jasmine.Ajax.requests.mostRecent().respondWith({
       "status": 202,
       "contentType": 'application/json',
       "responseText": {} 
    });
  });

/**
  it('should not poll fetch on HTTP 200', function() {
    var doneFn = jasmine.createSpy("success");
    var expectedUrl = CONF.PACKAGES + '/' + this.model.id;
    this.model.fetch({
      success: function(model, attrs, opts) {
        doneFn(opts.xhr.status);
      }
    });
    expect(jasmine.Ajax.requests.mostRecent().url).toBe(expectedUrl);
    expect(this.model.fetch).toHaveBeenCalled();
    expect(doneFn).not.toHaveBeenCalled();

    // test anything that depends on the xhr not having responded
    // before setting up the respondWith 
    jasmine.Ajax.requests.mostRecent().respondWith({
       "status": 200,
       "contentType": 'application/json',
       "responseText": '{}'
    });

    expect(jasmine.Ajax.requests.count()).toBe(1);
    expect(doneFn).toHaveBeenCalledWith(200);
  });
  **/
});
