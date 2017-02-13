
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

var Config = require('../config.js');

var ConfirmationDialog = require('../components/confirmation-dialog.js');


function DeviceInfo({model}) {
  var interfaces = model.get('interfaces');
  var interfacesText = "";
  if (interfaces.length == 0) {
      interfacesText = 'No interfaces found';
  } else {
    interfacesText = interfaces.join(', ');
  }

  return (
    <div>
      <div className="row">
          <h2>Device information</h2>
      </div>
      <div className="row">
        <div className="col-2"><strong>Device name</strong></div>
        <div className="col-6" id="info-device-name">{model.get('deviceName')}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Brand</strong></div>
        <div className="col-6" id="info-brand">{model.get('brand')}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Model</strong></div>
        <div className="col-6" id="info-model">{model.get('model')}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Serial</strong></div>
        <div className="col-6" id="info-serial">{model.get('serial')}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Operating System</strong></div>
        <div className="col-6" id="info-operating-system">{model.get('operatingSystem')}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Interfaces</strong></div>
        <div className="col-6" id="info-interfaces">{interfacesText}</div>
      </div>
      <div className="row">
        <div className="col-2"><strong>Uptime</strong></div>
        <div className="col-6" id="info-uptime">{model.get('uptime')}</div>
      </div>
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

    return (
      <div>
        <DeviceInfo model={model} />
        <hr />

        <PowerInfo
          model={model}
          restart={() => this.restart()}
          powerOff={() => this.powerOff()}
         />
        <hr />

        <FactorySettings model={model} />
        <hr />

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