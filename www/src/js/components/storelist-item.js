/** @jsx React.DOM */

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');
var SnapTools = require('../common/snaps.js');

var Installer = require('./installer.js');


module.exports = React.createBackboneClass({
  render: function() {
    var model = this.props.model;
    var version = model.get('version');
    var developer = model.get('developer');
    var price = model.get('price');

    var rootDivClass = "p-card p-card-" + model.get('type');

    return (
      <div className={rootDivClass}>
        <a href={SnapTools.getShowSnapUrlFor(model)}>
          <img className="p-card__icon" src={model.get('icon')} width="125" height="125" />
          <h3 id="js-snap-title" className="p-card__title">{model.get('name')}</h3>
          <ul className="p-list">
            {version &&
              <li className="p-list__item">Version: {version}</li>}
            {developer &&
              <li className="p-list__item">Author: {developer}</li>}
          </ul>
        </a>
        <footer className="p-card__footer">
          <div className="u-float--right">
            <Installer
              installerClass="b-installer_small"
              model={model} />
          </div>
        </footer>
      </div>
    );
  }
});
