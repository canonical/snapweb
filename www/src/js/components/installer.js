/** @jsx React.DOM */

var React = require('react');
var Config = require('../config.js');


module.exports = React.createBackboneClass({
  installClicked: function(event) {
    event.preventDefault();

    var model = this.props.model;
    var status = model.get('status');
    var isInstallable = model.get('isInstallable');

    if (!isInstallable) {
      return;
    }

    if (status === Config.INSTALL_STATE.INSTALLED) {
      // remove
      model.set({
        status: CONF.INSTALL_STATE.REMOVING
      });
      model.destroy({
        dataType : 'json',
        silent: true
      });
    } else if (status === Config.INSTALL_STATE.REMOVED) {
      // install
      model.save({
        status: Config.INSTALL_STATE.INSTALLING
      }, {
        dataType : 'json'
      });
    }

    return false;
  },

  render: function() {
    var model = this.props.model;
    var installerClass = this.props.installerClass;
    var installActionString = model.get('installActionString');
    var isInstalled = model.get('isInstalled');
    var isInstallable = model.get('isInstallable');
    var installHTMLClass = model.get('installHTMLClass');

    var rootDivClass = "b-installer " + installerClass + " " + installHTMLClass;

    if (isInstallable) {
      return (
        <div className={rootDivClass}>
          {installActionString &&
            <button
              className={"b-installer__button " + model.get('buttonClass') + " " + model.get('installButtonClass') + " " + "p-button--neutral"}
              onClick={this.installClicked}>
              {installActionString}
            </button>
            }
        </div>
      );
    } else {
      rootDivClass += "b-installer_disabled";
      var installButton = '';

      if (isInstalled) {
        installButton = <button className="b-installer__button p-button--positive">Installed</button>
      } else {
        installButton = <button className="b-installer__button p-button--negative" disabled>Not installable</button>
      }

      return (
        <div className={rootDivClass}>
          {installButton}
        </div>
      );
    }
  }
});


