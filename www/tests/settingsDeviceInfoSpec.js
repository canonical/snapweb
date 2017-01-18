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

  describe('Testing power management confirmation dialog', function() {
    var confirmationDialog = null;
    var restartButton = null;
    var powerOffButton = null;
    var cancelButton = null;
    var confirmButton = null;

    beforeEach(function() {
      confirmationDialog = this.view.$el.find('div[class=p-confirmation]');
      confirmationDialog.css('display', 'none'); // XXX: no css loaded, this is the default
      restartButton = this.view.$el.find('#restart-button');
      powerOffButton = this.view.$el.find('#power-off-button');
      cancelButton = this.view.$el.find('#cancel-button');
      confirmButton = this.view.$el.find('#confirm-button');
    });

    it('should have buttons for restart and power off', function() {
      expect(restartButton).not.toBe(null);
      expect(powerOffButton).not.toBe(null);
    });

    it('should have rendered the dialog', function() {
      expect(confirmationDialog).not.toBe(null);
      expect(confirmationDialog.css("display")).toBe("none");

      expect(this.view.$el.find('div[class=p-confirmation__dialog__message]')).not.toBe(null);

      expect(cancelButton).not.toBe(null);
      expect(confirmButton).not.toBe(null);
    })

    it('should display a confirmation dialog on press of "Restart"', function () {
      spyOn(this.view, "restart").and.callThrough();

      // XXX: The original method has already been bound to the handler, rebind
      restartButton.off('click');
      restartButton.click(this.view.restart.bind(this.view));

      restartButton.click();
      expect(this.view.restart).toHaveBeenCalled();

      expect(confirmationDialog.css("display")).toBe("block");
      expect(this.view.$el.find('div[class=p-confirmation__dialog__message]').text()).
              toBe("Your device will be restarted immediately");
      expect(confirmButton.text()).toBe("Restart");
    });

    it('should trigger a restart on press of "Restart"', function() {
      spyOn(this.view, "confirmRequest").and.callThrough();
      spyOn(this.view, "sendAction");

      confirmButton.off('click');
      confirmButton.click(this.view.confirmRequest.bind(this.view));

      restartButton.click();
      confirmButton.click();

      expect(this.view.confirmRequest).toHaveBeenCalled();
      expect(confirmationDialog.css("display")).toBe("none");
      expect(this.view.sendAction).toHaveBeenCalledWith("restart");
    });


    it('should close confirmation dialog on "Cancel" after restart request', function() {
      spyOn(this.view, "cancelRequest").and.callThrough();

      cancelButton.off('click');
      cancelButton.click(this.view.cancelRequest.bind(this.view));

      restartButton.click();
      cancelButton.click();

      expect(this.view.cancelRequest).toHaveBeenCalled();
      expect(confirmationDialog.css("display")).toBe("none");
    });

    it('should display a confirmation dialog on press of "Power Off"', function () {
      spyOn(this.view, "powerOff").and.callThrough();

      powerOffButton.off('click');
      powerOffButton.click(this.view.powerOff.bind(this.view));

      powerOffButton.click();
      expect(this.view.powerOff).toHaveBeenCalled();

      expect(confirmationDialog.css("display")).toBe("block");
      expect(this.view.$el.find('div[class=p-confirmation__dialog__message]').text()).
              toBe("Choosing to power off will disconnect" +
                   " from snapweb instantly. Do you want to proceed");
      expect(confirmButton.text()).toBe("Power off");
    });

    it('should trigger a power-off on press of "Power Off"', function() {
      spyOn(this.view, "confirmRequest").and.callThrough();
      spyOn(this.view, "sendAction");

      confirmButton.off('click');
      confirmButton.click(this.view.confirmRequest.bind(this.view));

      powerOffButton.click();
      confirmButton.click();

      expect(this.view.confirmRequest).toHaveBeenCalled();
      expect(confirmationDialog.css("display")).toBe("none");
      expect(this.view.sendAction).toHaveBeenCalledWith("power-off");
    });

    it('should close confirmation dialog on "Cancel" after power off request', function() {
      spyOn(this.view, "cancelRequest").and.callThrough();

      cancelButton.off('click');
      cancelButton.click(this.view.cancelRequest.bind(this.view));

      restartButton.click();
      cancelButton.click();

      expect(this.view.cancelRequest).toHaveBeenCalled();
      expect(confirmationDialog.css("display")).toBe("none");
    });
  });

});
