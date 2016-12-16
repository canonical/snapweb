var basepage = require('./basepage')
var acPage = require('./access-control-page')

var installedSnapsPage = Object.create(basepage, {
    /**
     * define elements
     */
    homepage: {
        get: function() {
            return browser.element("header.p-navigation div.p-navigation__logo a[href*='/']");
        }
    },
    store: {
        get: function() {
            return browser.element("nav.p-navigation__nav a[href*=store]");
        }
    },
    addsnapicon: {
        get: function() {
            return browser.element("div.region-installed div.p-card a[href*=store] svg.p-card__icon");
        }
    },
    settings: {
        get: function() {
            return browser.element("nav.p-navigation__nav a[href*=settings]");
        }
    },
    bugreport: {
        get: function() {
            return browser.element("div.b-layout__footer a[href*=bugs]");
        }
    },
    browsestore: {
        get: function() {
            return browser.element("a=Browse store");
        }
    },
    addmoresnaps: {
        get: function() {
            return browser.element("a=Add more snaps for this device");
        }
    },
    installedsnaps: {
        get: function() {
            return browser.elements(".p-card h3.js-snap-title");
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
                    valid_token = res.trim();
                });
            });
            acPage.submit_token(valid_token);
            loginpage = browser.element('h2=Installed snaps');
            loginpage.waitForVisible();
        }
    },

    snapElement: {
        value: function(snap_name) {

            var pcarddeck = browser.element(".p-card-deck");
            pcarddeck.waitForVisible();
            return pcarddeck.element("h3=" + snap_name);

        }
    },

    snapwebsnap: {
        get: function() {
            return this.snapElement("snapweb");
        }
    },

    snapInstallButton: {
        value: function(snap_name) {
            return browser.element(".p-card-deck a[href='/snap/" + snap_name + "'] .b-installer");
        }
    }
});

module.exports = installedSnapsPage
