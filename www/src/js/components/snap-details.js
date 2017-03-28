var Backbone = require('backbone');
var React = require('react');
var ReactBackbone = require('react.backbone');
var CONF = require('../config.js');

var Installer = require('./installer.js');

function SnapSize(props) {
  var model = props.model;
  var size = model.get('size');
  if (!size) {
    return null;
  }
  return (
    <li className="p-list__item">
      Size
      <span className="b-snap__size u-float--right">{size}</span>
    </li>
  );
}

function SnapVersion(props) {
  var model = props.model;
  var version = model.get('version');
  if (!version) {
    return null;
  }
  return (
    <li className="p-list__item">
      Version
      <span className="b-snap__version u-float--right">{version}</span>
    </li>
  );
}

function SnapChannel(props) {
  var model = props.model;
  var channel = model.get('channel');
  if (!channel) {
    return null;
  }
  return (
    <li className="p-list__item">
      Channel
      <span className="b-snap__version u-float--right">{channel}</span>
    </li>
  );
}

function SnapInstallDate(props) {
  var model = props.model;
  var installDate = model.get('install_date');
  if (!installDate) {
    return null;
  }
  return (
    <li className="p-list__item">
      Updated
      <span className="b-snap__version u-float--right">{installDate}</span>
    </li>
  );
}

function SnapInfoDetails(props) {
  return (
    <ul className="p-list--divided" style={{marginRight: "3em"}}>
      <SnapSize model={props.model} />
      <SnapVersion model={props.model} />
      <SnapChannel model={props.model} />
      <SnapInstallDate model={props.model} />
    </ul>
  );
}

function About(props) {
  var model = props.model
  if (model.get('description')) {
    return (
      <div>
        <h3>About</h3>
        <p>{model.get('description')}</p>
      </div>
    );
  }
  return (
    <div>
      <h3>About</h3>
      <p><i>No description</i></p>
    </div>
  );
}

function SnapBanner(props) {
  var model = props.model;
  return (
    <div>
      <div className="col-2">
        <div className="b-icon-wrapper">
          <img className="b-icon" src={model.get('icon')} width="125" height="125" />
        </div>
      </div>
      <div className="col-6">
        <h1 className="b-snap__title">{model.get('name')}</h1>
        <div className="b-snap__developer">{model.get('developer')}</div>
      </div>
    </div>
  );
}

function SnapInterfaces(props) {
  return (
    <ul className="p-list--divided">
      <li className="p-list__item">Interfaces</li>
      <li className="p-list__item" id="interface-list">N/A</li>
    </ul>
  );
}

function SnapActions(props) {
  // download_progress
  var model = props.model;
  var progressWidth = props.downloadProgress + "%";
  var status = props.status;
  var taskSummary = props.taskSummary;

  var progressBarBorder = "1px";
  var progressBarBorderRadius = "10%";
  var progressBarBackgroundColor = "#003399";

  if (status !== CONF.INSTALL_STATE.INSTALLING) {
    progressBarBorder = "0px";
    progressBarBorderRadius = "initial";
    progressBarBackgroundColor = "";
  }

  var installerButtonClassName = "col-5";
  if (status === CONF.INSTALL_STATE.INSTALLED ||
      status === CONF.INSTALL_STATE.ACTIVE) {
    installerButtonClassName = "col-2";
  }
  if (status === CONF.INSTALL_STATE.REMOVED) {
    installerButtonClassName = "col-5";
  }

  return (
    <div id="installer-button" className={installerButtonClassName}>
      <Installer
        installerClass="b-installer_small"
        model={model} />

      <div id="progressbarwrapper"
           style={{border: {progressBarBorder}, borderRadius: {progressBarBorderRadius}, marginTop: "1em", width: "100%", height: "0.5em"}}>
        <div id="progress"
             style={{backgroundColor: {progressBarBackgroundColor}, width: {progressWidth}, height: "0.5em"}} />
      </div>

      <div style={{width: "100%", height: "23px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
        <small id="tasksummary">{taskSummary}</small>
      </div>
    </div>
  );
}

module.exports = React.createBackboneClass({
  componentWillMount: function() {
    var model = this.props.model;

    var self = this;
    model.on('change:download_progress', function() {
      self.setState({downloadProgress: model.get('download_progress')});
    });
    model.on('change:task_summary', function() {
      self.setState({taskSummary: model.get('task_summary')});
    });
    model.on('change:status', function() {
      self.setState({status: model.get('status')});
    });
  },

  getInitialState: function() {
    return {downloadProgress: 0, taskSummary: '', status: ''};
  },

  render: function() {
    var model = this.props.model;

    return (
      <div>
        <div className="p-strip--light">
          <div className="row" style={{paddingBottom: "0"}}>
            <SnapBanner model={model} />
          </div>

          <div className="row" style={{padding: "0", paddingBottom: "0.5em"}}>
            <div className="col-7">
              <SnapActions
                model={model}
                downloadProgress={this.state.downloadProgress}
                taskSummary={this.state.taskSummary}
                status={this.state.status} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-7">
            <SnapInfoDetails model={model} />
          </div>
          <div className="col-4">
            <SnapInterfaces />
          </div>
        </div>

        <div className="row" style={{paddingBottom: "3em"}}>
          <div className="col-8">
            <About model={model} />
          </div>
        </div>
      </div>
    );
  }
});
