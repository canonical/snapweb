var Backbone = require('backbone');
var SettingsUpdateView = require('../src/js/views/settings-updates.js');

describe('SettingsUpdateView', function() {

  describe("general", function() {
    beforeEach(function() {
      this.collection= new Backbone.Collection({
          });
      this.history = new Backbone.Collection({
          });
      this.view = new SettingsUpdateView({
            collection: this.collection,
            history: this.history
          });
      this.view.render();
    });

    afterEach(function() {
      this.view.remove();
      delete this.model;
      delete this.view;
    });

    // Benefit of this test?
    it('should be an instance of Backbone.View', function() {
      expect(SettingsUpdateView).toBeDefined();
      expect(this.view).toEqual(jasmine.any(Backbone.View));
    });
  });

  describe("empty collections", function() {
    beforeEach(function() {
      this.collection= new Backbone.Collection({
          });
      this.history = new Backbone.Collection({
          });
      this.view = new SettingsUpdateView({
            collection: this.collection,
            history: this.history
          });
    });

    afterEach(function() {
      this.view.remove();
      delete this.model;
      delete this.view;
    });

    /*
    it('should display "No updates available" when no updates', function(done) {
      var view = this.view;
      view.on('render', function() {
        expect(view.$el.find('#updates-message').text()).toMatch('No updates available');
        done();
      });
      console.log("CALLING RENDER");
      view.render();
    });


    it('should display "No history information available" when no history', function(done) {
      var view = this.view;
      view.on('render', function() {
        expect(view.$el.find('#history-history').text()).toMatch('No history information available');
        done();
      });
      view.render();
    });
    */
  });
});
