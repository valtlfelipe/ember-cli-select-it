/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-select-it',
  included: function(app) {
      app.import('vendor/select-it.css');
  },
  isDevelopingAddon: function() {
      return true;
  }
};
