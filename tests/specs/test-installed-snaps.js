var assert = require('chai').assert;
var expect = require('chai').expect;

snapsPage = require("../pageobjects/installed-snaps-page.js");

describe('Installed Snaps Page - Verify that', function() {

    beforeEach(function () {
        snapsPage.open();
        });

    afterEach(function () {
        });


    it('page loads correctly', function () {

        title = browser.getTitle();
        assert.equal(title, 'Snapweb');

        assert.isNotNull(snapsPage.homepage.value);
        assert.isNotNull(snapsPage.store.value);
        assert.isNotNull(snapsPage.bugreport.value);
        assert.isNotNull(snapsPage.browsestore.value);
        assert.isNotNull(snapsPage.addmoresnaps.value);
        assert.isNotNull(snapsPage.snapwebsnap.value);

    });

    it('installed snaps listed are same as on device', function () {

        title = browser.getTitle();
        assert.equal(title, 'Snapweb');

	var snapslist_device = "";
	var snapslist_raw = "";
    	browser.call(function () { 
		return snaputil.listSnaps().then(function (res){
		snapslist_raw = res.trim();
                });
        });
	
        snapslist_device = snapslist_raw.split('\n'); //expecting each snap entry on a new line
	snapslist_snapweb = snapsPage.installedsnaps;
        snapslist_snapweb.value.forEach(function(snap) {
		expect(snapslist_raw).to.include(snap.getText());
        });
	
	expect(snapslist_snapweb.value).to.have.length(snapslist_device.length-1, "Snaps installed on device didn't match");
    });

});
