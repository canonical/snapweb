import $ from 'jquery';
import React from 'react';

import { Footer } from 'snapweb-toolkit';
import { Header } from './header';

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
      const brandData = {
          color: '#333',
          brandName: 'Ubuntu',
          logoUrl: 'logo.png',
          website: 'http://www.ubuntu.com/',
          termsUrl: 'http://www.ubuntu.com/'
      };
      const section = 'home';

      let styles = {
          main: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100px',
              minWidth: '1020px',
          },
          header: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingTop: '25px',
              paddingBottom: '25px',
              pointerEvents: 'none'
          },
          content: {
              flexGrow: 1,
          }
      };
      
      return (
          <div className='App'>
            <style>{`a { color: ${brandData.color || '#333'} }`}</style>
            <div className='App-main' style={styles.main}>
              <div className='App-header' style={styles.header}>
                <Header 
                   hasBack={section !== 'home'}
                   hasSignIn={section === 'home'}
                   signedIn={true}
                   currentSection={section}
                   onMenuItemClick={this.handleMenuItemClick}
                   onProfileClick={this.handleProfileClick}
                   onBackClick={this.handleBackClick}
                   />
              </div>
              <main className='App-content' style={styles.content}>
              </main>
              <div className='App-footer'>
                <Footer 
                   name={brandData.brandName}
                   copyright={`© ${(new Date()).getFullYear()} ${brandData.brandName}`}
                   logo={brandData.logoUrl}
                   link={brandData.website}
                   termsUrl={brandData.termsUrl}
                   />
              </div>
            </div>
            <div dangerouslySetInnerHTML={{__html: this.state.content}} />
          </div>
      );
  }
}


