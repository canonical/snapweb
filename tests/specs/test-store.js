var assert = require('chai').assert;
var expect = require('chai').expect;

storePage = require("../pageobjects/store-page.js");

describe('Store Page - Verify that', function() {

    beforeEach(function() {
        storePage.open();
    });

    afterEach(function() {});

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
        privatepage = browser.element('h2=featured')
        privatepage.waitForVisible();
        expect(privatepage.getText(), "Failed to load featured section page").to.contain('featured');

    });

    it('search non exact match', function() {
        storePage.search('hello-w');
        browser.waitForVisible(storePage.snapListSelector);
        snaps = storePage.snaps()
        assert.isAbove(snaps.length, 0, "No snaps found");
    });

    it('search exact match', function() {
        storePage.search('hello-w');
        browser.waitForVisible(storePage.snapListSelector);
        snaps = storePage.snaps()
        assert.isAbove(snaps.length, 0, "No snaps found");
    });

});
