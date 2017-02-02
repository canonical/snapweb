/** @jsx React.DOM */

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react')
var ReactBackbone = require('react.backbone');

var EmptySnaplistView = require('./empty-storelist.js');
var StorelistItemView = require('./storelist-item.js');


module.exports = React.createBackboneClass({
  render: function() {
    var model = this.props.model;

    if (model.get('loading')) {
      return (
        <div className="u-vertically-center">
          <img
            className="progress-spinner"
            style={{marginLeft: "auto", marginRight: "auto"}}
            src="/public/images/in-progress.svg"
            width="100px"
            height="100px" />
        </div>
      )
    } 

    var collection = this.props.collection;
    var deckClass = "p-card-deck " +
        (this.props.deckStyle === 'grid' ?
         'p-card-deck--grid' : 'p-card-deck--row');

    return (
      <div className={deckClass}>
        <div className="card-deck-row-header">
          <div className="card-deck-row-header__item">
            Name
          </div>
          <div className="card-deck-row-header__item">
            Publisher
          </div>
          <div className="card-deck-row-header__item">
          </div>
        </div>

        {collection.length == 0 &&
          <EmptySnaplistView />
        }

        {collection.map(function(snap) {
          return (
            <StorelistItemView key={snap.id} model={snap} />
          );
        })}
      </div>
    );
  }
});
