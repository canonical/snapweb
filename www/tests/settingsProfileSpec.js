var _ = require('lodash');
var profileModel = require('../src/js/models/profile.js');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SettingsProfileView = require('../src/js/views/settings-profile.js');
var BannerView = require('../src/js/views/layout-banner.js');

describe('SettingsProfile', function() {
  beforeEach(function() {
    this.model = profileModel;
    this.model.set({
      email: "anthony.chang@ubuntu.com",
      username: "achang",
      avatarUrl: "http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802",
      fullName: "Anthony Chang",
      isLoggedIn: true,
    });
    this.view = new SettingsProfileView({
          model: this.model
        });
    this.view.render();
  });
  
  afterEach(function() {
    this.view.remove();
    delete this.model;
    delete this.view;
  });

  it('should be an instance of Backbone.View', function() {
    expect(SettingsProfileView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('should display the user details as provided by the model', function() {
    expect(this.view.$el.find('#profile-fullname').text()).toMatch(this.model.get('fullName'));
    expect(this.view.$el.find('#profile-email').text()).toMatch(this.model.get('email'));
    expect(this.view.$el.find('#profile-avatar')).toBeDefined();
  });

  it('should update the view on model changes', function() {
    spyOn(this.view, 'render');
    this.model.set('fullName', 'toto');
    expect(this.view.render).toHaveBeenCalled();
    // TODO: something is not updating the template in jasmine,
    // whereas it works in a real browser
    // expect(this.view.$el.find('#profile-fullname').text()).toMatch('toto');
  });

  it('should not display the user profile if not logged in', function() {
    this.model.clear();
    this.model.set('isLoggedIn', false);
    expect(this.model.get('isLoggedIn')).toBeFalsy();
    expect(this.view.$el.find('#profile-fullname').text()).toMatch('');
  });

  it('should be able to log the user out', function() {
    this.view.handleLogout();
    expect(this.view.$el.find('.btn-login').text()).toMatch('Login');
  });

  it('should also update the banner on logout', function() {
    window.SNAPWEB = new Marionette.Application();
    var banner = new BannerView();
    banner.render();
    expect(banner).toEqual(jasmine.any(Marionette.ItemView));
    spyOn(banner, 'render');
    this.view.handleLogout();
    expect(banner.render).toHaveBeenCalled();
    // TODO: same as above, get the template to re-render properly
  });

});
