
import $ from 'jquery';
import React from 'react';


export default class App extends React.Component {
  constructor(props) {
    super(props);

    $(document).ajaxError((event, jqxhr, settings, exception) => {
      if (jqxhr.status === 401 && window.location.pathname != '/access-control') {
        this.props.router.push('/access-control');
      }
    });
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
};
