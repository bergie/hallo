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
        selection: null

        options:
            editable: true
            plugins: {}
            activated: ->
            deactivated: ->
            selected: ->
            unselected: ->

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
            @element.unbind "keyup mouseup", this, @_checkSelection
            @bound = false

        # Enable an editable
        enable: ->
            @element.attr "contentEditable", true

            if not @bound
                @element.bind "focus", this, @_activated
                @element.bind "blur", this, @_deactivated
                @element.bind "keyup paste change", this, @_checkModified
                @element.bind "keyup mouseup", this, @_checkSelection
                widget = this
                @bound = true

        # Activate an editable for editing
        activate: ->
            @element.focus()

        replaceSelection: (cb) ->
            if ( $.browser.msie )
                t = document.selection.createRange().text;
                r = document.selection.createRange()
                r.pasteHTML(cb(t));
            else
                sel = window.getSelection();
                range = sel.getRangeAt(0);
                newTextNode = document.createTextNode(cb(range.extractContents()));
                range.insertNode(newTextNode);
                range.setStartAfter(newTextNode);
                sel.removeAllRanges();
                sel.addRange(range);

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
        execute: (command, value) ->
            if document.execCommand command, false, value
                @element.trigger "change"

        _generateUUID: ->
            S4 = ->
                ((1 + Math.random()) * 0x10000|0).toString(16).substring 1
            "#{S4()}#{S4()}-#{S4()}-#{S4()}-#{S4()}-#{S4()}#{S4()}#{S4()}"

        _getToolbarPosition: (event, selection) ->
            if event.originalEvent instanceof MouseEvent
                return [event.pageX, event.pageY]

            range = selection.getRangeAt 0
            tmpSpan = jQuery "<span/>"
            newRange = document.createRange()
            newRange.setStart selection.focusNode, range.endOffset
            newRange.insertNode tmpSpan.get 0

            position = [tmpSpan.offset().left, tmpSpan.offset().top]
            tmpSpan.remove()
            position

        _prepareToolbar: ->
            @toolbar = jQuery('<div></div>').hide()
            @toolbar.css "position", "absolute"
            @toolbar.css "top", @element.offset().top - 20
            @toolbar.css "left", @element.offset().left
            jQuery('body').append(@toolbar)
            @toolbar.bind "mousedown", (event) ->
                event.preventDefault()

            @element.bind "halloselected", (event, data) ->
                widget = data.editable
                position = widget._getToolbarPosition data.originalEvent, data.selection
                widget.toolbar.css "top", position[1]
                widget.toolbar.css "left", position[0]
                widget.toolbar.show()

            @element.bind "hallounselected", (event, data) ->
                data.editable.toolbar.hide()

        _checkModified: (event) ->
            widget = event.data
            if widget.isModified()
                widget._trigger "modified", null,
                    editable: widget
                    content: widget.getContents()

        _keys: (event) ->
            widget = event.data
            if event.keyCode == 27
                this.disable # TODO: Why doesnt this work? (neither does widget.disable)
        _rangesEqual: (r1, r2) ->
            r1.startContainer is r2.startContainer and r1.startOffset is r2.startOffset and r1.endContainer is r2.endContainer and r1.endOffset is r2.endOffset

        _checkSelection: (event) ->
            widget = event.data
            sel = window.getSelection()
            if sel.type is "Caret"
                if widget.selection
                    widget.selection = null
                    widget._trigger "unselected", null,
                        editable: widget
                        originalEvent: event
                return

            selectedRanges = []
            changed = not widget.section or (sel.rangeCount != widget.selection.length)

            for i in [0..sel.rangeCount]
                range = sel.getRangeAt(i).cloneRange()
                selectedRanges[i] = range

                changed = true if not changed and not widget._rangesEqual(range, widget.selection[i])
                ++i
            widget.selection = selectedRanges
            if changed
                widget._trigger "selected", null,
                    editable: widget
                    selection: sel
                    ranges: selectedRanges
                    originalEvent: event
        _activated: (event) ->
            widget = event.data
            if widget.toolbar.html() isnt ""
                widget.toolbar.css "top", widget.element.offset().top - widget.toolbar.height()
                #widget.toolbar.show()

            widget._trigger "activated", event

        _deactivated: (event) ->
            widget = event.data
            widget.toolbar.hide()
            widget._trigger "deactivated", event
)(jQuery)
