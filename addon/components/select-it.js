import Ember from 'ember';
import ClickOutside from '../mixins/click-outside';

export default Ember.Component.extend(ClickOutside, {
    tagName: 'div',
    classNames: ['ember-select-it'],

    content: [],
    value: null,
    required: false,
    placeHolder: null,
    optionLabelPath: 'value',
    optionValuePath: null,
    disabled: false,
    multiple: false,

    _isOpen: false,
    _searchResults: null,

    _valueObj: Ember.computed('value', 'optionValuePath', 'content', function() {
        if(this.get('optionValuePath')) {
            return this.get('content').findBy(this.get('optionValuePath'), this.get('value'));
        }

        return this.get('value');
    }),

    displayValue: Ember.computed('value', function() {
        return this.get('_valueObj') ? this.get('_valueObj')[this.get('optionLabelPath')] : "";
    }),

    searchValueChanged: Ember.observer('searchValue', function() {
        this.searchAction();
    }),

    showPlaceHolder: Ember.computed('value', 'placeHolder', function() {
        if(this.get('placeHolder') && !this.get('value')) {
            return true;
        }

        return false;
    }),

    searchAction() {
        var searchValue = this.get('searchValue');
        var optionLabelPath = this.get('optionLabelPath');
        var optionValuePath = this.get('optionValuePath');
        var value = this.get('value');
        var isMultiple = this.get('multiple');

        var content = this.get('content').filter(function(obj) {
            if(isMultiple) {
                if((optionLabelPath && value.indexOf(obj[optionValuePath]) >= 0) || value.indexOf(obj) >= 0) {
                    return false;
                }
            }
            var re = new RegExp(searchValue, 'gi');
            return obj[optionLabelPath] && obj[optionLabelPath].match(re);
        });

        //var valueObj = this.get('_valueObj');

        content = content.map(function(obj) {
            return Ember.Object.create({
                value: obj[optionLabelPath],
                isHighlighted: false,
                //isSelected: (valueObj && valueObj === obj.id),
                obj: obj
            });
        });

        content = Ember.A(content);

        if(!this.get('required') && !searchValue && !isMultiple) {
            content.unshiftObject(Ember.Object.create({
                value: this.get('placeHolder'),
                isHighlighted: false,
                //isSelected: false,
                obj: null
            }));
        }

        if(content.objectAt(0)) {
            content.objectAt(0).set('isHighlighted', true);
        }

        this.set('_searchResults', content);
    },

    keyDown: function(e) {
        var _searchResults = this.get('_searchResults');
        var next, current;

        // arrow down
        if(e.which === 40) {
            if(!this.get('_isOpen')) {
                this.openDropDown();
            }
            if(!_searchResults) {
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

        // arrow up
        } else if(e.which === 38) {
            if(!this.get('_isOpen')) {
                this.openDropDown();
            }
            if(!_searchResults) {
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

        // enter
        } else if(e.which === 13) {
            if(this.get('_isOpen')) {
                current = _searchResults.findBy('isHighlighted', true);
                this.send('itemSelected', current);
            } else {
                this.openDropDown();
            }
        // esc or tap
        } else if(e.which === 27 || e.which === 9) {
            if(this.get('_isOpen')) {
                this.closeDropDown();
            }
        }
    },

    closeDropDown() {
        this.set('_isOpen', false);
        this.set('_searchResults', null);
        var self = this;
        Ember.run.next(function() {
            self.$('.select-it-display').focus();
        });

    },

    openDropDown() {
        if(this.get('disabled')) {
            return;
        }

        if(this.get('multiple') && !Array.isArray(this.get('value'))) {
            this.set('value', []);
        }

        this.set('_isOpen', true);
        if(!this.get('multiple')) {
            this.set('searchValue', this.get('displayValue'));
        }
        this.searchAction();
        var self = this;
        Ember.run.next(function() {
            self.$('input.select-it-search').focus().select();
        });
    },

    clickOutside(e) {
        if (Ember.$(e.target).closest('.select-it-ignore').length > 0) {
            return;
        }

        if(this.get('_isOpen')) {
            this.closeDropDown();
        }
    },

    _attachClickOutsideHandler: Ember.on('didInsertElement', function() {
        Ember.run.next(this, this.addClickOutsideListener);
    }),

    _removeClickOutsideHandler: Ember.on('willDestroyElement', function() {
        this.removeClickOutsideListener();
    }),

    actions: {
        openSearch() {
            this.openDropDown();
        },
        closeSearch() {
            this.closeDropDown();
        },
        itemHighlighted(result) {
            var current = this.get('_searchResults').findBy('isHighlighted', true);
            current.set('isHighlighted', false);

            result.set('isHighlighted', true);
        },
        itemSelected(result) {

            if(result) {
                if(this.get('optionValuePath') && result.obj) {
                    if(this.get('multiple')) {
                        this.get('value').pushObject(result.obj[this.get('optionValuePath')]);
                    } else {
                        this.set('value', result.obj[this.get('optionValuePath')]);
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
        removeValue(value) {
            console.log('removeValue', value);
        }
    }
});
