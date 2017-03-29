var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

var SearchField = require('../components/search-field.js');
var DeckStyler = require('../components/deck-styler.js');
var StoreHeaderView = require('../components/store-header.js');
var StorelistView = require('../components/storelist.js');

module.exports = React.createBackboneClass({
  getInitialState: function() {
    return {
      deckStyle: 'grid'
    }
  },

  deckStyleChanged: function(deckStyle) {
    this.setState({deckStyle: deckStyle});
  },

  render: function() {
    var model = this.props.model;
    var collection = this.props.collection;

    return (
      <div className="b-grey-wrapper">
        <div className="inner-wrapper">
          <div
            style={{display: "inline-block", width: "100%", marginTop: "20px"}}>
            <div className="row">
              <SearchField query={model.get('query')} />
              <DeckStyler
                deckStyle={this.state.deckStyle}
                styleChanged={this.deckStyleChanged}
              />
            </div>
          </div>

          <div className="row">
            <StoreHeaderView
              title={model.get('title')}
              sections={model.get('sections')}
            />
          </div>

          <div className="p-strip--light">
            <div className="row">
              <StorelistView
                deckStyle={this.state.deckStyle}
                model={model}
                collection={this.props.collection.all()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
});
