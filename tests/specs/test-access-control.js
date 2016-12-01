var assert = require('chai').assert;
var expect = require('chai').expect;

accessControlPage = require("../pageobjects/access-control-page");
homePage = require("../pageobjects/installed-snaps-page");

describe('Access Control Page - Verify that', function() {

    beforeEach(function() {
        accessControlPage.open();
    });

    afterEach(function() {});


    it('page loads correctly', function() {

        title = browser.getTitle();
        assert.equal(title, 'Snapweb');

        assert.isNotNull(accessControlPage.homepage.value);
        assert.isNotNull(accessControlPage.settings.value);
        assert.isNotNull(accessControlPage.store.value);
        assert.isNotNull(accessControlPage.token.value);
        assert.isNotNull(accessControlPage.submit_btn.value);
        assert.isNotNull(accessControlPage.token_cmd.value);
        assert.isNotNull(accessControlPage.bugreport.value);

    });

    it('rejects invalid tokens', function() {

        var valid_token = "";
        browser.call(function() {
            return snaputil.getToken().then(function(res) {
                valid_token = res.trim();
            });

        });

        var invalid_tokens = ['', 'a', "'", '#', Array(512).join('x'), valid_token + "  ", valid_token + "'", valid_token + '#'];
        invalid_tokens.forEach(function(token) {
            accessControlPage.submit_token(token);
            accessControlPage.login_failed.waitForVisible();
            expect(accessControlPage.login_failed.getText()).to.contain('Invalid');
        });
    });


    it('accepts valid token', function() {

        var valid_token = "";
        browser.call(function() {
            return snaputil.getToken().then(function(res) {
                valid_token = res.trim();
            });

        });
        accessControlPage.submit_token(valid_token);
        var snaplist = homePage.snaplistElement;
        snaplist.waitForVisible();
        assert.isNotNull(snaplist);
        expect(snaplist, "Could not reach the home page").not.to.be.empty;
    });

    it('until not authenticated, store link will return to access-control page', function() {

        accessControlPage.store.click();
        accessControlPage.token.waitForVisible();
        assert.isNotNull(accessControlPage.token.value);

    });

    it('on subsequent time, token authentication will be skipped', function() {

        var valid_token = "";
        browser.call(function() {
            return snaputil.getToken().then(function(res) {
                valid_token = res.trim();
            });
        });
        accessControlPage.submit_token(valid_token);
        var snaplist = homePage.snaplistElement;
        snaplist.waitForVisible();
        expect(snaplist).to.not.be.empty;
        cookie = browser.getCookie('SM');
        browser.reload();
        browser.url('/');
        title = browser.getTitle();
        assert.equal(title, 'Snapweb');
        browser.setCookie(cookie);
        browser.url('/');
        var snaplist = homePage.snaplistElement;
        snaplist.waitForVisible();
        expect(snaplist).to.not.be.empty;

    });

    it('generating new token invalidates the old token', function() {

        var valid_token = "";
        browser.call(function() {
            return snaputil.getToken().then(function(res) {
                valid_token = res.trim();
            });
        });
        accessControlPage.submit_token(valid_token);
        var snaplist = homePage.snaplistElement;
        snaplist.waitForVisible();
        expect(snaplist).to.not.be.empty;
        cookie = browser.getCookie('SM');
        browser.call(function() {
            return snaputil.getToken().then(function(res) {
                valid_token = res.trim();
            });
        });
        browser.reload();
        browser.url('/');
        title = browser.getTitle();
        assert.equal(title, 'Snapweb');
        browser.setCookie(cookie);
        browser.url('/');
        accessControlPage.token.waitForVisible();
        assert.isNotNull(accessControlPage.token.value);
    });
});
