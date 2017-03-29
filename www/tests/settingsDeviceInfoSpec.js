var $ = require('jquery');
var Backbone = require('backbone');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

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
          uptime: '1000 years'
        });

    this.elementHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(SettingsDeviceView, {
          model: this.model
      }));
  });

  afterEach(function() {
    delete this.model;
  });

  it('should display the device name as provided by the model', function() {
     expect($(this.elementHtml).find('#info-device-name').text()).toMatch(this.model.get('deviceName'));
  });

  it('should display the brand as provided by model', function() {
     expect($(this.elementHtml).find('#info-brand').text()).toMatch(this.model.get('brand'));
  });

  it('should display the model as provided by the model', function() {
     expect($(this.elementHtml).find('#info-model').text()).toMatch(this.model.get('model'));
  });

  it('should display the serial as provided by the model', function() {
     expect($(this.elementHtml).find('#info-serial').text()).toMatch(this.model.get('serial'));
  });

  it('should display the operating system as provided by the model', function() {
     expect($(this.elementHtml).find('#info-operating-system').text()).toMatch(this.model.get('operatingSystem'));
  });

  it('should display the interfaces as provided by the model', function() {
     expect($(this.elementHtml).find('#info-interfaces').text()).toMatch(this.model.get('interfaces').join(', '));
  });

  it('should display the uptime as provided by the model', function() {
     expect($(this.elementHtml).find('#info-uptime').text()).toMatch(this.model.get('uptime'));
  });

  it('should have buttons for restart and power off', function() {
    expect($(this.elementHtml).find('#restart-button')).not.toBe(null);
    expect($(this.elementHtml).find('#power-off-button')).not.toBe(null);
  });
});
