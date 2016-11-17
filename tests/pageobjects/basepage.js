function BasePage() {}

BasePage.prototype.open = function(path) {
    browser.url('/' + path)
}

module.exports = new BasePage()