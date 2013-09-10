Hallo Editor ChangeLog
======================

## 1.0.4 (September 10th 2013)

* Plugin instance fetching is now more robust and gives better errors on plugins not compatible with jQuery 1.10

## 1.0.3 (September 10th 2013)

* Ported the build environment to [Grunt](http://gruntjs.com)
* Updated Bower packaging, and moved built Hallo version to `dist`

## 1.0.2 (February 18th 2013)

Improved compatibility with [jQuery 1.9](http://jquery.com/upgrade-guide/1.9/) by removing the deprecated `jQuery.browser` calls.

## 1.0.1 (February 18th 2013)

User interface:

* Fixed Hallo toolbars now stay on the top of the screen when scrolling longer content elements [135](https://github.com/bergie/hallo/pull/135)
* Contextual toolbar positioning is now more accurate [120](https://github.com/bergie/hallo/pull/120) & [121](https://github.com/bergie/hallo/pull/121)
* Link plugin now prepends a `http://` to links if no protocol is defined [101](https://github.com/bergie/hallo/pull/101)
* [New Hallo logo](https://raw.github.com/bergie/hallo/49c3236e59f900d82450eb41e628bf47a19aa6d1/design/logo.png) from the contest:

![Hallo Editor](https://raw.github.com/bergie/hallo/49c3236e59f900d82450eb41e628bf47a19aa6d1/design/logo-200x59.png)

Plugins:

* New [blacklist plugin](https://github.com/bergie/hallo/commit/627462b9738325030be46e2ba673e430780e0493) for removing unwanted DOM elements
* Headings plugin uses the button class [126](https://github.com/bergie/hallo/pull/126)
* Drag-and-drop behavior with the image widget was improved [115](https://github.com/bergie/hallo/pull/115)

Internals:

* Whitespace no longer prevents Hallo placeholder content from showing up [140](https://github.com/bergie/hallo/pull/140)
* jQuery UI 1.10 compatibility [138](https://github.com/bergie/hallo/pull/138)
* Several Internet Explorer fixes were included
* Switched to jQuery 1.7+ `on`/`off` instead of `bind`/`unbind`
* Switched selection handling to use the [Rangy](http://code.google.com/p/rangy/) library

Development:

* [CoffeeScript coding standards](https://github.com/polarmobile/coffeescript-style-guide) are now enforced by CoffeeLint
* Unit tests and continuous integration run with the PhantomJS headless browser
