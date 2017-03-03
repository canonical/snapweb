import {
  ContentWrapper,
  CardsList,
} from 'snapweb-toolkit'

var _ = require('lodash')
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

var Snap = require('../models/snap.js')
var Common = require('../common/snaps.js')
var Config = require('../config.js')

function snapToCard(snap) {
  return {
    id: snap.get('id'),
    name: snap.get('name'),
    author: snap.get('developer'),
    type: snap.get('type') === 'app'? '' : snap.get('type'),
    action: snap.get('installActionString'),
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

    const installedSnaps =
          collection.filter(function(snap) {
            return !_.includes(system_snap_types, snap.get('type'))
          });

    const cards = [
      ...installedSnaps.map(snapToCard),
      addCard,
    ];

    const systemSnaps =
          collection.filter(function(snap) {
            return _.includes(system_snap_types, snap.get('type'))
          });

    var self = this;
    var handleSnapClick = function(id) {
      Common.handleInstallEvent(
        null,
        collection.where({ id: id })[0],
        function(model) {
          if (model.status === Config.INSTALL_STATE.REMOVING) {
            self.setState({ snaps: self.props.collection })
          } else {
            // TODO reset even handler
          }
        }
      )
    }

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
