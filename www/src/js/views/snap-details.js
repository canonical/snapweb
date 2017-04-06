var Backbone = require('backbone');
var React = require('react');
var ReactBackbone = require('react.backbone');
var CONF = require('../config.js');

var Installer = require('../components/installer.js');

function SnapSize(props) {
  if (!props || !props.size) {
    return null
  }
  return (
    <li className="p-list__item">
      Size
      <span className="b-snap__size u-float--right">{props.size}</span>
    </li>
  );
}

function SnapVersion(props) {
  if (!props || !props.version) {
    return null
  }
  return (
    <li className="p-list__item">
      Version
      <span className="b-snap__version u-float--right">{props.version}</span>
    </li>
  );
}

function SnapChannel(props) {
  if (!props || !props.channel) {
    return null
  }
  return (
    <li className="p-list__item">
      Channel
      <span className="b-snap__version u-float--right">{props.channel}</span>
    </li>
  );
}

function SnapInstallDate(props) {
  if (!props || !props.install_date) {
    return null
  }
  return (
    <li className="p-list__item">
      Updated
      <span className="b-snap__version u-float--right">{props.install_date}</span>
    </li>
  );
}

function SnapInfoDetails(props) {
  return (
    <ul className="p-list--divided" style={{marginRight: "3em"}}>
      <SnapSize {...props.model.attributes} />
      <SnapVersion {...props.model.attributes} />
      <SnapChannel {...props.model.attributes} />
      <SnapInstallDate {...props.model.attributes} />
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

  var installerClass = "b-installer_small";

  if (status !== CONF.INSTALL_STATE.INSTALLING) {
    progressBarBorder = "0px";
    progressBarBorderRadius = "initial";
    progressBarBackgroundColor = "";
  }

  if (status === CONF.INSTALL_STATE.INSTALLING ||
      status === CONF.INSTALL_STATE.REMOVING) {
    installerClass += " b-installer_thinking";
  }

  var progressBarWrapperStyle = {
    border: progressBarBorder,
    borderRadius: progressBarBorderRadius,
    marginTop: "1em",
    width: "100%",
    height: "0.5em"
  };

  var progressStyle = {
    backgroundColor: progressBarBackgroundColor,
    width: progressWidth,
    height: "0.5em"
  };

  return (
    <div id="installer-button">
      <Installer
         installerClass={installerClass}
         model={model} />

      <div id="progressbarwrapper" style={progressBarWrapperStyle}>
        <div id="progress" style={progressStyle} />
      </div>

      <div style={{width: "100%", height: "23px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
        <small id="tasksummary">{taskSummary}</small>
      </div>
    </div>
  );
}

module.exports = React.createBackboneClass({
  componentWillMount: function() {
    const model = this.props.model;
    if (model) {
      model.on('change:download_progress', this.onDownloadProgressChanged.bind(this, null), this);
      model.on('change:task_summary', this.onTaskSummaryChanged.bind(this, null), this);
      model.on('change:status', this.onStatusChanged.bind(this, null), this);
    }
  },

  onDownloadProgressChanged: function() {
    var model = this.props.model;
    if (model) {
      this.setState({downloadProgress: model.get('download_progress')});
    }
  },

  onTaskSummaryChanged: function() {
    var model = this.props.model;
    if (model) {
      this.setState({taskSummary: model.get('task_summary')});
    }
  },

  onStatusChanged: function() {
    var model = this.props.model;
    if (model) {
      this.setState({status: model.get('status')});
    }
  },

  componentWillUnmount: function() {
    var model = this.props.model;
    if (model) {
      model.off(null, null, this);
    }
  },

  getInitialState: function() {
    return {downloadProgress: 0, taskSummary: '', status: ''};
  },

  render: function() {
    const model = this.props.model;

    return (
      <div>
        <div className="p-strip--light">
          <div className="row" style={{paddingBottom: "0"}}>
            <SnapBanner model={model} />
          </div>

          <div className="row" style={{padding: "0", paddingBottom: "0.5em"}}>
            <div className="col-7">
              <ul className="p-list--divided"></ul>
            </div>
            <div className="col-4">
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
