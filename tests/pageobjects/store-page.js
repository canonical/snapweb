var basepage = require('./basepage')
var acPage = require('./access-control-page')

var storePage = Object.create(basepage, {
    /**
     * define elements
     */
    private: {
        get: function() {
            return browser.element(this.sectionSelector('private'));
        }
    },
    /**
     * define or overwrite page methods
     */
    open: {
        value: function() {
            browser.deleteCookie();
            acPage.open();
            var valid_token = "";
            browser.call(function() {
                return snaputil.getToken().then(function(res) {
                    res = res || '';
                    valid_token = res.trim();
                });
            });
            acPage.submit_token(valid_token);
            loginpage = browser.element(".region-installed");
            loginpage.waitForVisible();
            browser.url('/store');
        }
    },
    sectionSelector: {
        value: function(name) {
            return "a[href*='/store/section/" + name + "']"
        }
    },
    section: {
        value: function(name) {
            return browser.element(this.sectionSelector(name))
        }
    },

    search: {
        value: function(query) {
            var searchfield = browser.element('p-search__field');
            searchfield.waitForVisible();
            searchfield.sendKeys(query);
            searchfield.sendKeys(Keys.RETURN);
        }
    },

    snapListSelector: {
        get: function() {
            return '#js-snap-list .p-card'
        }
    },

    snaps: {
        value: function() {
            return browser.elements(this.snapListSelector);
        }
    },
});

module.exports = storePage
