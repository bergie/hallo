#    Hallo - a rich text editing jQuery UI widget
#    (c) 2011 Henri Bergius, IKS Consortium
#    Hallo may be freely distributed under the MIT license
((jQuery) ->
    # Hallo provides a jQuery UI widget `hallo`. Usage:
    #
    #     jQuery('p').hallo();
    #
    # Getting out of the editing state:
    #
    #     jQuery('p').hallo({editable: false});
    jQuery.widget "IKS.hallo",
        toolbar: null
        bound: false
        originalContent: ""
        _modifiedContent: ""
        changeTimer: undefined

        options:
            editable: true
            plugins: {}
            activated: ->
            deactivated: ->

        # Called once for each element
        _create: ->
            @originalContent = @getContents()
            @_prepareToolbar()

            for plugin, options of @options.plugins
                if not jQuery.isPlainObject options
                    options = {}
                options["editable"] = this
                options["toolbar"] = @toolbar
                jQuery(@element)[plugin] options

        # Called per each invokation
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
            @bound = false

            if @changeTimer isnt undefined
                window.clearInterval @changeTimer

        # Enable an editable
        enable: ->
            @element.attr "contentEditable", true

            if not @bound
                @element.bind "focus", this, @_activated
                @element.bind "blur", this, @_deactivated
                widget = this
                @changeTimer = window.setInterval ->
                    widget._checkModified()
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
            document.execCommand command, false, null
            @activate()

        _prepareToolbar: ->
            @toolbar = jQuery('<div></div>').hide()
            @toolbar.css "position", "absolute"
            @toolbar.css "top", @element.offset().top - 20
            @toolbar.css "left", @element.offset().left
            jQuery('body').append(@toolbar)

        _checkModified: ->
            if @isModified() and @getContents() isnt @_modifiedContents
                @_modifiedContents = @getContents()
                @_trigger "modified", null,
                    editable: this
                    content: @_modifiedContents

        _activated: (event) ->
            widget = event.data
            if widget.toolbar.html() isnt ""
                widget.toolbar.css "top", widget.element.offset().top - widget.toolbar.height()
                widget.toolbar.show()

            widget._trigger "activated", event

        _deactivated: (event) ->
            widget = event.data
            window.setTimeout ->
                widget.toolbar.hide()
            , 200

            widget._trigger "deactivated", event
)(jQuery)