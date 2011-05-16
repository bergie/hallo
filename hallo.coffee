#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    # Hallo provides a jQuery UI widget `hallo`. Usage:
    #
    #     jQuery('p').hallo();
    #
    # Getting out of the editing state:
    #
    #     jQuery('p').hallo({editable: false});
    #
    # When content is in editable state, users can just click on
    # an editable element in order to start modifying it. This
    # relies on browser having support for the HTML5 contentEditable
    # functionality, which means that some mobile browsers are not
    # supported.
    #
    # If plugins providing toolbar buttons have been enabled for
    # Hallo, then a floating editing toolbar will be rendered above
    # the editable contents when an area is active.
    #
    # ## Events
    #
    # The Hallo editor provides several jQuery events that web
    # applications can use for integration:
    #
    # ### Activated
    #
    # When user activates an editable (usually by clicking or tabbing
    # to an editable element), a `halloactivated` event will be fired.
    #
    #     jQuery('p').bind('halloactivated', function() {
    #         console.log("Activated");
    #     });
    #
    # ### Deactivated
    #
    # When user gets out of an editable element, a `hallodeactivated`
    # event will be fired.
    #
    #     jQuery('p').bind('hallodeactivated', function() {
    #         console.log("Deactivated");
    #     });
    #
    # ### Modified
    #
    # When contents in an editable have been modified, a
    # `hallomodified` event will be fired.
    #
    #     jQuery('p').bind('hallomodified', function(event, data) {
    #         console.log("New contents are " + data.content);
    #     });
    #
    jQuery.widget "IKS.hallo",
        toolbar: null
        bound: false
        originalContent: ""
        uuid: ""

        options:
            editable: true
            plugins: {}
            activated: ->
            deactivated: ->

        _create: ->
            @originalContent = @getContents()
            @id = @_generateUUID()
            @_prepareToolbar()

            for plugin, options of @options.plugins
                if not jQuery.isPlainObject options
                    options = {}
                options["editable"] = this
                options["toolbar"] = @toolbar
                options["uuid"] = @id
                jQuery(@element)[plugin] options

        _init: ->
            if @options.editable
                @enable()
            else
                @disable()

        # Disable an editable
        disable: ->
            @element.attr "contentEditable", false
            @element.unbind "focus", @_activated
            @element.unbind "blur", @_deactivated
            @element.unbind "keyup paste change", this, @_checkModified
            @bound = false

        # Enable an editable
        enable: ->
            @element.attr "contentEditable", true

            if not @bound
                @element.bind "focus", this, @_activated
                @element.bind "blur", this, @_deactivated
                @element.bind "keyup paste change", this, @_checkModified
                widget = this
                @bound = true

        # Activate an editable for editing
        activate: ->
            @element.focus()

        # Get contents of an editable as HTML string
        getContents: ->
           @element.html()

        # Check whether the editable has been modified
        isModified: ->
           @originalContent isnt @getContents()

        # Set the editable as unmodified
        setUnmodified: ->
           @originalContent = @getContents()

        # Execute a contentEditable command
        execute: (command) ->
            if document.execCommand command, false, null
                @element.trigger "change"

        _generateUUID: ->
            S4 = ->
                ((1 + Math.random()) * 0x10000|0).toString(16).substring 1
            "#{S4()}#{S4()}-#{S4()}-#{S4()}-#{S4()}-#{S4()}#{S4()}#{S4()}"

        _prepareToolbar: ->
            @toolbar = jQuery('<div></div>').hide()
            @toolbar.css "position", "absolute"
            @toolbar.css "top", @element.offset().top - 20
            @toolbar.css "left", @element.offset().left
            jQuery('body').append(@toolbar)
            @toolbar.bind "mousedown", (event) ->
                event.preventDefault()

        _checkModified: (event) ->
            widget = event.data
            if widget.isModified()
                widget._trigger "modified", null,
                    editable: widget
                    content: widget.getContents()

        _activated: (event) ->
            widget = event.data
            if widget.toolbar.html() isnt ""
                widget.toolbar.css "top", widget.element.offset().top - widget.toolbar.height()
                widget.toolbar.show()

            widget._trigger "activated", event

        _deactivated: (event) ->
            widget = event.data
            widget.toolbar.hide()
            widget._trigger "deactivated", event
)(jQuery)