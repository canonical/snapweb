import React from 'react';
import Backbone from 'backbone';
import _ from 'lodash';

import SnaplistTools from '../common/snaplists';

const Header = ({ enableAction, updateHandler }) => (
  <div className="row">
    <h2 className="col-3 u-float--left">Available</h2>
    <button
      disabled={!enableAction}
      className="p-button--positive col-3 u-float--right"
      onClick={updateHandler}>
      Update all
    </button>
  </div>
);

const SnapTableRow = ({ icon, name, version, install_date }) => (
  <tr>
    <td>
      <div className="u-vertically-center">
        <img
          style={{ width: '32px', height: '32px' }}
          src={icon}
          alt={`Icon for ${name}`}
        />
        <span style={{ verticalAlign: 'middle', marginLeft: '10px' }}>
          {name}
        </span>
      </div>
    </td>
    <td>
      <span style={{ verticalAlign: 'middle' }}>{version}</span>
    </td>
    <td>
      <span style={{ verticalAlign: 'middle' }}>{install_date}</span>
    </td>
  </tr>
);

const SnapTableBody = ({ tableData }) => (
  <tbody>
    {tableData.map((row, index) => (
      <SnapTableRow key={index} {...row.attributes} />
    ))}
  </tbody>
);

const SnapTable = ({ tableData }) => (
  <table
    style={{
      overflowX: 'scroll',
      marginBottom: '20px',
      margin: '0 0 2.5em',
      width: '100%'
    }}>
    <thead
      style={{
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'grey'
      }}>
      <tr>
        <th
          style={{
            fontWeight: 300,
            textAlign: 'left',
            padding: '5px'
          }}
          scope="col">
          Name
        </th>
        <th
          style={{
            fontWeight: 300,
            textAlign: 'left',
            padding: '5px'
          }}
          scope="col">
          Version
        </th>
        <th
          style={{
            fontWeight: 300,
            textAlign: 'left',
            padding: '5px'
          }}
          scope="col">
          Last updated
        </th>
      </tr>
    </thead>
    <SnapTableBody tableData={tableData} />
  </table>
);

const AvailableUpdates = ({ availableUpdates, updateHandler }) => {
  const haveUpdates = availableUpdates.length > 0;

  return (
    <div>
      <Header enableAction={haveUpdates} updateHandler={updateHandler} />
      {haveUpdates
        ? <SnapTable tableData={availableUpdates} />
        : <div>No updates available</div>}
    </div>
  );
};

const UpdateHistory = updateHistory => (
  <div>
    <h2 className="col-3 u-float--left">History</h2>
    <SnapTable tableData={updateHistory} />
  </div>
);

const UpdateSchedule = () => (
  <div className="u-vertically-center">
    <span style={{ marginRight: '10px' }}>
      Updates will be applied automatically daily at
    </span>
    <span><input type="time" value="02:30" /></span>
  </div>
);

export default class SettingsUpdates extends React.Component {
  static propTypes = {
    availableUpdates: React.PropTypes.object, // Backbone collection
    updateHistory: React.PropTypes.object  // Backbone collection
  };

  static defaultPropTypes = {
    availableUpdates: new Backbone.Collection([]),
    updateHistory: new Backbone.Collection([])
  };

  handleUpdateAll = () => {
    SnaplistTools.updateSnaps(this.props.availableUpdates);
  };

  constructor(props) {
    super(props);

    props.availableUpdates.on(
      'add remove reset sort',
      _.debounce(() => this.forceUpdate())
    );
  }

  render() {
    const { availableUpdates, updateHistory } = this.props;

    return (
      <div>
        <AvailableUpdates
          availableUpdates={availableUpdates.models}
          updateHandler={this.handleUpdateAll}
        />
{/*
        <br />
        <UpdateSchedule />
        <hr />
        <UpdateHistory updateHistory={updateHistory} />
*/}
      </div>
    );
  }
}
