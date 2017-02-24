var $ = require('jquery');
var Backbone = require('backbone');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var ConfirmationDialog = require('../src/js/components/confirmation-dialog.js');

describe('ConfirmationDialog', function() {
  var methods = {
      confirm: function() { },
      cancel: function() { }
    };
  var confirmationDialog = null;
  var restartButton = null;
  var powerOffButton = null;
  var cancelButton = null;
  var confirmButton = null;

  beforeEach(function() {
    this.elementHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ConfirmationDialog, {
          messageText: "Example message",
          confirmText: "Example confirm",
          confirmAction: methods.confirm,
          cancelAction: methods.cancel
      }));

    confirmationDialog = $(this.elementHtml).find('div[class=p-confirmation]');
    cancelButton = $(this.elementHtml).find('button[type=p-button--base]');
    confirmButton = $(this.elementHtml).find('button[type=p-button-neutral]');
  });

  it('should have rendered the dialog', function() {
    expect(confirmationDialog).not.toBe(null);

    expect($(this.elementHtml).find('div[class=p-confirmation__dialog__message]')).not.toBe(null);

    expect(cancelButton).not.toBe(null);
    expect(confirmButton).not.toBe(null);
  })
});
