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

    var targetSnapUri = ''
    return (
    <div className="b-grey-wrapper">
       <div className="inner-wrapper p-strip--light" style={{paddingBottom: "5em"}}>

          <CardsList
            title='Apps installed'
            cards={cards}
          />

          <div className="row">
            <h2 className="col-6">System</h2>
          </div>

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

              {collection.map(function(snap) {
                return [
                    <td>
                      <a href={targetSnapUri}>
                        <div className="u-vertically-center">
                          <img className="" src={snap.icon} width="40" height="40"></img>
                          <span style={{marginLeft: "1em"}}>{snap.name}</span>
                        </div>
                      </a>
                    </td>,
                    <td>By {snap.developer}</td>,
                    <td>{snap.type}</td>
                ];
              })}

              </tbody>

            </table>
          </div>

        </div>
      </div>
  )

  }
});
