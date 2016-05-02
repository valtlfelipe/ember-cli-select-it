/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-cli-select-it',
    included: function(app) {
        this._super.included(app);
        app.import('vendor/select-it.css');
        app.import(app.bowerDirectory + '/jquery-slimscroll/jquery.slimscroll.js');
    },
    isDevelopingAddon: function() {
        return true;
    }
};
