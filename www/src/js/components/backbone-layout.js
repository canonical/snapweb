
import $ from 'jquery'
import React from 'react';

import LayoutView from '../views/layout';


export default class BackboneLayout extends React.Component {
  state = {
    content: null
  }

  constructor(props) {
    super(props);
    this.layoutView = new LayoutView({
        render: (html) => this.setState({content: html})
      });
  }

  componentDidMount() {
    this.layoutView.setElement($('.b-layout'));
    this.layoutView.render();
    const args = Object.values(this.props.isQuery ? this.props.location.query : this.props.params);
    this.props.controller[this.props.method].apply(this.props.controller, args);
  }

  render() {
    return (
      <div className="b-layout">
        <div className="b-layout__alert"></div>
        <div className="b-layout__banner"></div>
        <div className="b-layout__main"></div>
        <div className="b-layout__footer"></div>
        <div dangerouslySetInnerHTML={{__html: this.state.content}}/>
      </div>
    );
  }
}

