#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimagecurrent',
    options:
      imageWidget: null
      startPlace: ''
      draggables: []
      maxWidth: 400
      maxHeight: 200

    _create: ->
      @element.html '<div>
        <div class="activeImageContainer">
          <div class="rotationWrapper">
            <div class="hintArrow"></div>
              <img src="" class="activeImage" />
            </div>
            <img src="" class="activeImage activeImageBg" />
          </div>
          <div class="metadata" style="display: none;">
            <input type="text" class="caption" name="caption" />
          </div>
        </div>'
      @element.hide()
      @_prepareDnD()

    _prepareDnD: ->
      widget = @
      editable = jQuery @options.editable.element

      @options.offset = editable.offset()
      @options.third = parseFloat editable.width() / 3
      overlayMiddleConfig =
        width: @options.third
        height: editable.height()

      @overlay =
        big: jQuery("<div/>").addClass("bigOverlay").css
          width: @options.third * 2
          height: editable.height()
        left: jQuery("<div/>").addClass("smallOverlay smallOverlayLeft").css(overlayMiddleConfig)
        right: jQuery("<div/>").addClass("smallOverlay smallOverlayRight").css(overlayMiddleConfig).css("left", @options.third * 2)

      editable.bind 'halloactivated', ->
        widget._enableDragging()
      editable.bind 'hallodeactivated', ->
        widget._disableDragging()

    setImage: (image) ->
      return unless image
      @element.show()

      jQuery('.activeImage', @element).attr 'src', image.url

      if image.label
        jQuery('input', @element).val image.label
        jQuery('.metadata', @element).show()

      @_initImage jQuery @options.editable.element

    # Delay the execution of a function
    _delayAction: (functionToCall, delay) ->
      timer = clearTimeout timer
      timer = setTimeout(functionToCall, delay) unless timer
      
    # Calculate position on an initial drag
    _calcDropPosition: (offset, event) ->
      position = offset.left + @options.third
      if event.pageX >= position and event.pageX <= (offset.left + @options.third * 2)
        return 'middle'
      else if event.pageX < position
        return 'left'
      else if event.pageX > (offset.left + @options.third * 2)
        return 'right'

    # create image to be inserted
    _createInsertElement: (image, tmp) ->
      imageInsert = jQuery '<img>'

      tmpImg = new Image()

      # Calculate the size for the image
      maxWidth = @options.maxWidth
      maxHeight = @options.maxHeight
      jQuery(tmpImg).bind 'load', ->
        width = tmpImg.width
        height = tmpImg.height

        if width > maxWidth or height > maxHeight
          if width > height
            ratio = (tmpImg.width / maxWidth).toFixed()
          else
            ratio = (tmpImg.height / maxHeight).toFixed()
          width = (tmpImg.width / ratio).toFixed()
          height = (tmpImg.height / ratio).toFixed()

        imageInsert.attr
          width: width
          height: height

      tmpImg.src = image.src
      
      imageInsert.attr
        src: tmpImg.src
        alt: jQuery(image).attr('alt') unless tmp
        class: if tmp then 'halloTmp' else ''

      imageInsert.show()
      imageInsert

    _createLineFeedbackElement: ->
      jQuery('<div/>').addClass 'halloTmpLine'

    _removeFeedbackElements: ->
      jQuery('.halloTmp, .halloTmpLine', @options.editable.element).remove()

    _removeCustomHelper: ->
      jQuery('.customHelper').remove()

    _showOverlay: (position) ->
      editable = jQuery @options.editable.element
      eHeight = editable.height() + parseFloat(editable.css('paddingTop')) + parseFloat(editable.css('paddingBottom'))

      @overlay.big.css height: eHeight
      @overlay.left.css height: eHeight
      @overlay.right.css height: eHeight

      switch position
        when 'left'
          @overlay.big.addClass("bigOverlayLeft").removeClass("bigOverlayRight").css(left: @options.third).show()
          @overlay.left.hide()
          @overlay.right.hide()
        when 'middle'
          @overlay.big.removeClass "bigOverlayLeft bigOverlayRight"
          @overlay.big.hide()
          @overlay.left.show()
          @overlay.right.show()
        when 'right'
          @overlay.big.addClass("bigOverlayRight").removeClass("bigOverlayLeft").css(left: 0).show()
          @overlay.left.hide()
          @overlay.right.hide()

    # check if the element was dragged into or within a contenteditable
    _checkOrigin: (event) ->
      unless jQuery(event.target).parents("[contenteditable]").length is 0
        return true
      false

    _createTmpFeedback: (image, position)->
      if position is 'middle'
        return @_createLineFeedbackElement()
      el = @_createInsertElement image, true
      el.addClass "inlineImage-#{position}"

    _handleOverEvent: (event, ui) ->
      widget = @
      editable = jQuery @options.editable
      postPone = ->
        window.waitWithTrash = clearTimeout(window.waitWithTrash)
        position = widget._calcDropPosition widget.options.offset, event

        jQuery('.trashcan', ui.helper).remove()

        editable.append widget.overlay.big
        editable.append widget.overlay.left
        editable.append widget.overlay.right

        widget._removeFeedbackElements()
        jQuery(event.target).prepend widget._createTmpFeedback ui.draggable[0], position

        # already create the other feedback elements here, because we have a reference to the droppable
        if position is 'middle'
          jQuery(event.target).prepend widget._createTmpFeedback ui.draggable[0], 'right'
          jQuery('.halloTmp', event.target).hide()
        else
          jQuery(event.target).prepend widget._createTmpFeedback ui.draggable[0], 'middle'
          jQuery('.halloTmpLine', event.target).hide()

        widget._showOverlay position

      # we need to postpone the handleOverEvent execution of the function for a tiny bit to avoid
      # the handleLeaveEvent to be fired after the handleOverEvent. Removing this timeout will break things
      setTimeout(postPone, 5)

    _handleDragEvent: (event, ui) ->
      position = @_calcDropPosition @options.offset, event

      # help perfs
      return if position is @_lastPositionDrag

      @_lastPositionDrag = position

      tmpFeedbackLR = jQuery '.halloTmp', @options.editable.element
      tmpFeedbackMiddle = jQuery '.halloTmpLine', @options.editable.element

      if position is 'middle'
        tmpFeedbackMiddle.show()
        tmpFeedbackLR.hide()
      else
        tmpFeedbackMiddle.hide()
        tmpFeedbackLR.removeClass('inlineImage-left inlineImage-right').addClass("inlineImage-#{position}").show()

      @_showOverlay position

    _handleLeaveEvent: (event, ui) ->
      func = ->
        unless jQuery('div.trashcan', ui.helper).length
          jQuery(ui.helper).append(jQuery('<div class="trashcan"></div>'))
          jQuery('.bigOverlay, .smallOverlay').remove()
      # only remove the trash after being outside of an editable more than X milliseconds
      window.waitWithTrash = setTimeout(func, 200)
      @_removeFeedbackElements()

    _handleStartEvent: (event, ui) ->
      internalDrop = @_checkOrigin event
      if internalDrop
        jQuery(event.target).remove()

      jQuery(document).trigger 'startPreventSave'
      @options.startPlace = jQuery(event.target)

    _handleStopEvent: (event, ui) ->
      internalDrop = @_checkOrigin event
      if internalDrop
        jQuery(event.target).remove()
      else
        jQuery(@options.editable.element).trigger 'change'

      @overlay.big.hide()
      @overlay.left.hide()
      @overlay.right.hide()

      jQuery(document).trigger 'stopPreventSave'

    _handleDropEvent: (event, ui) ->
      editable = jQuery @options.editable.element
      # check whether it is an internal drop or not
      internalDrop = @_checkOrigin event
      position = @_calcDropPosition @options.offset, event
      @_removeFeedbackElements()
      @_removeCustomHelper()
      imageInsert = @_createInsertElement ui.draggable[0], false

      if position is 'middle'
        imageInsert.show()
        imageInsert.removeClass 'inlineImage-middle inlineImage-left inlineImage-right'
        imageInsert.addClass("inlineImage-#{position}").css
          position: 'relative'
          left: ((editable.width() + parseFloat(editable.css('paddingLeft')) + parseFloat(editable.css('paddingRight'))) - imageInsert.attr('width')) / 2
        imageInsert.insertBefore jQuery event.target
      else
        imageInsert.removeClass 'inlineImage-middle inlineImage-left inlineImage-right'
        imageInsert.addClass("inlineImage-#{position}")
        imageInsert.css 'display', 'block'
        jQuery(event.target).prepend imageInsert

      @overlay.big.hide()
      @overlay.left.hide()
      @overlay.right.hide()
      # Let the editor know we did a change
      editable.trigger('change')
      # init the new image in the content
      @_initImage editable

    _createHelper: (event) ->
      jQuery('<div>').css(
        backgroundImage: "url(#{jQuery(event.currentTarget).attr('src')})"
      ).addClass('customHelper').appendTo('body');

    _initDraggable: (elem, editable) ->
      widget = @
      unless elem.jquery_draggable_initialized
        elem.jquery_draggable_initialized = true
        jQuery(elem).draggable
          cursor: 'move'
          helper: (event) -> widget._createHelper event
          drag: (event, ui) -> widget._handleDragEvent event, ui
          start: (event, ui) -> widget._handleStartEvent event, ui
          stop: (event, ui) -> widget._handleStopEvent event, ui
          disabled: not editable.hasClass 'inEditMode'
          cursorAt:
            top: 50
            left: 50
      widget.options.draggables.push elem

    # initialize draggable and droppable elements in the page
    # Safe to be called multiple times
    _initImage: (editable) ->
      widget = @

      jQuery('.rotationWrapper img', @options.dialog).each (index, elem) ->
        widget._initDraggable elem, editable

      jQuery('img', editable).each (index, elem) ->
        elem.contentEditable = false
        widget._initDraggable elem, editable

      jQuery('p', editable).each (index, elem) ->
        return if jQuery(elem).data 'jquery_droppable_initialized'
        jQuery(elem).droppable
          tolerance: 'pointer'
          drop: (event, ui) -> widget._handleDropEvent event, ui
          over: (event, ui) -> widget._handleOverEvent event, ui
          out: (event, ui) -> widget._handleLeaveEvent event, ui
        jQuery(elem).data 'jquery_droppable_initialized', true

    _enableDragging: ->
      jQuery.each @options.draggables, (index, d) ->
        jQuery(d).draggable 'option', 'disabled', false

    _disableDragging: () ->
      jQuery.each @options.draggables, (index, d) ->
        jQuery(d).draggable 'option', 'disabled', true

) jQuery
