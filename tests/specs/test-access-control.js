var assert = require('chai').assert;
var expect = require('chai').expect;

accessControlPage = require("../pageobjects/access-control-page");

describe('Access Control Page - Verify that', function() {
   
    beforeEach(function () {
	accessControlPage.open();
	}); 

    afterEach(function () {
	});

 
    it('loads correctly', function () {

		title = browser.getTitle();
		assert.equal(title, 'Snapweb');

		assert.isNotNull(accessControlPage.homepage.value);
		assert.isNotNull(accessControlPage.store.value);
		assert.isNotNull(accessControlPage.token.value);
		assert.isNotNull(accessControlPage.submit_btn.value)
		assert.isNotNull(accessControlPage.token_cmd.value);
		assert.isNotNull(accessControlPage.bugreport.value);
	
    });

    it('rejects invalid tokens', function () {

		var valid_token = "";
        browser.call(function () { 
                return snaputil.getToken().then(function (res){
                valid_token = res.trim();
                });

        });

		var invalid_tokens = ['','a',"'", '#', Array(512).join('x'),valid_token+"  ", valid_token+"'", valid_token+'#'];
		invalid_tokens.forEach(function(token){
		 	accessControlPage.submit_token(token);
			accessControlPage.login_failed.waitForVisible();
		 	expect(accessControlPage.login_failed.getText()).to.contain('Invalid');
		});  
    });


    it('accepts valid token', function () {

		var valid_token = "";
        	browser.call(function () { 
                return snaputil.getToken().then(function (res){
                valid_token = res.trim();
                });

        });
		accessControlPage.submit_token(valid_token);
		loginpage = browser.element('h2=Installed snaps');
		loginpage.waitForVisible();
		expect(loginpage.getText(), "Login Failed with valid token").to.contain('Installed snaps');

     });

   it('until not authenticated, store link will return to access-control page', function() {
	
		accessControlPage.store.click();
		accessControlPage.token.waitForVisible();
		assert.isNotNull(accessControlPage.token.value);

    });

   it('on subsequent time, token authentication will be skipped', function() {

		var valid_token = "";
        	browser.call(function () { 
                	return snaputil.getToken().then(function (res){
                	valid_token = res.trim();
                	});
        	});
		accessControlPage.submit_token(valid_token);
		loginpage = browser.element('h2=Installed snaps');
		loginpage.waitForVisible();
		expect(loginpage.getText(), "Login Failed with valid token").to.contain('Installed snaps');
		cookie = browser.getCookie('SM');
		browser.reload();
		browser.url('/');
		title = browser.getTitle();
                assert.equal(title, 'Snapweb');
		browser.setCookie(cookie);
		browser.url('/');
		loginpage = browser.element('h2=Installed snaps');
		loginpage.waitForVisible();
		expect(loginpage.getText(), "Login Failed with valid token").to.contain('Installed snaps');

    });

   it('generating new token invalidates the old token', function() {

		var valid_token = "";
        	browser.call(function () { 
                	return snaputil.getToken().then(function (res){
                	valid_token = res.trim();
                	});
        	});
		accessControlPage.submit_token(valid_token);
		loginpage = browser.element('h2=Installed snaps');
		loginpage.waitForVisible();
		expect(loginpage.getText(), "Login Failed with valid token").to.contain('Installed snaps');
		cookie = browser.getCookie('SM');
		browser.call(function () { 
                        return snaputil.getToken().then(function (res){
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
