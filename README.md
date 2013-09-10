Hallo - contentEditable for jQuery UI [![Build Status](https://secure.travis-ci.org/bergie/hallo.png)](http://travis-ci.org/bergie/hallo)
=====================================

![Hallo Editor logo](https://raw.github.com/bergie/hallo/master/design/logo-200x59.png)

[![Cross-browser testing status](https://saucelabs.com/browser-matrix/hallo-js.svg)](https://saucelabs.com/u/hallo-js)

Hallo is a very simple in-place rich text editor for web pages. It uses jQuery UI and the [HTML5 contentEditable functionality](https://developer.mozilla.org/en/rich-text_editing_in_mozilla) to edit web content.

The widget has been written as a simple and liberally licensed editor. It doesn't aim to replace popular editors like [Aloha](http://aloha-editor.org), but instead to provide a simpler and more reusable option.

Read the [introductory blog post](http://bergie.iki.fi/blog/hallo-editor/) for more information.

## Using the editor

You need jQuery, jQuery UI (1.10+), and [Rangy](https://code.google.com/p/rangy/) loaded. An easy way to do this is to use Google's JS service:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"></script>
<script src="http://rangy.googlecode.com/svn/trunk/currentrelease/rangy-core.js"></script>
```

The editor toolbar is using jQuery UI theming, so you'll probably also want to [grab a theme](http://jqueryui.com/themeroller/) that fits your needs. Toolbar pluggins use icons from [Font Awesome](http://fortawesome.github.com/Font-Awesome/). Check these [integration instructions](http://fortawesome.github.com/Font-Awesome/#integration) for the right way to include Font Awesome depending on if/how you use Twitter Bootstrap. To style the toolbar as it appears in the demo, you'll also want to add some CSS (like background and border) to the class `hallotoolbar`.

```html
<link rel="stylesheet" href="/path/to/your/jquery-ui.css">
<link rel="stylesheet" href="/path/to/your/font-awesome.css">
```

Then include Hallo itself:

```html
<script src="hallo.js"></script>
```

Editor activation is easy:

```javascript
jQuery('p').hallo();
```

You can also deactivate the editor:

```javascript
jQuery('p').hallo({editable: false});
```

Hallo itself only makes the selected DOM elements editable and doesn't provide any formatting tools. Formatting is accomplished by loading plugins when initializing Hallo. Even simple things like *bold* and *italic* are plugins:

```javascript
jQuery('.editable').hallo({
  plugins: {
    'halloformat': {}
  }
});
```

This example would enable the simple formatting plugin that provides functionality like _bold_ and _italic_. You can include as many Hallo plugins as you want, and if necessary pass them options.

Hallo has got more options you set when instantiating. See the [hallo.coffee](https://github.com/bergie/hallo/blob/master/src/hallo.coffee) file for further documentation.

### Events

Hallo provides some events that are useful for integration. You can use [jQuery bind](http://api.jquery.com/bind/) to subscribe to them:

* `halloenabled`: Triggered when an editable is enabled (`editable` set to `true`)
* `hallodisabled`: Triggered when an editable is disabled (`editable` set to `false`)
* `hallomodified`: Triggered whenever user has changed the contents being edited. Event data key `content` contains the HTML
* `halloactivated`: Triggered when user activates an editable area (usually by clicking it)
* `hallodeactivated`: Triggered when user deactivates an editable area

## Plugins

* halloformat - Adds Bold, Italic, StrikeThrough and Underline support to the toolbar. (Enable/Disable with options: "formattings": {"bold": true, "italic": true, "strikethrough": true, "underline": false})
* halloheadings - Adds support for H1, H2, H3. You can pass a headings option key "headers" with an array of header sizes (i.e. headers: [1,2,5,6])
* hallojustify - Adds align left, center, right support
* hallolists - Adds support for ordered and unordered lists (Pick with options: "lists": {"ordered": false, "unordered": true})
* halloreundo - Adds support for undo and redo
* hallolink - Adds support to add links to a selection (currently not working)
* halloimage - Image uploading, searching, suggestions
* halloblacklist - Filtering unwanted tags from the content

## Licensing

Hallo is free software available under the [MIT license](http://en.wikipedia.org/wiki/MIT_License).

## Contributing

Hallo is written in [CoffeeScript](http://jashkenas.github.com/coffee-script/), a simple language that compiles into JavaScript. You'll need Node.js to to build it. All build dependencies can be installed with:

    $ npm install

To generate the JavaScript code to `dist/hallo.js` from Hallo sources, run [Grunt](http://gruntjs.com):

    $ grunt build

Hallo development is coordinated using Git. Just fork the [Hallo repository on GitHub](https://github.com/bergie/hallo) and [send pull requests](http://help.github.com/pull-requests/).

### Unit tests

We use the Travis continuous integration service for testing Hallo. Currently we run two types of tests:

* [CoffeeLint](http://www.coffeelint.org/) for ensuring compliance with [coding standards](https://github.com/polarmobile/coffeescript-style-guide)
* Some [QUnit](http://qunitjs.com/) tests

You can run the unit tests locally by opening `test/index.html` in your browser, or with [PhantomJS](http://phantomjs.org/) by running:

    $ grunt test

or:

    $ npm test

### Writing plugins

Hallo plugins are written as regular [jQuery UI widgets](http://semantic-interaction.org/blog/2011/03/01/jquery-ui-widget-factory/).

When Hallo is loaded it will also load all the enabled plugins for the element, and pass them some additional options:

* `editable`: The main Hallo widget instance
* `uuid`: unique identifier of the Hallo instance, can be used for element IDs

A simplistic plugin would look like the following:

```coffeescript
#    Formatting plugin for Hallo
#    (c) 2011 Henri Bergius, IKS Consortium
#    Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget "IKS.halloformat",
    boldElement: null

    options:
      uuid: ''
      editable: null

    _create: ->
      # Add any actions you want to run on plugin initialization
      # here

    populateToolbar: (toolbar) ->
      # Create an element for holding the button
      @boldElement = jQuery '<span></span>'

      # Use Hallo Button
      @boldElement.hallobutton
        uuid: @options.uuid
        editable: @options.editable
        label: 'Bold'
        # Icons come from Font Awesome
        icon: 'icon-bold'
        # Commands are used for execCommand and queryCommandState
        command: 'bold'

      # Append the button to toolbar
      toolbar.append @boldElement

    cleanupContentClone: (element) ->
      # Perform content clean-ups before HTML is sent out

)(jQuery)
```
