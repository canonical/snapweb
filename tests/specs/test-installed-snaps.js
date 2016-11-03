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
        assert.isNotNull(snapsPage.coresnap.value);

    });

});
