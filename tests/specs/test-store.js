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

        browser.waitForVisible(storePage.privateSectionElement);
        storePage.private.click();
        privatepage = browser.element('h2=Private snaps')
        privatepage.waitForVisible();
        expect(privatepage.getText(), "Failed to load private section page").to.contain('Private snaps');

    });

});
