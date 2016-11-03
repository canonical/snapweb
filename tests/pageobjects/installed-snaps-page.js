var page = require('./page')
var acPage = require('./access-control-page')
 
var installedSnapsPage = Object.create(page, {
    /**
     * define elements
     */
    homepage: { get: function () { return browser.element("header.banner div.logo a[href*='/']"); } },
    store:     { get: function () { return browser.element("header.banner a[href*=store]"); } },
    bugreport:    { get: function () { return browser.element("div.b-layout__footer a[href*=bugs]"); } },
    browsestore:    { get: function () { return browser.element("a=Browse store"); } },
    addmoresnaps:    { get: function () { return browser.element("a=Add more snaps"); } },
    snapwebsnap:    { get: function () { return browser.element(".b-snaplist_grid").element("h3=snapweb"); } },
    coresnap:    { get: function () { return browser.element(".b-snaplist_grid").element("h3=core"); } },

    /**
     * define or overwrite page methods
     */
    open: { value: function() {
	browser.deleteCookie();
	acPage.open();
	acPage.submit_token(process.env.TOKEN.trim());
	loginpage = browser.element('h2=Installed snaps');
	loginpage.waitForVisible();
    } }

});

module.exports = installedSnapsPage
