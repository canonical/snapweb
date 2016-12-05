var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Sections = require('../collections/sections.js');
var Snaplist = require('../collections/snaplist.js');
var SnaplistTools = require('../common/snaplists.js');

var fetchSnapList = function(title, options) {
  var chan = Radio.channel('root');
  var sections = new Sections();
  var storeSnaplist = new Snaplist();

  // TODO find a more general/elegant way of
  // chaining promises w/ a failsafe backup for some
  var displayStoreView = function(sectionsPromise, storePromise) {
    var view =  new StoreLayoutView({
      model: new Backbone.Model({
        query: '',
        title: title,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: true,
        isHomeActive: false,
        sections: sections
      }),
      sectionsPromise: sectionsPromise,
      storePromise: storePromise,
      collection: SnaplistTools.updateInstalledStates(storeSnaplist)
    });
    chan.command('set:content', view);
  }

  var sp = sections.fetch();
  var ssp = storeSnaplist.fetch(options)

  displayStoreView(sp, ssp);
}

module.exports = {
  index: function() {
    fetchSnapList('Featured snaps')
  },
  section: function(s) {
    // Special case for private section which is not a section
    // per se but a specificity of a snap
    if (s === 'private') {
      fetchSnapList('Private snaps', {data: $.param({'private_snaps': true})})
    }
    else {
      fetchSnapList(s, {data: $.param({'section': s})})
    }
  }
};
