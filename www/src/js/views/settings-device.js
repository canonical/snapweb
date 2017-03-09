
var React = require('react');
var Backbone = require('backbone');
var ReactBackbone = require('react.backbone');

var Config = require('../config.js');

var ConfirmationDialog = require('../components/confirmation-dialog.js');


const DeviceInfoLine = ({id, name, value}) =>
  <div className="row">
    <div className="col-2"><strong>{name}</strong></div>
    <div className="col-6" id={id}>{value}</div>
  </div>;

function DeviceName(props) {
  return props && props.deviceName ?
    <DeviceInfoLine id="info-device-name" name="Device name" value={props.deviceName} />
    : null;
}

function DeviceInfo({model}) {
  var interfaces = model.get('interfaces') || [];
  var interfacesText = '';
  if (interfaces.length == 0) {
      interfacesText = 'No interfaces found';
  } else {
    interfacesText = interfaces.join(', ');
  }

  var deviceName = model.get('deviceName');
  return (
    <div>
      <div className="row">
          <h2>Device information</h2>
      </div>
      <DeviceName deviceName={deviceName} />
      <DeviceInfoLine id="info-brand"
          name="Brand" value={model.get('brand')} />
      <DeviceInfoLine id="info-model"
          name="Model" value={model.get('model')} />
      <DeviceInfoLine id="info-serial"
          name="Serial" value={model.get('serial')} />
      <DeviceInfoLine id="info-operating-system"
          name="Operating System" value={model.get('operatingSystem')} />
      <DeviceInfoLine id="info-interfaces"
          name="Interfaces" value={interfacesText} />
      <DeviceInfoLine id="info-uptime"
          name="Uptime" value={model.get('uptime')} />
    </div>
  );
}

function PowerInfo({model, restart, powerOff}) {
  return (
    <div>
      <h2>Power</h2>
      <div className="row">
        <div className="col-2">
            <p>
              <button
                id="restart-button"
                type="p-button--neutral"
                name=""
                onClick={restart}>
                Restart
              </button>
            </p>
        </div>
        <div className="col-2">
          <p>
            <button
              id="power-off-bytton"
              type="p-button--neutral"
              name=""
              onClick={powerOff}>
                Power off
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FactorySettings({model}) {
  return (
    <div>
      <h2>Factory settings</h2>
      <div className="row">
        <div className="col-3">
          <button
            type="p-button--neutral"
            disabled={true}>
              Reset to factory settings
          </button>
        </div>
      </div>
    </div>
  );
}


module.exports = React.createBackboneClass({
  getInitialState: function() {
    return {
      confirmAction: null
    }
  },

  restart: function() {
    this.setState({
      confirmMessageText: "Are you sure you want to restart the device?", 
      confirmActionText: "Restart",
      confirmAction: () => this.sendAction("restart")
    });
  },

  powerOff: function() {
    this.setState({
      confirmMessageText:"<div class=\"p-confirmation__dialog__icon\">" +
                    "Choosing to power off will disconnect" +
                    " from snapweb instantly.<br/>Do you want to proceed?</div>",
      confirmActionText: "Power Off",
      confirmAction: () => this.sendAction("power-off")
    });
  },

  sendAction: function(actionType) {
    Backbone.ajax({
                url: Config.DEVICE_ACTION,
                contentType: 'application/json',
                type: 'POST',
                data: '{ "actionType":"' + actionType + '"}',
                processData: false,
                async: true,
                error: function(jqXHR, textStatus, errorThrown) {
                  chan.command('alert:error',
                               new Backbone.Model({message: errorThrown}));
                }
              });
  },

  render: function() {
    var model = this.props.model;

    // Disable the power & factory settings for now
    /**
        <hr />
        <PowerInfo
          model={model}
          restart={() => this.restart()}
          powerOff={() => this.powerOff()}
         />
        <hr />
        <FactorySettings model={model} /> <hr />
    */

    return (
      <div>
        <DeviceInfo model={model} />

        {this.state.confirmAction &&
          <ConfirmationDialog
            messageText={this.state.confirmMessageText}
            confirmText={this.state.confirmActionText}
            confirmAction={() => { this.state.confirmAction(); this.setState({confirmAction: null})}}
            cancelAction={() => this.setState({confirmAction: null})}
            />}
      </div>
    );
  }
});
