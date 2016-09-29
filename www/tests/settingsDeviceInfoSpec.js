var Backbone = require('backbone');
var SettingsDeviceView = require('../src/js/views/settings-device.js');

describe('SettingsDeviceView', function() {
  beforeEach(function() {
    this.model = new Backbone.Model({
          deviceName: "Device Name",
          brand: "Brand",
          model: "Model",
          serial: "Serial",
          operatingSystem: "Operating System",
          interfaces: ['Interface 1', 'Interface 2'],
          uptime: ['1000 years']
        });
    this.view = new SettingsDeviceView({
          model: this.model
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
    expect(SettingsDeviceView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('should display the device name as provided by the model', function() {
     expect(this.view.$el.find('#info-device-name').text()).toMatch(this.model.get('deviceName'));
  });

  it('should display the brand as provided by model', function() {
     expect(this.view.$el.find('#info-brand').text()).toMatch(this.model.get('brand'));
  });

  it('should display the model as provided by the model', function() {
     expect(this.view.$el.find('#info-model').text()).toMatch(this.model.get('model'));
  });

  it('should display the serial as provided by the model', function() {
     expect(this.view.$el.find('#info-serial').text()).toMatch(this.model.get('serial'));
  });

  it('should display the operating system as provided by the model', function() {
     expect(this.view.$el.find('#info-operating-system').text()).toMatch(this.model.get('operatingSystem'));
  });

  it('should display the interfaces as provided by the model', function() {
     expect(this.view.$el.find('#info-interfaces').text()).toMatch(this.model.get('interfaces').join(','));
  });

  it('should display the uptime as provided by the model', function() {
     expect(this.view.$el.find('#info-uptime').text()).toMatch(this.model.get('uptime').join(','));
  });

});
