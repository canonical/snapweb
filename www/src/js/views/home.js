import {
  ContentWrapper,
  CardsList,
} from 'snapweb-toolkit'

import {
  browserHistory
} from 'react-router';

var _ = require('lodash')
var Backbone = require('backbone');
var React = require('react');
var ReactBackbone = require('react.backbone');

var Snap = require('../models/snap.js')
var Common = require('../common/snaps.js')
var Config = require('../config.js')

var Radio = require('backbone.radio');
var snapChannel = Radio.channel('snap');

function snapToCard(snap) {
  return {
    id: snap.get('id'),
    name: snap.get('name'),
    author: snap.get('developer'),
    type: snap.get('type') === 'app'? '' : snap.get('type'),
    action: snap.get('installActionString'),
    actions: [snap.get('installActionString')],
    image: snap.get('id'),
    installProgress: (
      snap.get('status') === Config.INSTALL_STATE.INSTALLING
        ? snap.get('download_progress')
        : -1
    ),
    snap: snap.toJSON(),
    iconUrl: snap.get('icon'),
  }
}

module.exports = React.createBackboneClass({
  componentWillMount: function() {
  },

  componentWillUnmount: function() {
  },

  getInitialState: function() {
    return {
      snaps: this.props.collection
    }
  },

  render: function() {
    var model = this.props.model;
    var collection = this.state.snaps || this.props.collection;

    const addCard = {
      id: 'add',
      name: 'Get more apps',
      action: 'Store',
      image: 'add-snap',
      iconUrl: `/public/images/add-snap.png`,
    };

    const system_snap_types = Config.NON_REMOVABLE_SNAP_TYPES;
    const non_removable_snap_ids = Config.NON_INSTALLABLE_IDS;

    const installedSnaps =
          collection.filter(function(snap) {
            return !_.includes(system_snap_types, snap.get('type')) &&
                   !_.includes(non_removable_snap_ids, snap.get('id'));
          });

    const cards = [
      ...installedSnaps.map(snapToCard),
      addCard,
    ];

    const systemSnaps =
          collection.filter(function(snap) {
            return _.includes(system_snap_types, snap.get('type')) ||
                   _.includes(non_removable_snap_ids, snap.get('id'))
          });

    var self = this;
    var handleSnapClick = function(id, props, component) {
      // TODO improve bad store handling
      if (props.action && props.action.toLowerCase() === 'store') {
        browserHistory.push('/store');
        return;
      }
      browserHistory.push('/snap/'+props.name);
    };
    var handleActionClick = function(id, props, component) {
      // TODO improve bad store handling
      if (props.action && props.action.toLowerCase() === 'store') {
        return;
      }
      var name = props.name;
      var snap = collection.findWhere({ id: name });
      if (! snap) {
        return;
      }
      Common.handleInstallEvent(
        null,
        snap,
        function() {
          // only status sound here is "removing"
          if (snap.get('status') === Config.INSTALL_STATE.REMOVING) {
            component.setState({ installProgress: snap.get('download_progress') })
          } else {
            // TODO beware very hackych
            snap.off();

            component.setState({ installProgress: -1 })

            if (snap.get('status') === Config.INSTALL_STATE.REMOVED) {
              var updatesSnaps = self.state.snaps.filter(function(s) {
                return s.get('name') !== snap.get('name');
              });
              self.setState({snaps: updatesSnaps});
            }
          }
        }
      )
    };

    return (
    <div className="b-grey-wrapper">
       <div className="inner-wrapper p-strip--light" style={{paddingBottom: "5em"}}>

          <div className="row">
            <h2 className="col-6">Apps installed</h2>
          </div>

          <div className="row">
              <CardsList
                title=''
                cards={cards}
                onCardClick={handleSnapClick}
                onActionClick={handleActionClick}
              />
          </div>

          <div className="row">
            <h2 className="col-6">System</h2>
          </div>

          <div className="row">
            <div style={{paddingBottom: "100px"}}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Publisher</th>
                    <th scope="col">Category</th>
                  </tr>
                </thead>

                <tbody id="systems-snap-list">

                {systemSnaps.map(function(snap, i) {
                  return (
                      <tr key={snap.get('name') + i.toString()}>
                        <td>
                          <a href={Common.getShowSnapUrlFor(snap)}>
                            <div className="u-vertically-center">
                              <img className="" src={snap.get('icon')} width="40" height="40"></img>
                              <span style={{marginLeft: "1em"}}>{snap.get('name')}</span>
                            </div>
                          </a>
                        </td>
                        <td>By {snap.get('developer')}</td>
                        <td>{snap.get('type')}</td>
                      </tr>
                  );
                })}

                </tbody>

              </table>
            </div>
          </div>

        </div>
      </div>
  )

  }
});
