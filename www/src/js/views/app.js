
import $ from 'jquery';
import React from 'react';

import css from './app.css';

// using local components until changes migrate back to the toolkit version
import Header from '../components/Header';
import Footer from '../components/Footer';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    $(document).ajaxError((event, jqxhr, settings, exception) => {
      if (jqxhr.status === 401 && window.location.pathname != '/access-control') {
        this.props.router.push('/access-control');
      }
    });
  }

  goto(path) {
    const pathname = `/${!path || path === 'home'? '' : path}`
    this.props.router.push(path);
  }
  
  handleMenuItemClick(id) {
    this.goto(id === 'home'? '/' : id);
  }
  
  handleProfileClick() {
    // do nothing for now
  }
  
  handleBackClick() {
    this.goto('/');
  }

  render() {

    const brandData = {
      color: '#333',
      website: 'http://www.ubuntu.com/',
    };

    var section = window.location.pathname.split('/')[1];
    if (section == '') {
      section = 'home';
    }
   
    return (
      <div className='App' >
        <style>{`a { color: ${brandData.color || '#333'} }`}</style>
        <div className={css.AppMain}>
          <div className={css.AppHeader}>
            <Header 
               hasBack={section !== 'home'}
               hasSignIn={section === 'home'}
               signedIn={false}
               currentSection={section}
               onMenuItemClick={(id) => this.handleMenuItemClick(id)}
               onProfileClick={() => this.handleProfileClick()}
               onBackClick={() => this.handleBackClick()}
               />
          </div>
          <main className={css.AppContent}>
            { this.props.children }
          </main>
          <div style={{padding: '10px 30px'}}>
            <Footer />
          </div>
        </div>
      </div>
    );
  }
};
