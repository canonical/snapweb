
import $ from 'jquery';
import React from 'react';

import './app.css';

import { Footer } from 'snapweb-toolkit';
import Header from '../components/header';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    $(document).ajaxError((event, jqxhr, settings, exception) => {
      if (jqxhr.status === 401 && window.location.pathname != '/access-control') {
        this.props.router.push('/access-control');
      }
    });
  }

  handleMenuItemClick(id) {
    this.goto(id === 'home'? '' : id);
  }
  
  handleProfileClick() {
    // do nothing for now
  }
  
  handleBackClick() {
    this.goto('');
  }

  render() {
    const brandData = {
      color: '#333',
      brandName: 'Ubuntu',
      logoUrl: 'logo.png',
      website: 'http://www.ubuntu.com/',
      termsUrl: 'http://www.ubuntu.com/'
    };

    // FIXME: get section from router
    const section = 'home';

    return (
      <div className='App'>
        <style>{`a { color: ${brandData.color || '#333'} }`}</style>
        <div className='App-main'>
          <div className='App-header'>
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
          <main className='App-content'>
            { this.props.children }
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
      </div>
    );
  }
};
