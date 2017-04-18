import $ from 'jquery';
import React from 'react';

import LayoutView from '../views/layout';

export default class BackboneLayout extends React.Component {
  constructor(props) {
    super(props);
    this.layoutView = new LayoutView({
        render: (html) => this.setState({content: html})
      });
    this.state = {
      content: null
    };
  }

  componentDidMount() {
    this.layoutView.setElement($('.b-layout'));
    this.layoutView.render();
    const args = Object.values(this.props.isQuery ? this.props.location.query : this.props.params);
    this.props.controller[this.props.method].apply(this.props.controller, args);
  }

  render() {
      return (
        <main className='App-content'>
          <div dangerouslySetInnerHTML={{__html: this.state.content}} />
        </main>
      );
  }
}


