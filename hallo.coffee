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
    # ## Options
    #
    # Change from floating mode to relative positioning with using
    # the offset to position the toolbar where you want it:
    #
    #    jQuery('selector').hallo({
    #       floating: true,
    #       offset: {
    #         'x' : 0,
    #         'y' : 0
    #       }
    #    });
    #
    # Force the toolbar to be shown at all times when a contenteditable
    # element is focused:
    #
    #    jQuery('selector').hallo({
    #       showalways: true
    #    });
    #
    # showalways is false by default
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
            floating: true
            offset: {x:0,y:0}
            showalways: false
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
                # Only add the blur event when showalways is set to true
                if not @options.showalways
                    @element.bind "blur", this, @_deactivated
                @element.bind "keyup paste change", this, @_checkModified
                @element.bind "keyup mouseup", this, @_checkSelection
                widget = this
                @bound = true

        # Activate an editable for editing
        activate: ->
            @element.focus()

        # Only supports one range for now (i.e. no multiselection)
        getSelection: ->
            if ( jQuery.browser.msie )
                range = document.selection.createRange()
            else
                if ( window.getSelection )
                    userSelection = window.getSelection()
                else if (document.selection) #opera
                    userSelection = document.selection.createRange()
                else
                    throw "Your browser does not support selection handling"

                if ( userSelection.getRangeAt )
                    range = userSelection.getRangeAt(0)
                else
                    range = userSelection

            return range

        restoreSelection: (range) ->
            if ( jQuery.browser.msie )
                range.select()
            else
                window.getSelection().removeAllRanges()
                window.getSelection().addRange(range)

        replaceSelection: (cb) ->
            if ( jQuery.browser.msie )
                t = document.selection.createRange().text;
                r = document.selection.createRange()
                r.pasteHTML(cb(t))
            else
                sel = window.getSelection();
                range = sel.getRangeAt(0);
                newTextNode = document.createTextNode(cb(range.extractContents()));
                range.insertNode(newTextNode);
                range.setStartAfter(newTextNode);
                sel.removeAllRanges();
                sel.addRange(range);

        removeAllSelections: () ->
            if ( jQuery.browser.msie )
                range.empty()
            else
                window.getSelection().removeAllRanges()

        # Get contents of an editable as HTML string
        getContents: ->
           @element.html()

        # Check whether the editable has been modified
        isModified: ->
           @originalContent isnt @getContents()

        # Set the editable as unmodified
        setUnmodified: ->
           @originalContent = @getContents()

        # Restore the content original
        restoreOriginalContent: ->
            @element.html(@originalContent)

        # Execute a contentEditable command
        execute: (command, value) ->
            if document.execCommand command, false, value
                @element.trigger "change"

        _generateUUID: ->
            S4 = ->
                ((1 + Math.random()) * 0x10000|0).toString(16).substring 1
            "#{S4()}#{S4()}-#{S4()}-#{S4()}-#{S4()}-#{S4()}#{S4()}#{S4()}"

        # TODO this function is called way too many times!
        _getToolbarPosition: (event, selection) ->
            if event.originalEvent instanceof MouseEvent
                if @options.floating
                    return [event.pageX, event.pageY]
                else
                    if jQuery(event.target).attr('contenteditable') == "true"
                        containerElement = jQuery(event.target)
                    else
                        containerElement = jQuery(event.target).parents('[contenteditable]').first()

                    containerPosition = containerElement.position()
                    switch @options.offset.y
                        when "top" then offsety = containerPosition.top - jQuery('.halloToolbar').first().outerHeight()
                        #TODO: "bottom" causes an issue with the overlay
                        #when "bottom" then offsety = containerPosition.top + containerElement.outerHeight()
                        else offsety = containerPosition.top - @options.offset.y;

                    return [containerPosition.left - @options.offset.x, offsety]

            range = selection.getRangeAt 0
            tmpSpan = jQuery "<span/>"
            newRange = document.createRange()
            newRange.setStart selection.focusNode, range.endOffset
            newRange.insertNode tmpSpan.get 0

            position = [tmpSpan.offset().left, tmpSpan.offset().top]
            tmpSpan.remove()
            if not @options.showalways
                position

        _prepareToolbar: ->
            that = @
            @toolbar = jQuery('<div></div>').addClass('halloToolbar').hide()
            @toolbar.css "position", "absolute"
            @toolbar.css "top", @element.offset().top - 20
            @toolbar.css "left", @element.offset().left
            jQuery('body').append(@toolbar)
            @toolbar.bind "mousedown", (event) ->
                event.preventDefault()

            @element.bind "halloselected", (event, data) ->
                widget = data.editable
                position = widget._getToolbarPosition data.originalEvent, data.selection
                if position
                    widget.toolbar.css "top", position[1]
                    widget.toolbar.css "left", position[0]
                    widget.toolbar.show()

            @element.bind "hallounselected", (event, data) ->
                if not that.options.showalways
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

            # TODO: sel.type is not crossbrowser compatible
            #if sel.type is "Caret"
            #    if widget.selection
            #        widget.selection = null
            #        widget._trigger "unselected", null,
            #            editable: widget
            #            originalEvent: event
            #    return

            selectedRanges = []
            changed = not widget.section or (sel.rangeCount != widget.selection.length)

            if(sel.rangeCount > 0) #fixing possible chrome error on click on editButton: "Uncaught Error: INDEX_SIZE_ERR: DOM Exception 1"
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
            #  avoid jumping of the toolbar Todo:: look into jumpy toolbar
            #if widget.toolbar.html() isnt ""
                #widget.toolbar.css "top", widget.element.offset().top - widget.toolbar.height()
                #widget.toolbar.show()

            # add 'inEditMode' class onto the activated element
            jQuery(@).addClass 'inEditMode'
            widget.toolbar.css "width", jQuery(@).width()+26
            widget._trigger "activated", event

        _deactivated: (event) ->
            widget = event.data
            widget.toolbar.hide()
            jQuery(widget.element).removeClass 'inEditMode'
            widget._trigger "deactivated", event

)(jQuery)
