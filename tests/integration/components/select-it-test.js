import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

/*
  Test Fixtures
 */
var contentFixture = Ember.A([
  {
    id: "google",
    value: "Chrome"
  }, {
    id: false,
    value: "Internet Explorer"
  }, {
    id: 3,
    value: "Firefox"
  }, {
    id: "apple",
    value: "Safari"
  }, {
    id: 10,
    value: "Opera"
  }
]);

moduleForComponent('select-it', {
    integration: true
});

test("shows placeholder text", function(assert) {

    var placeholder = "select-it placeholder text";

    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it placeHolder=placeholder}}`);

    assert.equal(this.$('.select-it-placeholder').text(), placeholder, "placeholder text is shown");
});

test("shows available options", function(assert) {

    var placeholder = "select-it placeholder text";

    this.set('content', contentFixture);
    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it content=content placeHolder=placeholder}}`);

    this.$('.select-it-display').click();

    // because required is false, so the first option is the placeHolder
    assert.equal($('.select-it-results li').length, contentFixture.length, "shows all options");
});

test("shows available options with filter", function(assert) {

    var search = contentFixture.get(0);
    var placeholder = "select-it placeholder text";

    this.set('content', contentFixture);
    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it content=content placeHolder=placeholder}}`);

    this.$('.select-it-display').click();
    this.$('.select-it-search').val(search.value).trigger('change');

    assert.equal($('.select-it-results li').length, 1, "shows all filtered options");
    assert.equal($('.select-it-results li .select-it-result-label').first().text().trim(), search.value, "correct option text is shown");
});

test("correct text is shown on selection", function(assert) {

    var search = contentFixture.get(1);
    var placeholder = "select-it placeholder text";

    this.set('content', contentFixture);
    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it content=content placeHolder=placeholder}}`);

    this.$('.select-it-display').click();
    this.$('.select-it-results li .select-it-result-label').eq(1).click();

    assert.equal($('.select-it-display .select-it-selection').text().trim(), search.value, "correct option text is shown");
});

test("correct value is set to property", function(assert) {

    var search = contentFixture.get(2);
    var placeholder = "select-it placeholder text";

    this.set('content', contentFixture);
    this.set('value', null);
    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it content=content value=value placeHolder=placeholder}}`);

    this.$('.select-it-display').click();
    this.$('.select-it-results li .select-it-result-label').eq(2).click();

    assert.equal(this.get('value'), search, "value is set to property");
    assert.equal($('.select-it-display .select-it-selection').text().trim(), search.value, "correct option text is shown");
});

test("initial value should appear insteadof the placeholder", function(assert) {
    var placeholder = "select-it placeholder text";
    var search = contentFixture.get(3);

    this.set('content', contentFixture);
    this.set('value', search);
    this.set('placeholder', placeholder);
    this.render(hbs`{{select-it content=content value=value placeHolder=placeholder}}`);

    assert.equal($('.select-it-display').text().trim(), search.value, "correct option text is shown");
});
