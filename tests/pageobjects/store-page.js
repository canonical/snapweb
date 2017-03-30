var basepage = require('./basepage')
var acPage = require('./access-control-page')

var storePage = Object.create(basepage, {
    /**
     * define elements
     */
    privateSectionElement: {
        value: "a[href*='/store/section/private']"
    },

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
            loginpage = browser.element("#systems-snap-list");
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
            browser.waitForVisible('.p-search__field');
            var searchfield = browser.element('.p-search__field');
            searchfield.setValue(query);
            browser.element('.p-search__btn').click();
        }
    },

    sectionSnapListSelector: {
        get: function() {
            return '.p-card-deck .p-card'
        }
    },

    snaps: {
        get: function() {
            return browser.elements(this.sectionSnapListSelector);
        }
    },

    sectionSnaps: {
        get: function() {
            return browser.elements(this.sectionSnapListSelector);
        }
    },
});

module.exports = storePage
