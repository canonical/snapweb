var basepage = require('./basepage')
var acPage = require('./access-control-page')

var snapDetailsPage = Object.create(basepage, {
    /**
     * define elements
     */
    snapTitleElement: {
        get: function() {
            return '.b-snap .b-snap__title';
        }
    },
    snapDetailListElements: {
        get: function() {
            return '.p-list--divided .p-list__item';
        }
    },

    snapDetail: {
        value: function(nth) {
            return browser.element(this.snapDetailListElements + ":nth-child(" + nth  + ")");
        }
    },
    snap: {
        get: function() {
            return browser.element(this.snapTitleElement);
        }
    },
});

module.exports = snapDetailsPage
