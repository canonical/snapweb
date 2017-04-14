import React, { PureComponent } from 'react'
import css from './DeviceBanner.css'

import {
  If,
  Button,
  Icon,
} from 'snapweb-toolkit'

class DeviceBanner extends PureComponent {

  handleDocumentationClick = (event) => {
    event.currentTarget.blur()
    this.props.onDocumentationClick()
  }

  handleSettingsClick = (event) => {
    event.currentTarget.blur()
    this.props.onSettingsClick()
  }

  render() {

    const {
      brandName,
      image,
      deviceName,
      deviceId,
    } = this.props

    return (
      <section className={css.DeviceBanner}>
        <If cond={image}>
          <div className={css.DeviceBannerImage}>
            <img alt='' src={image} />
          </div>
        </If>
        <div>
          <h1 className={css.DeviceBannerName}>{deviceName}</h1>
          <p className={css.DeviceBannerBrandName}>
            <strong>{brandName}</strong>
          </p>
          <p className={css.DeviceBannerId}>
            {deviceId}
          </p>
          <div className={css.DeviceBannerButtonContainer}>
            <Button
              style={{
                marginRight: '10px',
                minWidth: '220px',
              }}
              onClick={this.handleDocumentationClick}
            >
              <span>
                Documentation
                <span style={{ marginLeft: '5px' }}>
                  <Icon name='external' />
                </span>
              </span>
            </Button>
            <Button
              style={{
                minWidth: '220px',
              }}
              label={'Settings'}
              onClick={this.handleSettingsClick}
            />
          </div>
          
        </div>
      </section>
    )
  }
}

export default DeviceBanner
