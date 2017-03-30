import React, { Component } from 'react'
import './header.css'

import {
  ContentWrapper,
  Icon,
  If,
 } from 'snapweb-toolkit'

const defaultProfileName = 'John Smith'

class Header extends Component {

  handleBackClick(event) {
    if (this.props.hasBack) {
      event.currentTarget.blur()
      this.props.onBackClick()
    }
  }
  handleProfileClick(event) {
    event.currentTarget.blur()
    if (this.props.onProfileClick) {
      this.props.onProfileClick()
    }
  }
  handleSignInClick(event) {
    event.currentTarget.blur()
    if (this.props.onSignInClick) {
      this.props.onSignInClick()
    }
  }
  
  render() {
    const { props } = this
    const styles = props.customColor? {
      borderColor: props.customColor,
    } : {}
    const signedInText=props.signedIn? 'Logout' : 'Log in'

    const img = (
      <img className='Header-logo'
        src={this.props.logo}
        alt={name}
        height='48'
      />
    )

    return (
      <header
        className='Header'
        style={styles}
      > 
        <div className='Header-in'>
          <If cond={this.props.hasBack}>
            <div
              className='Header-back'
              role='button'
              tabIndex='0'
              onClick={this.handleBackClick}
            >
              <span>
                <Icon name='previous' size='24px' />
              </span>
              <span className='Header-back-text'>Device</span>
              <div className='Header-activeOverlay' />
            </div>
          </If>
          <If cond={this.props.signedIn && this.props.hasSignIn}>
            <div
              className='Header-profile'
              role='button'
              tabIndex='0'
              onClick={this.handleProfileClick}
               >
              <img width='24' height='24' src="" alt='' />
              <span>{props.profilename || defaultProfileName}</span>
              <div className='Header-activeOverlay' />
            </div>
          </If>
          <If cond={this.props.hasSignIn}>
            <div
              className='Header-signIn'
              role='button'
              tabIndex='0'
              onClick={this.handleSignInClick}
            >
              <span>{signedInText}</span>
              <div className='Header-activeOverlay' />
            </div>
          </If>
        </div>
        <If cond={this.props.logo}>
          <ContentWrapper>
            {img}
          </ContentWrapper>
        </If>
      </header>
    )
  }
}

export default Header;
