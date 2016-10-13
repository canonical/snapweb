var LoginModel = require('../src/js/models/simple-login.js');
var Backbone = require('backbone');
var LoginView = require('../src/js/views/simple-login.js');

describe('Login', function() {

  describe('LoginModel', function() {

    beforeEach(function() {
      this.model = new LoginModel({});
    });

    afterEach(function() {
      delete this.model;
    });

    it('should be an instance of Backbone.Model', function() {
      expect(LoginModel).toBeDefined();
      expect(this.model).toEqual(jasmine.any(Backbone.Model));
    });    

    it('should block empty or invalid email', function() {
      expect(this.model.validate({})).toBeDefined();
      expect(this.model.validate({email: 'bad-email'})).toBeDefined();
    });

    // FIXME: jasmine.Ajax makes karma go crazy and fail to parse a JSON string in snap.js !?
    xit('should validate on save', function() {
      jasmine.Ajax.install();
      spyOn(this.model, 'save').and.callThrough();
      spyOn(this.model, 'validate').and.callThrough();
      this.model.save();
      expect(this.model.validate).toHaveBeenCalled();
      jasmine.Ajax.uninstall();
    });

  });

  describe('LoginView', function() {

    beforeEach(function() {
      this.model = new LoginModel({});
      this.view = new LoginView({
        model: this.model
      });
      this.view.render();
      
      this.emailSSO = this.view.$el.find('#emailSSO'); 
      this.btnLogin = this.view.$el.find('#btn-login');
    });
    
    afterEach(function() {
      this.view.remove();
      delete this.model;
      delete this.view;
    });
    
    it('should be an instance of Backbone.View', function() {
      expect(LoginView).toBeDefined();
      expect(this.view).toEqual(jasmine.any(Backbone.View));
    });
    
    it('should have some key input fields', function() {
      expect(this.emailSSO).toBeDefined();
      expect(this.btnLogin).toBeDefined();
    });

    xit('should submit valid forms', function() {
    });
    
    xit('should display error feedback', function() {

    });
    
  });

});
