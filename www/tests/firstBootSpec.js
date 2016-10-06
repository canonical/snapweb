var _ = require('lodash');
var CreateUser = require('../src/js/models/create-user.js');
var Backbone = require('backbone');
var InitView = require('../src/js/views/init.js');
var CONF = require('../src/js/config.js');

describe('FirstBoot', function() {

  describe('create-user model', function() {

    beforeEach(function() {
      jasmine.Ajax.install();
      this.model = new CreateUser({});
      spyOn(this.model, 'save').and.callThrough();
      spyOn(this.model, 'validate').and.callThrough();
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
      delete this.model;
    });

    it('should be an instance of Backbone.Model', function() {
      expect(CreateUser).toBeDefined();
      expect(this.model).toEqual(jasmine.any(Backbone.Model));
    });

    it('should have urlRoot prop from config', function() {
      var expectedPath = CONF.CREATE_USER;
      expect(this.model.url).toBe(CONF.CREATE_USER);
    });

    it('should block empty or invalid email', function() {
      expect(this.model.validate({})).toBeDefined();
      expect(this.model.validate({email: 'bad-email'})).toBeDefined();
    });

    it('should validate on save', function() {
      this.model.save();
      expect(this.model.validate).toHaveBeenCalled();
    });

    xit('should always POST on save', function() {
    });
  });

  describe('InitView', function() {

    beforeEach(function() {
      this.model = new CreateUser({});
      this.view = new InitView({
        model: this.model
      });
      this.view.render();
      
      this.emailSSO = this.view.$el.find('#emailSSO'); 
      this.sshKey = this.view.$el.find('#sshKey');
      this.btnCreate = this.view.$el.find('#btn-create');
    });
    
    afterEach(function() {
      this.view.remove();
      delete this.model;
      delete this.view;
    });
    
    it('should be an instance of Backbone.View', function() {
      expect(InitView).toBeDefined();
      expect(this.view).toEqual(jasmine.any(Backbone.View));
    });
    
    it('should have some key input fields', function() {
      expect(this.emailSSO).toBeDefined();
      expect(this.sshKey).toBeDefined();
      expect(this.btnCreate).toBeDefined();
    });

    xit('should submit valid forms', function() {
    });
    
    xit('should display error feedback', function() {

    });
    
  });

});
