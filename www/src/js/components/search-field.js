/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      query: this.props.query
    }
  },

  render: function() {
    return (
      <div className="col-11">
        <form action="/search" className="p-search">
          <input
            className="p-search__field"
            placeholder="Search"
            maxLength="255"
            name="q"
            value={this.state.query}
            onChange={function(event){ this.setState({query: event.target.value})}.bind(this)}
          />
          <button type="submit" className="p-search__btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 96 96.000001"
              dangerouslySetInnerHTML={{__html:
                '<path color="#000" overflow="visible" fill="none" d="M96 0v96H0V0z"/><path style="line-height:125%;-inkscape-font-specification:Ubuntu;text-align:center" d="M72.396 73.883c.017.02.04.035.057.056.02.025.03.056.05.082zM23.56 73.896l-.107.14c.02-.026.03-.058.05-.083.017-.02.04-.035.058-.057z" font-size="15" font-family="Ubuntu" letter-spacing="0" word-spacing="0" text-anchor="middle" fill="gray"/><path style="line-height:normal;font-variant-ligatures:none;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;block-progression:tb;shape-padding:0;isolation:auto;mix-blend-mode:normal" d="M48 16c-17.65 0-32 14.35-32 32 0 17.648 14.35 31.998 32 31.998s32-14.35 32-32C80 30.35 65.65 16 48 16zm0 3.998c15.488 0 28 12.513 28 28C76 63.49 63.487 76 48 76c-15.486 0-28-12.513-28-28 0-15.49 12.514-28.002 28-28.002z" color="#000" font-family="sans-serif" white-space="normal" overflow="visible" solid-color="#000000" fill="gray"/><path style="line-height:normal;font-variant-ligatures:none;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;block-progression:tb;shape-padding:0;isolation:auto;mix-blend-mode:normal" d="M88.122 83.88l-4.244 4.24-16.664-16.663 4.244-4.24 16.664 16.662z" color="#000" font-family="sans-serif" white-space="normal" overflow="visible" solid-color="#000000" fill="gray"/>'}}
            />
          </button>
        </form>
      </div>
    );
  }
})

