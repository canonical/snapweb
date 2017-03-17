var assert = require('chai').assert;
var expect = require('chai').expect;

storePage = require("../pageobjects/store-page.js");
snapDetailsPage = require("../pageobjects/snap-details-page.js");

describe('Store Page - Verify that', function() {

    before(function() {
        // gets a new token and enter snapweb
        storePage.open();
    });

    beforeEach(function() {
        // start from the home page for each test
        browser.url('/store');
        browser.waitForVisible('.p-search__field');
    });

    it('front page loads correctly', function() {
        // just opening the storePage in "beforeEach" above does prove it
        assert(true);
    });

    it('a private section exists', function() {

        browser.waitForVisible(storePage.sectionSelector('private'));
        storePage.private.click();
        privatepage = browser.element('h2=Private snaps')
        privatepage.waitForVisible();
        expect(privatepage.getText(), "Failed to load private section page").to.contain('Private snaps');
    });

    it('click section brings up associated filtered list', function() {
        browser.waitForVisible(storePage.sectionSelector('featured'));
        storePage.section('featured').click();
        featuredpage = browser.element('h2=featured')
        featuredpage.waitForVisible();
        expect(featuredpage.getText(), "Failed to load featured section page").to.contain('featured');
    });

    it('default store page should display featured snaps', function() {
        // Rely on displayed snap count for now for the heuristic
        browser.waitForVisible(storePage.sectionSnapListSelector);
        defaultSnapListCount = storePage.sectionSnaps.value.length
 
        browser.waitForVisible(storePage.sectionSelector('featured'));
        storePage.section('featured').click();
        featuredpage = browser.element('h2=featured')
        featuredpage.waitForVisible();

        browser.waitForVisible(storePage.sectionSnapListSelector);
        assert.equal(
          storePage.sectionSnaps.value.length,
          defaultSnapListCount,
          "Default store page does not correspond to featured snap list"
        );
    });

    it('search non exact match', function() {
        storePage.search('hello-w');
        browser.waitForVisible(storePage.searchResultSnapListSelector);
        snaps = storePage.snaps;
        assert.isAbove(snaps.value.length, 0, "No snaps found");
    });

    it('search non exact match and check snap details', function() {
        storePage.search('hello-w');
        browser.waitForVisible(storePage.searchResultSnapListSelector);
        storePage.snaps.value[0].click();
        browser.waitForVisible(snapDetailsPage.snapTitleElement);
        assert.isNotNull(snapDetailsPage.snap.value, "Snap details not found");
    });
});
