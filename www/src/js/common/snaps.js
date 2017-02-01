var Config = require('../config.js');

module.exports = {
  // TODO: remove dep on DOM event
  handleInstallEvent: function(event, model) {
    event.preventDefault();

    var status = model.get('status');
    var isInstallable = model.get('isInstallable');

    if (!isInstallable) {
      return;
    }

    if (status === Config.INSTALL_STATE.INSTALLED ||
        status === Config.INSTALL_STATE.ACTIVE) {
      // remove
      model.set({
        status: Config.INSTALL_STATE.REMOVING
      });
      model.destroy({
        dataType : 'json',
        silent: true
      });
    } else if (status === Config.INSTALL_STATE.REMOVED) {
      // install
      model.save({
        status: Config.INSTALL_STATE.INSTALLING
      }, {
        dataType : 'json'
      });
    }

    return false;
  },
  handleEnableEvent: function(event, model) {
    event.preventDefault();

    var status = model.get('status');
    var isInstalled = model.get('isInstalled');

    console.log(isInstalled)
    if (!isInstalled) {
      return;
    }

    if (status === Config.INSTALL_STATE.INSTALLED) {
      //
      console.log('enabling')
      model.save({
        status: Config.INSTALL_STATE.ENABLING
      }, {
        dataType : 'json',
        type: 'post'
      });
    } if (status === Config.INSTALL_STATE.ACTIVE) {
      console.log('disabling')
      model.save({
        status: Config.INSTALL_STATE.DISABLING
      }, {
        dataType : 'json',
        type: 'post'
      });
    }

    return false;
  },
  getShowSnapUrlFor: function(model) {
    if (!model) {
      return;
    }
    var name = model['id'];
    return '/snap/' + name;
  },
};
