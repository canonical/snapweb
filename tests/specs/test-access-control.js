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

	snaputil.getToken(function (token) {
	var valid_token = token.trim();

	var tokens = ['','a',"'", '#', Array(512).join('x'),valid_token+"  ", valid_token+"'", valid_token+'#'];

	tokens.forEach(function(token){

	     accessControlPage.submit_token(token);
	     expect(accessControlPage.login_failed.getText()).to.contain('Invalid');

	    });
	});
        
    });


    it('accepts valid token', function () {

	snaputil.getToken(function (token) {
		accessControlPage.submit_token(token.trim());
		loginpage = browser.element('h2=Installed snaps');
		loginpage.waitForVisible();
		expect(loginpage.getText(), "Login Failed with valid token").to.contain('Installed snaps');

    	   });
        });

   it('until not authenticated, store link will return to access-control page', function() {
	
	accessControlPage.store.click();
	accessControlPage.token.waitForVisible();
	assert.isNotNull(accessControlPage.token.value);

    });

});
