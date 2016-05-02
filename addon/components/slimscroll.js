import Ember from 'ember';

export default Ember.Component.extend({

	tagName : 'div',

	classNameBindings : ['slimscroll'],

	alwaysVisible : true,

	didInsertElement : function() {

		var height = this.get('height');
		var self = this;

		this.$().slimScroll({
			height: height,
			alwaysVisible : true
		}).bind('slimscroll', function(e, pos) {

			if(self.get('positionAction')) {
				self.sendAction('positionAction', pos);
			}
		});
	}
});
