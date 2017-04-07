var assert = require('chai').assert;
var expect = require('chai').expect;

snapDetailsPage = require("../pageobjects/snap-details-page.js");
snapsPage = require("../pageobjects/installed-snaps-page.js");

var storeHeaderTitle = 'App store';
function storeHeaderElement() {
  return browser.element('h1=' + storeHeaderTitle);
}

describe('Installed Snaps Page - Verify that', function() {

    before(function() {
        // gets a new token and enter snapweb
        snapsPage.open();
    });

    beforeEach(function() {
        // start from the home page for each test
        browser.url('/');
        browser.waitForVisible(snapsPage.addsnapscardSelector);
    });

    it('page loads correctly', function() {

        title = browser.getTitle();
        assert.equal(title, 'Snapweb');

        assert.isNotNull(snapsPage.homepage.value);
        assert.isNotNull(snapsPage.settings.value);
        assert.isNotNull(snapsPage.store.value);
        assert.isNotNull(snapsPage.addsnapscard.value);
        assert.isNotNull(snapsPage.snapwebsnap.value);
    });

    it('installed snaps listed are same as on device', function() {

        title = browser.getTitle();
        assert.equal(title, 'Snapweb');

        var snapslist_device = "";
        var snapslist_raw = "";
        browser.call(function() {
            return snaputil.listSnaps().then(function(res) {
                snapslist_raw = res.trim();
            });
        });

        snapslist_device = snapslist_raw.split('\n'); //expecting each snap entry on a new line
        snapslist_snapweb = snapsPage.installedsnaps.value.slice(-1);
        snapslist_snapweb.forEach(function(snap) {
          var n = snap.element('p:first-of-type').getText();
          if (n.toLowerCase() === 'get more apps') {
            return
          }
          expect(snapslist_raw).to.include(n);
        });

        systemsnaps_snapweb = snapsPage.systemsnaps;
        // expect(snapslist_snapweb.value.concat(systemsnaps_snapweb.value)).to.have.length(snapslist_device.length - 1, "Snaps installed on device didn't match");
    });

    it('clicking store link takes the user to store', function() {

        snapsPage.store.click();
        storepage = storeHeaderElement()
        storepage.waitForVisible();
        expect(storepage.getText(), "Failed to load store page").to.contain(storeHeaderTitle);

    });

    it('Browse store button takes the user to store', function() {

        snapsPage.addsnapscard.click();
        storepage = storeHeaderElement()
        storepage.waitForVisible();
        expect(storepage.getText(), "Failed to load store page").to.contain(storeHeaderTitle);

    });

    it('Add more snaps button takes the user to store', function() {

        snapsPage.addsnapscard.click();
        storepage = storeHeaderElement()
        storepage.waitForVisible();
        expect(storepage.getText(), "Failed to load store page").to.contain(storeHeaderTitle);

    });

    it("Clicking on snap entry opens the about snap's about page", function() {

        var snap_name = 'snapweb';
        var snap = snapsPage.systemSnapElement(snap_name);
        snap.waitForVisible();
        snap.click();
        browser.waitForVisible(snapDetailsPage.snapTitleElement);
        expect(snapDetailsPage.snap.getText(), "Failed to open snap's about page").to.equal(snap_name);
        assert.isNotNull(snapDetailsPage.snapDetail(3).value, "Snap has no update date");
    });

    xit('snapweb updates the page when snap is installed/removed direclty on the device', function() {
        var snap_name = "hello-world";
        var re_removed = new RegExp("cannot find snap|" + snap_name + ".*removed")
        var re_installed = new RegExp(snap_name + ".*installed");

        //Remove the snap in case it is already installed
        browser.call(function() {
            return snaputil.removeSnap(snap_name);
        });
        browser.refresh();
        //Confirm that snap doesn't exist on page
        snapslist_snapweb = snapsPage.installedsnaps;
        snapslist_snapweb.value.forEach(function(snap) {
            expect(snap.getText()).to.not.equal(snap_name);
        });

        //Install the snap and refresh page
        browser.call(function() {
            return snaputil.installSnap(snap_name).then(function(res) {
                expect(res).to.match(re_installed, res);
            });
        });

        browser.refresh();

        //Check if snap installed is now shown on page
        var snap = snapsPage.snapElement(snap_name);
        snap.waitForVisible();
        expect(snap.getText()).to.equal(snap_name);

        //Remove the snap and DO NOT refresh the page
        browser.call(function() {
            return snaputil.removeSnap(snap_name).then(function(res) {
                expect(res).to.match(re_removed, res);
            });
        });

        // The page should have been udpated
        snapslist_snapweb = snapsPage.installedsnaps;
        snapslist_snapweb.value.forEach(function(snap) {
            expect(snap.getText()).to.not.equal(snap_name);
        });
    });

    xit('snapweb updates the page when snap is removed from ui buttons', function() {
        var snap_name = "hello-world";
        var re_installed = new RegExp(snap_name + ".*installed");

        //Remove the snap in case it is already installed
        browser.call(function() {
            return snaputil.removeSnap(snap_name);
        });
        browser.refresh();

        //Install the snap and refresh page
        browser.call(function() {
            return snaputil.installSnap(snap_name).then(function(res) {
                expect(res).to.match(re_installed, res);
            });
        });
        browser.refresh();

        //Check if snap installed is now shown on page
        var snap = snapsPage.snapElement(snap_name);

        snap.waitForVisible();
        var removeButton = snapsPage.snapInstallButton(snap_name);
        assert.isNotNull(removeButton.element('.b-installer_do_remove'));
        expect(removeButton.element('.b-installer__button').getText()).to.be.string('Remove');

        removeButton.click();

        var installButton = snapsPage.snapInstallButton(snap_name);
        installButton.element('.b-installer_do_install').waitForVisible();
        expect(installButton.element('.b-installer__button').getText()).to.be.string('Install');
    });
});
