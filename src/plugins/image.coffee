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
                close: (ev, ui) ->
                    jQuery('.image_button').removeClass('ui-state-clicked')
            dialog: null
            buttonCssClass: null

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

            if widget.options.uploadUrl and !widget.options.upload
              widget.options.upload = widget._iframeUpload

            if widget.options.suggestions
                @_addGuiTabSuggestions jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)
            if widget.options.search
                @_addGuiTabSearch jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)
            if widget.options.upload
                @_addGuiTabUpload jQuery(".tabs", @options.dialog), jQuery(".dialogcontent", @options.dialog)

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

            button = buttonHolder
            button.bind "change", (event) ->
                if widget.options.dialog.dialog "isOpen"
                    widget._closeDialog()
                else
                    widget._openDialog()

            @options.editable.element.bind "hallodeactivated", (event) ->
                widget._closeDialog()

            jQuery(@options.editable.element).delegate "img", "click", (event) ->
                widget._openDialog()

            jQuery(@options.dialog).find(".nav li").click () ->
                jQuery(".#{widget.widgetName}-tab").each () ->
                    jQuery(this).hide()

                id = jQuery(this).attr("id")
                jQuery("##{id}-content").show()
                jQuery("##{widget.options.uuid}-tab-activeIndicator").css("margin-left", jQuery(this).position().left + (jQuery(this).width()/2))

            # Add action to image thumbnails
            jQuery(".#{widget.widgetName}-tab .imageThumbnail").live "click", (event) ->
                scope = jQuery(this).closest(".#{widget.widgetName}-tab")
                jQuery(".imageThumbnail", scope).removeClass "imageThumbnailActive"
                jQuery(this).addClass "imageThumbnailActive"
                jQuery(".activeImage", scope).attr "src", jQuery(this).attr "src"
                jQuery(".activeImageBg", scope).attr "src", jQuery(this).attr "src"

            buttonset.buttonset()
            @options.toolbar.append buttonset
            @options.dialog.dialog(@options.dialogOpts)

            # Add DragnDrop
            @_addDragnDrop()

        _init: ->

        _openDialog: ->
            widget = this
            cleanUp = ->
                window.setTimeout (->
                    thumbnails = jQuery(".imageThumbnail")
                    jQuery(thumbnails).each ->
                        size = jQuery("#" + @id).width()
                        if size <= 20
                            jQuery("#" + @id).parent("li").remove()
                ), 15000  # cleanup after 15 sec

            repoImagesFound = false

            showResults = (response) ->
                # TODO: paging
                jQuery.each response.assets, (key, val) ->
                    jQuery(".imageThumbnailContainer ul").append "<li><img src=\"" + val.url + "\" class=\"imageThumbnail\"></li>"
                    repoImagesFound = true
                if response.assets.length > 0
                    jQuery("#activitySpinner").hide()

            # Update state of button in toolbar
            jQuery('.image_button').addClass('ui-state-clicked')

            # Update active Image
            jQuery("##{@options.uuid}-sugg-activeImage").attr "src", jQuery("##{@options.uuid}-tab-suggestions-content .imageThumbnailActive").first().attr "src"
            jQuery("##{@options.uuid}-sugg-activeImageBg").attr "src", jQuery("##{@options.uuid}-tab-suggestions-content .imageThumbnailActive").first().attr "src"

            # Save current caret point
            @lastSelection = @options.editable.getSelection()

            # Position correctly
            xposition = jQuery(@options.editable.element).offset().left + jQuery(@options.editable.element).outerWidth() - 3 # 3 is the border width of the contenteditable border
            yposition = jQuery(@options.toolbar).offset().top - jQuery(document).scrollTop() - 29
            @options.dialog.dialog("option", "position", [xposition, yposition])

            if widget.options.loaded is null && widget.options.suggestions
                articleTags = []
                jQuery("#activitySpinner").show()
                tmpArticleTags = jQuery(".inEditMode").parent().find(".articleTags input").val()
                tmpArticleTags = tmpArticleTags.split(",")
                for i of tmpArticleTags
                    tagType = typeof tmpArticleTags[i]
                    if "string" == tagType && tmpArticleTags[i].indexOf("http") != -1
                        articleTags.push tmpArticleTags[i]
                jQuery(".imageThumbnailContainer ul").empty()
                widget.options.suggestions(jQuery(".inEditMode").parent().find(".articleTags input").val(), widget.options.limit, 0, showResults)
                vie = new VIE()
                vie.use new vie.DBPediaService(
                    url: "http://dev.iks-project.eu/stanbolfull"
                    proxyDisabled: true
                )
                thumbId = 1
                if articleTags.length is 0
                    jQuery("#activitySpinner").html "No images found."
                jQuery(articleTags).each ->
                    vie.load(entity: this + "").using("dbpedia").execute().done (entity) ->
                        jQuery(entity).each ->
                            if @attributes["<http://dbpedia.org/ontology/thumbnail>"]
                                responseType = typeof (@attributes["<http://dbpedia.org/ontology/thumbnail>"])
                                if responseType is "string"
                                    img = @attributes["<http://dbpedia.org/ontology/thumbnail>"]
                                    img = img.substring(1, img.length - 1)
                                if responseType is "object"
                                    img = ""
                                    img = @attributes["<http://dbpedia.org/ontology/thumbnail>"][0].value
                                jQuery(".imageThumbnailContainer ul").append "<li><img id=\"si-#{thumbId}\" src=\"#{img}\" class=\"imageThumbnail\"></li>"
                                thumbId++
                        jQuery("#activitySpinner").hide()

            cleanUp()
            widget.options.loaded = 1

            @options.dialog.dialog("open")
            @options.editable.protectFocusFrom @options.dialog

        _closeDialog: ->
            @options.dialog.dialog("close")

        _addGuiTabSuggestions: (tabs, element) ->
            widget = this
            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-suggestions\" class=\"#{widget.widgetName}-tabselector #{widget.widgetName}-tab-suggestions\"><span>Suggestions</span></li>"
            element.append jQuery "<div id=\"#{@options.uuid}-tab-suggestions-content\" class=\"#{widget.widgetName}-tab tab-suggestions\">
                <div class=\"imageThumbnailContainer fixed\"><div id=\"activitySpinner\">Loading Images...</div><ul><li>
                    <img src=\"http://imagesus.homeaway.com/mda01/badf2e69babf2f6a0e4b680fc373c041c705b891\" class=\"imageThumbnail imageThumbnailActive\" />
                  </li></ul><br style=\"clear:both\"/>
                </div>
                <div class=\"activeImageContainer\">
                    <div class=\"rotationWrapper\">
                        <div class=\"hintArrow\"></div>
                        <img src=\"\" id=\"#{@options.uuid}-sugg-activeImage\" class=\"activeImage\" />
                    </div>
                    <img src=\"\" id=\"#{@options.uuid}-sugg-activeImageBg\" class=\"activeImage activeImageBg\" />
                </div>
                <div class=\"metadata\">
                    <label for=\"caption-sugg\">Caption</label><input type=\"text\" id=\"caption-sugg\" />
                </div>
            </div>"

        _addGuiTabSearch: (tabs, element) ->
            widget = this
            dialogId = "#{@options.uuid}-image-dialog"

            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-search\" class=\"#{widget.widgetName}-tabselector #{widget.widgetName}-tab-search\"><span>Search</span></li>"

            element.append jQuery "<div id=\"#{@options.uuid}-tab-search-content\" class=\"#{widget.widgetName}-tab tab-search\">
                <form type=\"get\" id=\"#{@options.uuid}-#{widget.widgetName}-searchForm\">
                    <input type=\"text\" class=\"searchInput\" /><input type=\"submit\" id=\"#{@options.uuid}-#{widget.widgetName}-searchButton\" class=\"button searchButton\" value=\"OK\"/>
                </form>
                <div class=\"searchResults imageThumbnailContainer\"></div>
                <div id=\"#{@options.uuid}-search-activeImageContainer\" class=\"search-activeImageContainer activeImageContainer\">
                    <div class=\"rotationWrapper\">
                        <div class=\"hintArrow\"></div>
                        <img src=\"\" id=\"#{@options.uuid}-search-activeImageBg\" class=\"activeImage\" />
                    </div>
                    <img src=\"\" id=\"#{@options.uuid}-search-activeImage\" class=\"activeImage activeImageBg\" />
                </div>
                <div class=\"metadata\" id=\"metadata-search\" style=\"display: none;\">
                    <label for=\"caption-search\">Caption</label><input type=\"text\" id=\"caption-search\" />
                    <!--<button id=\"#{@options.uuid}-#{widget.widgetName}-addimage\">Add Image</button>-->
                </div>
            </div>"

            jQuery(".tab-search form", element).submit (event) ->
                event.preventDefault()
                that = this

                showResults = (response) ->
                    items = []
                    items.push("<div class=\"pager-prev\" style=\"display:none\"></div>");
                    jQuery.each response.assets, (key, val) ->
                        items.push("<img src=\"#{val.url}\" class=\"imageThumbnail #{widget.widgetName}-search-imageThumbnail\" /> ");
                    items.push("<div class=\"pager-next\" style=\"display:none\"></div>");

                    container = jQuery("##{dialogId} .tab-search .searchResults")
                    container.html items.join("")

                    # handle pagers
                    if response.offset > 0
                        jQuery('.pager-prev', container).show()
                    if response.offset < response.total
                        jQuery('.pager-next', container).show()

                    jQuery('.pager-prev', container).click (event) ->
                        widget.options.search(null, widget.options.limit, response.offset - widget.options.limit, showResults)
                    jQuery('.pager-next', container).click (event) ->
                        widget.options.search(null, widget.options.limit, response.offset + widget.options.limit, showResults)

                    # Add action to image thumbnails
                    jQuery("##{widget.options.uuid}-search-activeImageContainer").show()
                    firstimage = jQuery(".#{widget.widgetName}-search-imageThumbnail").first().addClass "imageThumbnailActive"
                    jQuery("##{widget.options.uuid}-search-activeImage, ##{widget.options.uuid}-search-activeImageBg").attr "src", firstimage.attr "src"

                    jQuery("#metadata-search").show()

                widget.options.search(null, widget.options.limit, 0, showResults)

        _prepareIframe: (widget) ->
          widget.options.iframeName = "#{widget.options.uuid}-#{widget.widgetName}-postframe"  
          iframe = jQuery "<iframe name=\"#{widget.options.iframeName}\" id=\"#{widget.options.iframeName}\" class=\"hidden\" src=\"javascript:false;\" style=\"display:none\" />"
          jQuery("##{widget.options.uuid}-#{widget.widgetName}-iframe").append iframe
          iframe.get(0).name = widget.options.iframeName

        _iframeUpload: (data) ->
          widget = data.widget
          widget._prepareIframe widget

          jQuery("##{widget.options.uuid}-#{widget.widgetName}-tags").val jQuery(".inEditMode").parent().find(".articleTags input").val()

          uploadForm = jQuery("##{widget.options.uuid}-#{widget.widgetName}-uploadform")
          uploadForm.attr "action", widget.options.uploadUrl
          uploadForm.attr "method", "post"
          uploadForm.attr "userfile", data.file
          uploadForm.attr "enctype", "multipart/form-data"
          uploadForm.attr "encoding", "multipart/form-data"
          uploadForm.attr "target", widget.options.iframeName
          uploadForm.submit()
          jQuery("##{widget.options.iframeName}").load ->
              data.success jQuery("##{widget.options.iframeName}")[0].contentWindow.location.href

        _addGuiTabUpload: (tabs, element) ->
            widget = this
            tabs.append jQuery "<li id=\"#{@options.uuid}-tab-upload\" class=\"#{widget.widgetName}-tabselector #{widget.widgetName}-tab-upload\"><span>Upload</span></li>"
            element.append jQuery "<div id=\"#{@options.uuid}-tab-upload-content\" class=\"#{widget.widgetName}-tab tab-upload\">
                <form id=\"#{@options.uuid}-#{widget.widgetName}-uploadform\">
                    <input id=\"#{@options.uuid}-#{widget.widgetName}-file\" name=\"#{@options.uuid}-#{widget.widgetName}-file\" type=\"file\" class=\"file\" accept=\"image/*\">
                    <input id=\"#{@options.uuid}-#{widget.widgetName}-tags\" name=\"tags\" type=\"hidden\" />
                    <br />
                    <input type=\"submit\" value=\"Upload\" id=\"#{@options.uuid}-#{widget.widgetName}-upload\">
                </form>
                <div id=\"#{@options.uuid}-#{widget.widgetName}-iframe\"></div>
            </div>"

            iframe = jQuery("<iframe name=\"postframe\" id=\"postframe\" class=\"hidden\" src=\"about:none\" style=\"display:none\" />")

            jQuery("##{widget.options.uuid}-#{widget.widgetName}-upload").live "click", (e) ->
                  e.preventDefault()
                  userFile = jQuery("##{widget.options.uuid}-#{widget.widgetName}-file").val()
                  widget.options.upload
                      widget: widget
                      file: userFile
                      success: (imageUrl) ->
                          imageID = "si" + Math.floor(Math.random() * (400 - 300 + 1) + 400) + "ab"
                          if jQuery(".imageThumbnailContainer ul", widget.options.dialog).length is 0
                            list = jQuery '<ul></ul>'
                            jQuery('.imageThumbnailContainer').append list
                          jQuery(".imageThumbnailContainer ul", widget.options.dialog).append "<li><img src=\"#{imageUrl}\" id=\"#{imageID}\" class=\"imageThumbnail\"></li>" 
                          jQuery("#" + imageID).trigger "click"
                          jQuery(widget.options.dialog).find(".nav li").first().trigger "click"
                  return false;

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
