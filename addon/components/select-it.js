import Ember from 'ember';
import ClickOutside from '../mixins/click-outside';
const { on } = Ember;
const { next } = Ember.run;

export default Ember.Component.extend(ClickOutside, {
    tagName: 'div',
    classNames: ['ember-select-it'],

    content: [],
    value: null,
    required: false,
    placeHolder: null,
    optionLabelPath: 'name',
    optionIdPath: null,
    disabled: false,

    _isOpen: false,
    _searchResults: null,

    _valueObj: Ember.computed('value', 'optionIdPath', 'content', function() {
        if(this.get('optionIdPath')) {
            return this.get('content').findBy(this.get('optionIdPath'), this.get('value'));
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
        var content = this.get('content').filter(function(obj) {
            var re = new RegExp(searchValue, 'gi');
            return obj[optionLabelPath].match(re);
        });

        var value = this.get('value');

        content = content.map(function(obj) {
            return Ember.Object.create({
                value: obj[optionLabelPath],
                isHighlighted: false,
                isSelected: (value && value.id === obj.id),
                obj: obj
            });
        });

        if(!this.get('required') && !searchValue) {
            content.unshiftObject(Ember.Object.create({
                value: this.get('placeHolder'),
                isHighlighted: false,
                isSelected: false,
                obj: null
            }));
        }

        if(content.objectAt(0)) {
            content.objectAt(0).set('isHighlighted', true);
        }

        this.set('_searchResults', content);
    },

    onKeydown: function(e) {
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
    }.on('keyDown'),

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

        this.set('_isOpen', true);
        this.set('searchValue', this.get('displayValue'));
        this.searchAction();
        var self = this;
        Ember.run.next(function() {
            self.$('input.select-it-search').focus().select();
        });
    },

    clickOutside(e) {
        const exceptSelector = '.select-it-ignore';
        if (exceptSelector && Ember.$(e.target).closest(exceptSelector).length > 0) {
            return;
        }

        if(this.get('_isOpen')) {
            this.closeDropDown();
        }
    },

    _attachClickOutsideHandler: on('didInsertElement', function() {
        next(this, this.addClickOutsideListener);
    }),

    _removeClickOutsideHandler: on('willDestroyElement', function() {
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

            result.toggleProperty('isHighlighted');
        },
        itemSelected(result) {
            if(this.get('optionIdPath') && result.obj) {
                this.set('value', result.obj[this.get('optionIdPath')]);
            } else {
                this.set('value', result.obj);
            }
            this.closeDropDown();
        }
    }
});
