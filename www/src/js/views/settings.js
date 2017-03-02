
import React from 'react'

import SettingsTimeView from './settings-time'
import SettingsDeviceView from './settings-device'
import SettingsProfileView from './settings-profile'
import SettingsUsersView from './settings-users'
import SettingsUpdatesView from './settings-updates'

import DeviceInfo from '../models/device-info'
import TimeInfo from '../models/time-info'


const iconPath = "/public/images/icons/";
const SettingsViews = [{
   view: SettingsDeviceView,
   icon: iconPath + 'deviceinfo-icon.svg',
   text: 'Device Information',
   model: DeviceInfo
  }, {
    view: SettingsProfileView,
    icon: iconPath + 'profile-icon.svg',
    text: 'Profile'
  }, {
    view: SettingsUsersView,
    icon: iconPath + 'users-icon.svg',
    text: 'Users'
  }, {
    view: SettingsUpdatesView,
    icon: iconPath + 'updates-icon.svg',
    text: 'Updates'
  }, {
    view: SettingsTimeView,
    icon: iconPath + 'datetime-icon.svg',
    text: 'Date and time',
    model: TimeInfo
  },
];

const MenuItem = ({icon, text, onClick, active = false}) =>
  <li
    className={`p-list__item js-list-item ${active ? "is-active" : ""}`}
    onClick={onClick}> 
    <img 
      className="p-list__icon"
      src={icon}
      width="24"
      height="24" />
    {text}
  </li>;

const SettingsView = ({index}) => {
  var modelClass = SettingsViews[index].model;
  if (modelClass != null) {
    var model = new modelClass;
    model.fetch();
    return React.createElement(SettingsViews[index].view, {model: model});
  }
  return React.createElement(SettingsViews[index].view);
};

class SettingsLayoutView extends React.Component {
  state = {
    activeViewIndex: 0
  };

  menuItemClick = (index) => {
    if (this.state.activeViewIndex != index)
      this.setState({activeViewIndex: index})
  };

  render() {
    const menuItems = SettingsViews.map((info, index) => 
      <MenuItem
        key={index}
        icon={info.icon}
        text={info.text}
        active={this.state.activeViewIndex == index}
        onClick={() => this.menuItemClick(index)}
      />);

    return (
      <div className="row">
        <div className="col-4 suffix-1">
          <ul className="p-list--menu">
            {menuItems}
          </ul>
        </div>

        <div className="col-8">
          <SettingsView index={this.state.activeViewIndex} />
        </div>
      </div>
    );
  }
};

module.exports = SettingsLayoutView;
