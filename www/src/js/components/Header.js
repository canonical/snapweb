import React, { Component } from 'react'
import css from './Header.css'

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
         className={css.Header}
         style={styles}
      > 
        <div className={css.HeaderIn}>
          <If cond={this.props.hasBack}>
            <div
               className={css.HeaderBack}
              role='button'
              tabIndex='0'
               onClick={(event) => this.handleBackClick(event)}
            >
              <span>
                <Icon name='previous' size='24px' />
              </span>
              <span className={css.HeaderBackText}>Device</span>
              <div className={css.HeaderActiveOverlay} />
            </div>
          </If>
          <If cond={this.props.signedIn && this.props.hasSignIn}>
            <div
               className={css.HeaderProfile}
               role='button'
               tabIndex='0'
               onClick={(event) => this.handleProfileClick(event)}
               >
              <img width='24' height='24' src="" alt='' />
              <span>{props.profilename || defaultProfileName}</span>
              <div className={css.HeaderActiveOverlay} />
            </div>
          </If>
          <If cond={this.props.hasSignIn}>
            <div
               className={css.HeaderSignIn}
              role='button'
              tabIndex='0'
               onClick={(event) => this.handleSignInClick(event)}
            >
              <span>{signedInText}</span>
              <div className={css.HeaderActiveOverlay} />
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
