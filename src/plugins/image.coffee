#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Image insertion plugin
#     Liip AG: Colin Frei, Reto Ryter, David Buchmann, Fabian Vogler, Bartosz Podlewski
((jQuery) ->
    jQuery.widget "Liip.halloimage",
        options:
            editable: null
            toolbar: null
            uuid: ""
            # number of thumbnails for paging in search results
            limit: 8
            # this function is responsible to fetch search results
            # query: terms to search
            # limit: how many results to show at max
            # offset: offset for the returned result
            # successCallback: function that will be called with the response json object
            #     the object has fields offset (the requested offset), total (total number of results) and assets (list of url and alt text for each image)
            search: null
            # this function is responsible to fetch suggestions for images to insert
            # this could for example be based on tags of the entity or some semantic enhancement, ...
            #
            # tags: tag information - TODO: do not expect that here but get it from context
            # limit: how many results to show at max
            # offset: offset for the returned result
            # successCallback: function that will be called with the response json object
            #     the object has fields offset (the requested offset), total (total number of results) and assets (list of url and alt text for each image)
            suggestions: null
            loaded: null
            upload: null
            uploadUrl: null
            dialogOpts:
                autoOpen: false
                width: 270
                height: "auto"
                title: "Insert Images"
                modal: false
                resizable: false
                draggable: true
                dialogClass: 'halloimage-dialog'
            dialog: null
            buttonCssClass: null
            # Additional configuration options that can be used for
            # image suggestions. The Entity is used to get tags
            # and VIE to load additional data on them.
            entity: null
            vie: null
            dbPediaUrl: "http://dev.iks-project.eu/stanbolfull"

        _create: ->
            widget = this
            dialogId = "#{@options.uuid}-image-dialog"
            @options.dialog = jQuery "<div id=\"#{dialogId}\">
                <div class=\"nav\">
                    <ul class=\"tabs\">
                    </ul>
                    <div id=\"#{@options.uuid}-tab-activeIndicator\" class=\"tab-activeIndicator\" />
                </div>
                <div class=\"dialogcontent\">
            </div>"

            if widget.options.suggestions
                @_addGuiTabSuggestions jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)
            if widget.options.search
                @_addGuiTabSearch jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)
            if widget.options.upload or widget.options.uploadUrl
                @_addGuiTabUpload jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)

            @current = jQuery('<div class="currentImage"></div>').halloimagecurrent
                uuid: @options.uuid
                imageWidget: @

            jQuery('.dialogcontent', @options.dialog).append @current

            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"

            id = "#{@options.uuid}-image"
            buttonHolder = jQuery '<span></span>'
            buttonHolder.hallobutton
                label: 'Images'
                icon: 'icon-picture'
                editable: @options.editable
                command: null
                queryState: false
                uuid: @options.uuid
                cssClass: @options.buttonCssClass
            buttonset.append buttonHolder

            @button = buttonHolder
            @button.bind "change", (event) ->
                if widget.options.dialog.dialog "isOpen"
                    widget._closeDialog()
                else
                    widget._openDialog()

            @options.editable.element.bind "hallodeactivated", (event) ->
                widget._closeDialog()

            jQuery(@options.editable.element).delegate "img", "click", (event) ->
                widget._openDialog()



            buttonset.buttonset()
            @options.toolbar.append buttonset

            @options.dialog.dialog(@options.dialogOpts)
            @_handleTabs()

            # Add DragnDrop
            @_addDragnDrop()

        _init: ->

        setCurrent: (image) ->
            @current.halloimagecurrent 'setImage', image

        _handleTabs: ->
            widget = @
            jQuery('.nav li', @options.dialog).bind 'click', ->
                jQuery(".#{widget.widgetName}-tab").hide()
                id = jQuery(this).attr 'id'
                jQuery("##{id}-content").show()
                jQuery("##{widget.options.uuid}-tab-activeIndicator").css("margin-left", jQuery(this).position().left + (jQuery(this).width()/2))

        _openDialog: ->
            widget = this
            cleanUp = ->
                window.setTimeout ->
                    thumbnails = jQuery(".imageThumbnail")
                    jQuery(thumbnails).each ->
                        size = jQuery("#" + @id).width()
                        if size <= 20
                            jQuery("#" + @id).parent("li").remove()
                , 15000  # cleanup after 15 sec

            # Update active Image
            jQuery("##{@options.uuid}-sugg-activeImage").attr "src", jQuery("##{@options.uuid}-tab-suggestions-content .imageThumbnailActive").first().attr "src"
            jQuery("##{@options.uuid}-sugg-activeImageBg").attr "src", jQuery("##{@options.uuid}-tab-suggestions-content .imageThumbnailActive").first().attr "src"

            # Save current caret point
            @lastSelection = @options.editable.getSelection()

            # Position correctly
            xposition = jQuery(@options.editable.element).offset().left + jQuery(@options.editable.element).outerWidth() - 3 # 3 is the border width of the contenteditable border
            yposition = jQuery(@options.toolbar).offset().top - jQuery(document).scrollTop() - 29
            @options.dialog.dialog("option", "position", [xposition, yposition])
            # do @_getSuggestions
 
            cleanUp()
            widget.options.loaded = 1

            @options.editable.keepActivated true
            @options.dialog.dialog("open")

            @options.dialog.bind 'dialogclose', =>
              jQuery('label', @button).removeClass 'ui-state-active'
              do @options.editable.element.focus
              @options.editable.keepActivated false

        _closeDialog: ->
            @options.dialog.dialog("close")

        _addGuiTabSuggestions: (tabs, element) ->
            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-upload\" class=\"#{@widgetName}-tabselector #{@widgetName}-tab-upload\"><span>Upload</span></li>"
            tab = jQuery "<div id=\"#{@options.uuid}-tab-upload-content\" class=\"#{@widgetName}-tab tab-upload\"></div>"
            element.append tab

            tab.halloimagesuggestions
                uuid: @options.uuid
                imageWidget: @

        _addGuiTabSearch: (tabs, element) ->
            widget = this
            dialogId = "#{@options.uuid}-image-dialog"

            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-search\" class=\"#{widget.widgetName}-tabselector #{widget.widgetName}-tab-search\"><span>Search</span></li>"

            tab = jQuery "<div id=\"#{@options.uuid}-tab-search-content\" class=\"#{widget.widgetName}-tab tab-search\"></div>"
            element.append tab

            tab.halloimagesearch
                uuid: @options.uuid
                imageWidget: @
                searchCallback: @options.search
                limit: @options.limit

        _addGuiTabUpload: (tabs, element) ->
            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-upload\" class=\"#{@widgetName}-tabselector #{@widgetName}-tab-upload\"><span>Upload</span></li>"
            tab = jQuery "<div id=\"#{@options.uuid}-tab-upload-content\" class=\"#{@widgetName}-tab tab-upload\"></div>"
            element.append tab

            tab.halloimageupload
                uuid: @options.uuid
                uploadCallback: @options.upload
                uploadUrl: @options.uploadUrl
                imageWidget: @

            ###
            insertImage = () ->
                #This may need to insert an image that does not have the same URL as the preview image, since it may be a different size

                # Check if we have a selection and fall back to @lastSelection otherwise
                try
                    if not widget.options.editable.getSelection()
                        throw new Error "SelectionNotSet"
                catch error
                    widget.options.editable.restoreSelection(widget.lastSelection)

                document.execCommand "insertImage", null, jQuery(this).attr('src')
                img = document.getSelection().anchorNode.firstChild
                jQuery(img).attr "alt", jQuery(".caption").value

                triggerModified = () ->
                    widget.element.trigger "hallomodified"
                window.setTimeout triggerModified, 100
                widget._closeDialog()

            @options.dialog.find(".halloimage-activeImage, ##{widget.options.uuid}-#{widget.widgetName}-addimage").click insertImage
            ###

        _addDragnDrop: ->
            helper =
                # Delay the execution of a function
                delayAction: (functionToCall, delay) ->
                    timer = clearTimeout(timer)
                    timer = setTimeout(functionToCall, delay)  unless timer

                # Calculate position on an initial drag
                calcPosition: (offset, event) ->
                    position = offset.left + third
                    if event.pageX >= position and event.pageX <= (offset.left + third * 2)
                        "middle"
                    else if event.pageX < position
                        "left"
                    else if event.pageX > (offset.left + third * 2)
                        "right"

                # create image to be inserted
                createInsertElement: (image, tmp) ->
                    maxWidth = 250
                    maxHeight = 250
                    tmpImg = new Image()
                    tmpImg.src = image.src
                    if not tmp
                        if @startPlace.parents(".tab-suggestions").length > 0
                            altText = jQuery("#caption-sugg").val()
                        else if @startPlace.parents(".tab-search").length > 0
                            altText = jQuery("#caption-search").val()
                        else
                            altText = jQuery(image).attr("alt")
                    width = tmpImg.width
                    height = tmpImg.height
                    if width > maxWidth or height > maxHeight
                        if width > height
                            ratio = (tmpImg.width / maxWidth).toFixed()
                        else
                            ratio = (tmpImg.height / maxHeight).toFixed()
                        width = (tmpImg.width / ratio).toFixed()
                        height = (tmpImg.height / ratio).toFixed()
                    imageInsert = jQuery("<img>").attr(
                        src: tmpImg.src
                        width: width
                        height: height
                        alt: altText
                        class: (if tmp then "tmp" else "")
                    ).show()
                    imageInsert

                createLineFeedbackElement: ->
                    jQuery("<div/>").addClass "tmpLine"

                removeFeedbackElements: ->
                    jQuery('.tmp, .tmpLine', editable).remove()

                removeCustomHelper: ->
                    jQuery(".customHelper").remove()

                showOverlay: (position) ->
                    eHeight = editable.height() + parseFloat(editable.css('paddingTop')) + parseFloat(editable.css('paddingBottom'))

                    overlay.big.css height: eHeight
                    overlay.left.css height: eHeight
                    overlay.right.css height: eHeight

                    switch position
                        when "left"
                            overlay.big.addClass("bigOverlayLeft").removeClass("bigOverlayRight").css(left: third).show()
                            overlay.left.hide()
                            overlay.right.hide()
                        when "middle"
                            overlay.big.removeClass "bigOverlayLeft bigOverlayRight"
                            overlay.big.hide()
                            overlay.left.show()
                            overlay.right.show()
                        when "right"
                            overlay.big.addClass("bigOverlayRight").removeClass("bigOverlayLeft").css(left: 0).show()
                            overlay.left.hide()
                            overlay.right.hide()
                        else

                # check if the element was dragged into or within a contenteditable
                checkOrigin: (event) ->
                    unless jQuery(event.target).parents("[contenteditable]").length is 0
                        true
                    else
                        false

                startPlace: ""

            dnd =
                createTmpFeedback: (image, position)->
                    if position is 'middle'
                        return helper.createLineFeedbackElement()
                    else
                        el = helper.createInsertElement(image, true)
                        el.addClass("inlineImage-" + position)

                handleOverEvent: (event, ui) ->
                    postPone = ->
                        window.waitWithTrash = clearTimeout(window.waitWithTrash)
                        position = helper.calcPosition(offset, event)

                        jQuery('.trashcan', ui.helper).remove()

                        editable.append overlay.big
                        editable.append overlay.left
                        editable.append overlay.right

                        helper.removeFeedbackElements()
                        jQuery(event.target).prepend(dnd.createTmpFeedback ui.draggable[0], position)

                        # already create the other feedback elements here, because we have a reference to the droppable
                        if position is "middle"
                            jQuery(event.target).prepend(dnd.createTmpFeedback ui.draggable[0], 'right')
                            jQuery('.tmp', jQuery(event.target)).hide()
                        else
                            jQuery(event.target).prepend(dnd.createTmpFeedback ui.draggable[0], 'middle')
                            jQuery('.tmpLine', jQuery(event.target)).hide()

                        helper.showOverlay position
                    # we need to postpone the handleOverEvent execution of the function for a tiny bit to avoid
                    # the handleLeaveEvent to be fired after the handleOverEvent. Removing this timeout will break things
                    setTimeout(postPone, 5)

                handleDragEvent: (event, ui) ->
                    position = helper.calcPosition(offset, event)

                    # help perfs
                    if position == dnd.lastPositionDrag
                        return

                    dnd.lastPositionDrag = position

                    tmpFeedbackLR = jQuery('.tmp', editable)
                    tmpFeedbackMiddle = jQuery('.tmpLine', editable)

                    if position is "middle"
                        tmpFeedbackMiddle.show()
                        tmpFeedbackLR.hide()
                    else
                        tmpFeedbackMiddle.hide()
                        tmpFeedbackLR.removeClass("inlineImage-left inlineImage-right").addClass("inlineImage-" + position).show()

                    helper.showOverlay position

                handleLeaveEvent: (event, ui) ->
                    func = ->
                        if not jQuery('div.trashcan', ui.helper).length
                            jQuery(ui.helper).append(jQuery('<div class="trashcan"></div>'))
                        jQuery('.bigOverlay, .smallOverlay').remove()
                    # only remove the trash after being outside of an editable more than X milliseconds
                    window.waitWithTrash = setTimeout(func, 200)
                    helper.removeFeedbackElements()

                handleStartEvent: (event, ui) ->
                    internalDrop = helper.checkOrigin(event)
                    if internalDrop
                        jQuery(event.target).remove()

                    jQuery(document).trigger('startPreventSave')
                    helper.startPlace = jQuery(event.target)

                handleStopEvent: (event, ui) ->
                    internalDrop = helper.checkOrigin(event)
                    if internalDrop
                        jQuery(event.target).remove()
                    else
                        editable.trigger('change')

                    overlay.big.hide()
                    overlay.left.hide()
                    overlay.right.hide()

                    jQuery(document).trigger('stopPreventSave');

                handleDropEvent: (event, ui) ->
                    # check whether it is an internal drop or not
                    internalDrop = helper.checkOrigin(event)
                    position = helper.calcPosition(offset, event)
                    helper.removeFeedbackElements()
                    helper.removeCustomHelper()
                    imageInsert = helper.createInsertElement(ui.draggable[0], false)

                    if position is "middle"
                        imageInsert.show()
                        imageInsert.removeClass("inlineImage-middle inlineImage-left inlineImage-right").addClass("inlineImage-" + position).css
                          position: "relative"
                          left: ((editable.width() + parseFloat(editable.css('paddingLeft')) + parseFloat(editable.css('paddingRight'))) - imageInsert.attr('width')) / 2
                        imageInsert.insertBefore jQuery(event.target)
                    else
                        imageInsert.removeClass("inlineImage-middle inlineImage-left inlineImage-right").addClass("inlineImage-" + position).css "display", "block"
                        jQuery(event.target).prepend imageInsert

                    overlay.big.hide()
                    overlay.left.hide()
                    overlay.right.hide()
                    # Let the editor know we did a change
                    editable.trigger('change')
                    # init the new image in the content
                    dnd.init(editable)

                createHelper: (event) ->
                    jQuery('<div>').css({
                        backgroundImage: "url(" + jQuery(event.currentTarget).attr('src') + ")"
                    }).addClass('customHelper').appendTo('body');

                # initialize draggable and droppable elements in the page
                # Safe to be called multiple times
                init: () ->
                    draggable = []

                    initDraggable = (elem) ->
                        if not elem.jquery_draggable_initialized
                            elem.jquery_draggable_initialized = true
                            jQuery(elem).draggable
                                cursor: "move"
                                helper: dnd.createHelper
                                drag: dnd.handleDragEvent
                                start: dnd.handleStartEvent
                                stop: dnd.handleStopEvent
                                disabled: not editable.hasClass('inEditMode')
                                cursorAt: {top: 50, left: 50}
                        draggables.push elem

                    jQuery(".rotationWrapper img", widgetOptions.dialog).each (index, elem) ->
                        initDraggable(elem) if not elem.jquery_draggable_initialized

                    jQuery('img', editable).each (index, elem) ->
                        elem.contentEditable = false
                        if not elem.jquery_draggable_initialized
                            initDraggable(elem)
                    jQuery('p', editable).each (index, elem) ->
                        return if jQuery(elem).data 'jquery_droppable_initialized'
                        jQuery(elem).droppable
                            tolerance: "pointer"
                            drop: dnd.handleDropEvent
                            over: dnd.handleOverEvent
                            out: dnd.handleLeaveEvent
                        jQuery(elem).data 'jquery_droppable_initialized', true

                enableDragging: () ->
                    jQuery.each draggables, (index, d) ->
                        jQuery(d).draggable('option', 'disabled', false)

                disableDragging: () ->
                    jQuery.each draggables, (index, d) ->
                        jQuery(d).draggable('option', 'disabled', true)

            draggables = []
            editable = jQuery(@options.editable.element)
            # keep a reference of options for context changes
            widgetOptions = @options

            offset = editable.offset()
            third = parseFloat(editable.width() / 3)
            overlayMiddleConfig =
                width: third
                height: editable.height()

            overlay =
                big: jQuery("<div/>").addClass("bigOverlay").css(
                  width: third * 2
                  height: editable.height()
                )
                left: jQuery("<div/>").addClass("smallOverlay smallOverlayLeft").css(overlayMiddleConfig)
                right: jQuery("<div/>").addClass("smallOverlay smallOverlayRight").css(overlayMiddleConfig).css("left", third * 2)

            dnd.init()

            editable.bind 'halloactivated', dnd.enableDragging
            editable.bind 'hallodeactivated', dnd.disableDragging
)(jQuery)
