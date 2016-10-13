module.exports = {
  getShowSnapUrlFor: function(model) {
    if (! model) {
      return;
    }
    var name = model['id'];
    return 'snap/' + name;
  },
};


