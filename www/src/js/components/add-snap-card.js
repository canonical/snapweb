var React = require('react');


module.exports = React.createClass({
  render: function() {
    return (
      <div className="p-card">
        <a href="/store">
          <svg
            className="p-card__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="125"
            height="125"
            dangerouslySetInnerHTML={{__html:
              '<g fill="none" fill-rule="evenodd"><path fill="#fff" stroke="#CDCDCD" d="M57 113c30.928 0 56-25.072 56-56S87.928 1 57 1 1 26.072 1 57s25.072 56 56 56z"/><path fill="#3EB34F" d="M57.293 90.007c18.067 0 32.714-14.647 32.714-32.714S75.36 24.58 57.293 24.58 24.58 39.225 24.58 57.292s14.646 32.714 32.713 32.714z"/><g fill="#fff"><path d="M57 43.246h.982v27.51H57z"/><path d="M71.246 56.508v.982h-27.51v-.982z"/></g></g>'}}
          />
        </a>
        <h3 className="p-card__title">
          <a href="/store">Add more snaps for this device</a>
        </h3>
        <footer className="p-card__footer">
          <div className="u-float--right">
            <a className="p-button--base button" href="/store">Browse store</a>
          </div>
        </footer>
      </div>
    );
  }
})
