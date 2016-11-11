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
    installedsnaps: { get: function () { return browser.elements("div.b-snaplist__item h3.b-snaplist__name"); } },
    /**
     * define or overwrite page methods
     */
    open: { value: function() {
	browser.deleteCookie();
	acPage.open();
	var valid_token = "";
        browser.call(function () { 
		return snaputil.getToken().then(function (res){
                valid_token = res.trim();
                });
        });
	acPage.submit_token(valid_token);
	loginpage = browser.element('h2=Installed snaps');
	loginpage.waitForVisible();
    } },

    
    snapElement: { value: function (snap_name)  {
	
	return browser.element(".b-snaplist_grid").element("h3="+snap_name);

     } }
	
});

module.exports = installedSnapsPage
