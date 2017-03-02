
import React from 'react';


class ConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var confirmText = this.props.confirmText || "Ok";

    return (
        <div className="p-confirmation">
          <div className="p-confirmation__overlay">
            <div className="p-confirmation__dialog">
              <div
                className="p-confirmation__dialog__message"
                dangerouslySetInnerHTML={{__html: this.props.messageText}} />
              <div className="p-confirmation__dialog__buttons">
                <button
                  type="p-button--base"
                  style={{marginRight: "20px"}}
                  onClick={this.props.cancelAction} >
                  Cancel
                </button>
                <button
                  type="p-button--neutral"
                  style={{marginRight: "20px"}}
                  onClick={this.props.confirmAction}>
                  {confirmText} 
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

module.exports = ConfirmationDialog;
