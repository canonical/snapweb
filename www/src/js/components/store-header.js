/** @jsx React.DOM */

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react')
var ReactBackbone = require('react.backbone');

var SectionView = React.createClass({
  render: function() {
    var section = this.props.section;

    return (
      <span style={{margin: "1em"}}>
        <a href={"/store/section/" + section}>{section}</a>
      </span>
    );
  }
})

module.exports = React.createBackboneClass({
  render: function() {
    var model = this.props.model;
    var collection = this.props.collection;
    var sections = null;

    if (collection && collection.length > 0) {
      sections =
          <span className="b-sections-list">
            {collection.map(function(section) {
                              return (
                                <SectionView key={section} section={section} />
                              );
                            })}
          </span>
    }

    return (
      <div>
        <h2 className="col-6">{model.get('title')}</h2>
        <span style={{textColor: "grey", float: "right"}}>
          {sections}
          <a href="/store/section/private">Private</a>
        </span>
      </div>
    );
  }
});
