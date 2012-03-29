###
Hallo - a rich text editing jQuery UI widget
(c) 2011 Henri Bergius, IKS Consortium
Hallo may be freely distributed under the MIT license
###
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
    # In addition to floating mode, you can also show the toolbar in a
    # fixed mode, where no positioning is applied to it. This is useful
    # when you want to show the toolbar inside some DOM element. For
    # example:
    #
    #     jQuery('selector').hallo({
    #         fixed: true,
    #         parentElement: jQuery('.my-custom-toolbar'),
    #     });
    #
    # Force the toolbar to be shown at all times when a contenteditable
    # element is focused:
    #
    #    jQuery('selector').hallo({
    #       showAlways: true
    #    });
    #
    # showAlways is false by default
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
    # ### Restored
    #
    # When contents are restored through calling .hallo("restoreOriginalContent")
    # or the user pressing ESC while the cursor is in the editable element,
    # a 'hallorestored' event will be fired.
    #
    #     jQuery('p').bind('hallorestored', function(event, data) {
    #         console.log("The thrown contents are " + data.thrown);
    #         console.log("The restored contents are " + data.content);
    #     });
    #
    jQuery.widget "IKS.hallo",
        toolbar: null
        toolbarMoved: false
        bound: false
        originalContent: ""
        uuid: ""
        selection: null

        options:
            editable: true
            plugins: {}
            floating: true
            offset: {x:0,y:0}
            fixed: false
            showAlways: false
            activated: ->
            deactivated: ->
            selected: ->
            unselected: ->
            enabled: ->
            disabled: ->
            placeholder: ''
            parentElement: 'body'
            forceStructured: true
            buttonCssClass: null

        _create: ->
            @originalContent = @getContents()
            @id = @_generateUUID()
            @_prepareToolbar()

            for plugin, options of @options.plugins
                if not jQuery.isPlainObject options
                    options = {}
                options['editable'] = this
                options['toolbar'] = @toolbar
                options['uuid'] = @id
                options['buttonCssClass'] = @options.buttonCssClass
                jQuery(@element)[plugin] options

        _init: ->
            @_setToolbarPosition()
            if @options.editable
                @enable()
            else
                @disable()

        # Disable an editable
        disable: ->
            @element.attr "contentEditable", false
            @element.unbind "focus", @_activated
            @element.unbind "blur", @_deactivated
            @element.unbind "keyup paste change", @_checkModified
            @element.unbind "keyup", @_keys
            @element.unbind "keyup mouseup", @_checkSelection
            @bound = false
            @_trigger "disabled", null

        # Enable an editable
        enable: ->
            @element.attr "contentEditable", true

            unless @element.html()
                @element.html this.options.placeholder

            if not @bound
                @element.bind "focus", this, @_activated
                @element.bind "blur", this, @_deactivated
                @element.bind "keyup paste change", this, @_checkModified
                @element.bind "keyup", this, @_keys
                @element.bind "keyup mouseup", this, @_checkSelection
                widget = this
                @bound = true

            @_forceStructured() if @options.forceStructured

            @_trigger "enabled", null

        # Activate an editable for editing
        activate: ->
            @element.focus()

        # Only supports one range for now (i.e. no multiselection)
        getSelection: ->
            if jQuery.browser.msie
                range = document.selection.createRange()
            else
                if window.getSelection
                    userSelection = window.getSelection()
                else if (document.selection) #opera
                    userSelection = document.selection.createRange()
                else
                    throw "Your browser does not support selection handling"

                if userSelection.rangeCount > 0
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
          # clone
          contentClone = @element.clone()
          for plugin of @options.plugins
            jQuery(@element)[plugin] 'cleanupContentClone', contentClone
          contentClone.html()

        # Set the contents of an editable
        setContents: (contents) ->
            @element.html contents

        # Check whether the editable has been modified
        isModified: ->
            @originalContent isnt @getContents()

        # Set the editable as unmodified
        setUnmodified: ->
            @originalContent = @getContents()

        # Set the editable as modified
        setModified: ->
            @._trigger 'modified', null,
                editable: @
                content: @getContents()

        # Restore the content original
        restoreOriginalContent: () ->
            @element.html(@originalContent)

        # Execute a contentEditable command
        execute: (command, value) ->
            if document.execCommand command, false, value
                @element.trigger "change"

        protectFocusFrom: (el) ->
            widget = @
            el.bind "mousedown", (event) ->
                event.preventDefault()
                widget._protectToolbarFocus = true
                setTimeout ->
                  widget._protectToolbarFocus = false
                , 300

        _generateUUID: ->
            S4 = ->
                ((1 + Math.random()) * 0x10000|0).toString(16).substring 1
            "#{S4()}#{S4()}-#{S4()}-#{S4()}-#{S4()}-#{S4()}#{S4()}#{S4()}"

        _getToolbarPosition: (event, selection) ->
            return unless event
            if @options.floating
                if event.originalEvent instanceof KeyboardEvent
                   return @_getCaretPosition(selection);
                else if event.originalEvent instanceof MouseEvent
                    return { top: event.pageY, left: event.pageX }
            else
                offset = parseFloat(@element.css('outline-width')) + parseFloat(@element.css('outline-offset'))
                top: @element.offset().top - this.toolbar.outerHeight() - offset
                left: @element.offset().left - offset

        _getCaretPosition: (range) ->
            tmpSpan = jQuery "<span/>"
            newRange = document.createRange()
            newRange.setStart range.endContainer, range.endOffset
            newRange.insertNode tmpSpan.get 0

            position = {top: tmpSpan.offset().top, left: tmpSpan.offset().left}
            tmpSpan.remove()
            return position

        _bindToolbarEventsFixed: ->
            @options.floating = false
            # catch activate -> show
            @element.bind "halloactivated", (event, data) =>
                @_updateToolbarPosition @_getToolbarPosition event
                @toolbar.show()

            # catch deactivate -> hide
            @element.bind "hallodeactivated", (event, data) =>
                @toolbar.hide()

        _bindToolbarEventsRegular: ->
            # catch select -> show (and reposition?)
            @element.bind "halloselected", (event, data) =>
                position = @_getToolbarPosition data.originalEvent, data.selection
                return unless position
                @_updateToolbarPosition position
                @toolbar.show()
                # TO CHECK: Am I not showing in some case?

            # catch deselect -> hide
            @element.bind "hallounselected", (event, data) =>
                @toolbar.hide()

            @element.bind "hallodeactivated", (event, data) =>
                @toolbar.hide()

        _setToolbarPosition: ->
            if @options.fixed
              @toolbar.css 'position', 'static'
              jQuery(@options.parentElement).append @toolbar if @toolbarMoved
              @toolbarMoved = false
              return

            # Floating toolbar, move to body
            unless @options.parentElement is 'body'
                jQuery('body').append @toolbar
                @toolbarMoved = true
            @toolbar.css 'position', 'absolute'
            @toolbar.css 'top', @element.offset().top - 20
            @toolbar.css 'left', @element.offset().left

        _prepareToolbar: ->
            @toolbar = jQuery('<div class="hallotoolbar"></div>').hide()
            @_setToolbarPosition()
            jQuery(@options.parentElement).append @toolbar

            # clicking on the toolbar would blur the editable
            # In order to keep focus on it we need to put it back later.
            widget = @

            @_bindToolbarEventsFixed() if @options.showAlways
            @_bindToolbarEventsRegular() unless @options.showAlways

            jQuery(window).resize (event) =>
                @_updateToolbarPosition @_getToolbarPosition event

            @protectFocusFrom @toolbar

        _updateToolbarPosition: (position) ->
            return if @options.fixed
            return unless position
            return unless position.top and position.left
            @toolbar.css "top", position.top
            @toolbar.css "left", position.left

        _checkModified: (event) ->
            widget = event.data
            widget.setModified() if widget.isModified()

        _keys: (event) ->
            widget = event.data
            if event.keyCode == 27
                old = widget.getContents()
                widget.restoreOriginalContent(event)
                widget._trigger "restored", null,
                    editable: widget
                    content: widget.getContents()
                    thrown: old

                widget.turnOff()

        _rangesEqual: (r1, r2) ->
            r1.startContainer is r2.startContainer and r1.startOffset is r2.startOffset and r1.endContainer is r2.endContainer and r1.endOffset is r2.endOffset

        # Check if some text is selected, and if this selection has changed. If it changed,
        # trigger the "halloselected" event
        _checkSelection: (event) ->
            if event.keyCode == 27
                return

            widget = event.data

            # The mouseup event triggers before the text selection is updated.
            # I did not find a better solution than setTimeout in 0 ms
            setTimeout ()->
                sel = widget.getSelection()
                if widget._isEmptySelection(sel) or widget._isEmptyRange(sel)
                    if widget.selection
                        widget.selection = null
                        widget._trigger "unselected", null,
                            editable: widget
                            originalEvent: event
                    return

                if !widget.selection or not widget._rangesEqual sel, widget.selection
                    widget.selection = sel.cloneRange();
                    widget._trigger "selected", null,
                        editable: widget
                        selection: widget.selection
                        ranges: [widget.selection]
                        originalEvent: event
            , 0

        _isEmptySelection: (selection) ->
            if selection.type is "Caret"
                return true

            return false

        _isEmptyRange: (range) ->
            if range.collapsed
                return true
            if range.isCollapsed
                return range.isCollapsed() if typeof range.isCollapsed is 'function'
                return range.isCollapsed

            return false

        turnOn: () ->
            if this.getContents() is this.options.placeholder
                this.setContents ''

            jQuery(@element).addClass 'inEditMode'
            #make sure the toolbar has not got the full width of the editable element when floating is set to true
            if !@options.floating
                el = jQuery(@element)
                widthToAdd = parseFloat el.css('padding-left')
                widthToAdd += parseFloat el.css('padding-right')
                widthToAdd += parseFloat el.css('border-left-width')
                widthToAdd += parseFloat el.css('border-right-width')
                widthToAdd += (parseFloat el.css('outline-width')) * 2
                widthToAdd += (parseFloat el.css('outline-offset')) * 2
                jQuery(@toolbar).css "width", el.width()+widthToAdd
            else
                @toolbar.css "width", "auto"
            @_trigger "activated", @

        turnOff: () ->
            jQuery(@element).removeClass 'inEditMode'
            @_trigger "deactivated", @

            unless @getContents()
                @setContents @options.placeholder

        _activated: (event) ->
            event.data.turnOn()

        _deactivated: (event) ->
            unless event.data._protectToolbarFocus is true
              event.data.turnOff()
            else
              setTimeout ->
                jQuery(event.data.element).focus()
              , 300

        _forceStructured: (event) ->
            try
                document.execCommand 'styleWithCSS', 0, false
            catch e
                try
                    document.execCommand 'useCSS', 0, true
                catch e
                    try
                        document.execCommand 'styleWithCSS', false, false
                    catch e

)(jQuery)
