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
    addsnapscard: {
        get: function() {
            var cards = browser.elements("div[role='button']").value
            return cards[cards.length-1]
        }
    },
    installedsnaps: {
        get: function() {
            return browser.elements("div[role='button']")
        }
    },
    systemsnaps: {
        get: function() {
            return browser.elements("#systems-snap-list tr")
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
            loginpage = browser.element('h2=Apps installed');
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

    systemSnapElement: {
        value: function(snap_name) {
          var systemsnaps = browser.elements("#systems-snap-list span");
          systemsnaps.waitForVisible();
          for (var i = 0; i < systemsnaps.value.length; ++i) {
            if (systemsnaps.value[i].getText() === snap_name) {
                    return systemsnaps.value[i];
                }
            }
            return null;

        }
    },

    snapwebsnap: {
        get: function() {
            return this.systemSnapElement("snapweb");
        }
    },

    snapInstallButton: {
        value: function(snap_name) {
            return browser.element(".p-card-deck a[href='/snap/" + snap_name + "'] .b-installer");
        }
    }
});

module.exports = installedSnapsPage
