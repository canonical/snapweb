/** @jsx React.DOM */

var React = require('react');
var Snap = require('../common/snaps.js');
var Config = require('../config.js');


module.exports = React.createBackboneClass({
  installClicked: function(event) {
    return Snap.handleInstallEvent(event, this.props.model);
  },

  render: function() {
    var model = this.props.model;
    var installerClass = this.props.installerClass;
    var installActionString = model.get('installActionString');
    var isInstalled = model.get('isInstalled');
    var isInstallable = model.get('isInstallable');
    var isPriced = model.get('priced');
    var installHTMLClass = model.get('installHTMLClass');
    var isCoreSnap = model.get('isCoreSnap');

    var rootDivClass = "b-installer " + installerClass + " " + installHTMLClass;

    if (isInstallable || isPriced) {
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

      if (isCoreSnap) {
        installButton = <button className="b-installer__button p-button--base" disabled></button>
      } else if (isInstalled) {
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


