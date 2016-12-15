var basepage = require('./basepage')
var acPage = require('./access-control-page')

var snapDetailsPage = Object.create(basepage, {
    /**
     * define elements
     */
    snapTitleElement: {
        get: function() {
            return '.b-snap';
        }
    },

    snap: {
        get: function() {
            return browser.element(this.snapTitleElement);
        }
    },
});

module.exports = snapDetailsPage
