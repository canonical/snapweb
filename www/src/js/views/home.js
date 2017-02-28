import {
  ContentWrapper,
  CardsList,
} from 'snapweb-toolkit'

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

module.exports = React.createBackboneClass({
  render: function() {
    var model = this.props.model;
    var collection = this.props.collection;

    const cards = collection;

    const systemSnaps = []

    var photo = ""
    var brandData = {
      brandName: "",
      deviceName: "",
      systemName: "",
      color: "",
      
    }
    return (
      <div>
        <ContentWrapper>
        </ContentWrapper>

        <ContentWrapper background bordered>

          <CardsList
            title='Apps installed'
            cards={cards}
          />

          <div style={{ paddingBottom: '100px' }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Publisher</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>

              <tbody id="systems-snap-list">
              </tbody>

            </table>

           <SnapsTable
              title='System'
              snaps={systemSnaps.map(snap => ({
                id: snap.id,
                name: snap.name,
                author: snap.author,
                category: snap.category,
                icon: `${pub}/icons/cards/${snap.id}.png`,
              }))}
            />
          </div>
        </ContentWrapper>
      </div>
  )

/*    return (
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
*/

  }
});
