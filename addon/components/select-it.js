import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['ember-select-it'],
    classNameBindings : ['select-it-open:_isOpen'],

    content: [],
    value: null,
    required: false,
    placeHolder: null,
    labelPath: 'value',
    valuePath: null,
    disabled: false,
    multiple: false,
    modalMode: false,
    minSearch: 3,

    _isOpen: false,
    _searchResults: null,
    _searchValue: "",

    _valueObj: Ember.computed('value', 'value.[]', 'valuePath', 'content', 'content.[]', function() {
        var isMultiple = this.get('multiple');
        var self = this;

        if(this.get('valuePath') && Array.isArray(this.get('content'))) {
            if(isMultiple && Array.isArray(this.get('value'))) {
                return this.get('content').filter(function(obj) {

                    return self.get('value').indexOf(obj[self.get('valuePath')]) >= 0;
                });
            } else {
                return this.get('content').find(function(item) {
                    return item[self.get('valuePath')] == self.get('value'); // jshint ignore:line
                });
            }
        }

        return this.get('value');
    }),

    displayValue: Ember.computed('value', 'value.[]', 'content', 'labelPath', 'content.[]', function() {
        var isMultiple = this.get('multiple');
        var self = this;

        if(isMultiple && Array.isArray(this.get('value'))) {
            return this.get('_valueObj').map(function(obj) {
                return {
                    displayValue: self.get('_valueObj') ? self.getLabel(obj) : "",
                    value: obj
                };
            });
        } else {
            return this.get('_valueObj') ? this.getLabel(this.get('_valueObj')) : "";
        }
    }),

    searchValueChanged: Ember.observer('_searchValue', function() {
        this.searchAction();
    }),

    showPlaceHolder: Ember.computed('value', 'value.[]', 'placeHolder', function() {
        if(this.get('placeHolder') && (!this.get('value') || (this.get('multiple') && this.get('value').length === 0))) {
            return true;
        }

        return false;
    }),

    escapeRegExp(str) {
        if(!str) {
            str = "";
        }

        if(str.string) {
            str = str.string;
        }

        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    _searchValueEscaped: Ember.computed('_searchValue', function() {
        return this.escapeRegExp(this.get('_searchValue'));
    }),

    _searchEnabled: Ember.computed('minSearch', '_searchValue', function() {
        if(this.get('_searchValue').length === 0 || this.get('minSearch') <= 0 || this.get('_searchValue').length >= this.get('minSearch')) {
            return true;
        } else {
            return false;
        }
    }),

    getLabel(obj) {
        var labelPath = this.get('labelPath');
        var label = "";

        if(obj.get) {
            label = obj.get(labelPath);
        } else {
            label = obj[labelPath];
        }

        if(label && label.string) {
            label = label.string;
        }

        return label;
    },

    searchAction() {
        var _searchValue = this.get('_searchValueEscaped');
        var labelPath = this.get('labelPath');
        var valuePath = this.get('valuePath');
        var value = this.get('value');
        var isMultiple = this.get('multiple');
        var self = this;

        if(!this.get('_isOpen') || !this.get('_searchEnabled') || !Array.isArray(this.get('content'))) {
            return;
        }

        var content = this.get('content').filter(function(obj) {
            if(isMultiple) {
                if((labelPath && value.indexOf(obj[valuePath]) >= 0) || value.indexOf(obj) >= 0) {
                    return false;
                }
            }

            var label = self.getLabel(obj);
            if(_searchValue && _searchValue.length > 0) {
                var re = new RegExp(_searchValue, 'i');
                return label && label.match(re);
            } else {
                return !!label;
            }
        });

        content = content.map(function(obj) {
            return Ember.Object.create({
                value: self.getLabel(obj),
                isHighlighted: false,
                obj: obj
            });
        });

        content = Ember.A(content);

        if(content.objectAt(0)) {
            content.objectAt(0).set('isHighlighted', true);
        }

        this.set('_searchResults', content);
    },

    click: function(e) {

        if(this.get('_isOpen') || e.target.className.indexOf('glyphicon-remove') >= 0 ||
            e.target.className.indexOf('select-it-multiple') >= 0 || e.target.className.indexOf('select-it-drop-mask') >= 0 ||
            e.target.className.indexOf('select-it-result-label') >= 0) {
            return;
        }

        this.openDropDown();
    },

    keyDown: function(e) {
        var _searchResults = this.get('_searchResults');
        var self = this;
        var next, current;

        var updateScroll = function() {
             // update scroll
            var scroll = _searchResults.indexOf(next) + 1;
            scroll = (Math.ceil(scroll/8) * 200) - 200;

            if(self.get('modalMode')) {
                Ember.$('body .select-it-drop-list.select-it-modal-mode .select-it-scroll').slimScroll({ scrollTo : scroll+'px' });
            } else {
                self.$('.select-it-scroll').slimScroll({ scrollTo : scroll+'px' });
            }
        };

        // arrow down
        if(e.which === 40) {
            e.preventDefault();
            if(!this.get('_isOpen')) {
                this.openDropDown();
            }
            if(!_searchResults || _searchResults.length <= 0) {
                return;
            }

            current = _searchResults.findBy('isHighlighted', true);
            next = null;

            if(current) {
                current.set('isHighlighted', false);
                next = _searchResults.objectAt(_searchResults.indexOf(current) + 1);
                if(!next) {
                    next = _searchResults.objectAt(0);
                }
            } else {
                next = _searchResults.objectAt(0);
            }

            next.set('isHighlighted', true);

            updateScroll();

        // arrow up
        } else if(e.which === 38) {
            e.preventDefault();
            if(!this.get('_isOpen')) {
                this.openDropDown();
            }
            if(!_searchResults || _searchResults.length <= 0) {
                return;
            }

            current = _searchResults.findBy('isHighlighted', true);
            next = null;

            if(current) {
                current.set('isHighlighted', false);
                next = _searchResults.objectAt(_searchResults.indexOf(current) - 1);
                if(!next) {
                    next = _searchResults.objectAt(_searchResults.length - 1);
                }
            } else {
                next = _searchResults.objectAt(_searchResults.length - 1);
            }

            next.set('isHighlighted', true);

            updateScroll();

        // enter
        } else if(e.which === 13) {
            e.preventDefault();

            if(this.get('_isOpen')) {
                current = _searchResults.findBy('isHighlighted', true);
                this.send('itemSelected', current);
            } else {
                this.openDropDown();
            }
        // esc or tap
        } else if(e.which === 27 || e.which === 9) {
            if(this.get('_isOpen')) {
                e.preventDefault();
                this.closeDropDown();
            }
        } else if(String.fromCharCode(e.which)) {
            if(!this.get('_isOpen')) {
                this.openDropDown();
            }
        }
    },

    closeDropDown() {
        this.set('_isOpen', false);
        this.set('_searchResults', null);

        if(this.get('modalMode')) {
            Ember.$('body .select-it-drop-list.select-it-modal-mode').remove();
        }

        var self = this;
        Ember.run.next(function() {
            self.$('.select-it-display').focus();
        });

    },

    configModalMode() {
        var $destination = this.$('.select-it-search');
        var offset = $destination.offset();
        this.$('.select-it-drop-list').appendTo('body')
            .css({
                top: (offset.top + $destination.outerHeight()) - 1,
                left: offset.left,
                width: $destination.outerWidth()
            })
            .show();
    },

    openDropDown() {
        if(this.get('disabled')) {
            return;
        }

        if(this.get('multiple') && !Array.isArray(this.get('value'))) {
            this.set('value', []);
        }

        this.set('_isOpen', true);
        this.set('_searchValue', "");

        /*if(this.get('multiple')) {
            this.set('_searchValue', "");
        } else {
            this.set('_searchValue', this.get('displayValue'));
        }*/

        this.searchAction();
        var self = this;
        Ember.run.next(function() {
            if(self.get('modalMode')) {
                self.configModalMode();
            }
            self.$('input.select-it-search').focus().select();
        });
    },

    clearValue() {
        this.set('value', null);
    },

    _attachEvents: Ember.on('didInsertElement', function() {

        if(!this.get('required') && !this.get('placeHolder')) {
            throw new Error('select-it#didInsertElement To use required = false, you have to set a placeholder');
        }

        this.$('.select-it-hidden-input').on('keydown', function(e) {
            e.preventDefault();
        });
        var self = this;
        this.$('.select-it-hidden-input').on('focus', function(e) {
            e.preventDefault();
            self.$('.select-it-display').focus();
        });
    }),

    _removeEvents: Ember.on('willDestroyElement', function() {
        this.$('.select-it-hidden-input').off('keydown');
        this.$('.select-it-hidden-input').off('focus');

        if(this.get('modalMode')) {
            Ember.$('body .select-it-drop-list.select-it-modal-mode').remove();
        }
    }),

    actions: {
        clear() {
            this.clearValue();
        },
        openSearch() {
            this.openDropDown();
        },
        closeSearch() {
            this.closeDropDown();
        },
        itemHighlighted(result) {
            if(!this.get('_searchResults')) {
                return;
            }

            var current = this.get('_searchResults').findBy('isHighlighted', true);
            current.set('isHighlighted', false);

            result.set('isHighlighted', true);
        },
        itemSelected(result) {

            if(result && result.obj) {
                if(this.get('valuePath')) {
                    if(this.get('multiple')) {
                        this.get('value').pushObject(result.obj[this.get('valuePath')]);
                    } else {
                        this.set('value', result.obj[this.get('valuePath')]);
                    }
                } else {
                    if(this.get('multiple')) {
                        this.get('value').pushObject(result.obj);
                    } else {
                        this.set('value', result.obj);
                    }
                }
            }
            this.closeDropDown();
        },
        removeValue(result) {
            if(result) {
                if(this.get('valuePath')) {
                    this.get('value').removeObject(result[this.get('valuePath')]);
                } else {
                    this.get('value').removeObject(result);
                }
            }
        }
    }
});
