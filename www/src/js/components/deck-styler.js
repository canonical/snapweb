
var React = require('react');

module.exports = React.createClass({
  gridClicked: function() {
    this.props.styleChanged('grid');
  },

  rowClicked: function() {
    this.props.styleChanged('row');
  },

  render: function() {
    var deckClass = "p-view-filters " +
        (this.props.deckStyle === 'grid' ?
         'p-view-filters--grid' : 'p-view-filters--row');

    return (
    <div className="col-1 u-hidden--small">
      <div className={deckClass} style={{float: 'right'}}>
        <span
          className="p-view-filters__icon"
          onClick={this.gridClicked}>
          <svg
            className="filter-icon-grid--active"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            height="21"
            width="21"
            dangerouslySetInnerHTML={{__html:
              '<defs><path id="a" d="M0 0h9v9H0z"/><path id="c" d="M0 0h9v9H0z"/><path id="e" d="M0 0h9v9H0z"/><path id="g" d="M0 0h9v9H0z"/></defs><g fill-rule="evenodd" fill="none"><mask id="b" fill="#fff"><use xlink:href="#a"/></mask><path d="M0 0h9v9H0z" stroke="#333" stroke-width="2" mask="url(#b)"/><g transform="translate(12)"><mask id="d" fill="#fff"><use xlink:href="#c"/></mask><path d="M0 0h9v9H0z" stroke="#333" stroke-width="2" mask="url(#d)"/></g><g transform="translate(0 12)"><mask id="f" fill="#fff"><use xlink:href="#e"/></mask><path d="M0 0h9v9H0z" stroke="#333" stroke-width="2" mask="url(#f)"/></g><g transform="translate(12 12)"><mask id="h" fill="#fff"><use xlink:href="#g"/></mask><path d="M0 0h9v9H0z" stroke="#333" stroke-width="2" mask="url(#h)"/></g></g>'}}
          />
          <svg
            className="filter-icon-grid--inactive"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            height="21px"
            width="21px"
            version="1.1"
            viewBox="0 0 21 21"
            dangerouslySetInnerHTML={{__html:
              '<defs><rect id="path-1" y="0" x="0" height="9" width="9"/><rect id="path-3" y="0" x="0" height="9" width="9"/><rect id="path-5" y="0" x="0" height="9" width="9"/><rect id="path-7" y="0" x="0" height="9" width="9"/></defs><g id="Page-1" fill-rule="evenodd" fill="none"><g id="grid-view-unselected"><g id="Group-2"><g id="Rectangle-Clipped"><mask id="mask-2" fill="white"><use xlink:href="#path-1"/></mask><g id="Rectangle" stroke="#979797" stroke-width="2" mask="url(#mask-2)"><rect id="path-1" y="0" x="0" height="9" width="9"/></g></g><g id="Rectangle-Copy-Clipped" transform="translate(12)"><mask id="mask-4" fill="white"><use xlink:href="#path-3"/></mask><g id="Rectangle-Copy" stroke="#979797" stroke-width="2" mask="url(#mask-4)"><rect id="path-3" y="0" x="0" height="9" width="9"/></g></g><g id="Rectangle-Copy-3-Clipped" transform="translate(0 12)"><mask id="mask-6" fill="white"><use xlink:href="#path-5"/></mask><g id="Rectangle-Copy-3" stroke="#979797" stroke-width="2" mask="url(#mask-6)"><rect id="path-5" y="0" x="0" height="9" width="9"/></g></g><g id="Rectangle-Copy-2-Clipped" transform="translate(12 12)"><mask id="mask-8" fill="white"><use xlink:href="#path-7"/></mask><g id="Rectangle-Copy-2" stroke="#979797" stroke-width="2" mask="url(#mask-8)"><rect id="path-7" y="0" x="0" height="9" width="9"/></g></g></g></g></g>'}}
          />
        </span>        
        <span
           className="p-view-filters__icon"
           style={{opacity: 0.4, pointerEvents: 'none'}}>
          <svg
              className="filter-icon-row--active"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              height="19px"
              width="23px"
              version="1.1"
              viewBox="0 0 23 19"
              dangerouslySetInnerHTML={{__html:
                '<defs><rect id="path-1" y="0" x="0" height="5" width="5"/><rect id="path-3" y="0" x="0" height="5" width="5"/><rect id="path-5" y="0" x="0" height="5" width="5"/></defs><g id="Page-1" fill-rule="evenodd" fill="none"><g id="list-view-selected"><g id="Group"><g id="Rectangle-Clipped"><mask id="mask-2" fill="white"><use xlink:href="#path-1"/></mask><g id="Rectangle" stroke="#333" stroke-width="2" mask="url(#mask-2)"><rect id="path-1" y="0" x="0" height="5" width="5"/></g></g><path id="Line" stroke="#333" d="m8 3h15"/><path id="Line-Copy" stroke="#333" d="m8 10h15"/><path id="Line-Copy-2" stroke="#333" d="m8 17h15"/><g id="Rectangle-Copy-Clipped" transform="translate(0 14)"><mask id="mask-4" fill="white"><use xlink:href="#path-3"/></mask><g id="Rectangle-Copy" stroke="#333" stroke-width="2" mask="url(#mask-4)"><rect id="path-3" y="0" x="0" height="5" width="5"/></g></g><g id="Rectangle-Copy-2-Clipped" transform="translate(0 7)"><mask id="mask-6" fill="white"><use xlink:href="#path-5"/></mask><g id="Rectangle-Copy-2" stroke="#333" stroke-width="2" mask="url(#mask-6)"><rect id="path-5" y="0" x="0" height="5" width="5"/></g></g></g></g></g>'}}
            />
                
            <svg
              className="filter-icon-row--inactive"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              height="19"
              width="23"
              dangerouslySetInnerHTML={{__html:
                '<defs><path id="a" d="M0 0h5v5H0z"/><path id="c" d="M0 0h5v5H0z"/><path id="e" d="M0 0h5v5H0z"/></defs><g fill-rule="evenodd" fill="none"><mask id="b" fill="#fff"><use xlink:href="#a"/></mask><path d="M0 0h5v5H0z" stroke="#888" stroke-width="2" mask="url(#b)"/><path stroke="#888" d="M8 3h15"/><path stroke="#888" d="M8 10h15"/><path stroke="#888" d="M8 17h15"/><g transform="translate(0 14)"><mask id="d" fill="#fff"><use xlink:href="#c"/></mask><path d="M0 0h5v5H0z" stroke="#888" stroke-width="2" mask="url(#d)"/></g><g transform="translate(0 7)"><mask id="f" fill="#fff"><use xlink:href="#e"/></mask><path d="M0 0h5v5H0z" stroke="#888" stroke-width="2" mask="url(#f)"/></g></g>'}}
            />
        </span>
        </div>
      </div>
    );
  }
});

