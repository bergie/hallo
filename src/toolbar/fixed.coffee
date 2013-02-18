#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Fixed toolbar plugin
((jQuery) ->
  jQuery.widget 'IKS.halloToolbarFixed',
    toolbar: null

    options:
      parentElement: 'body'
      editable: null
      toolbar: null

      affix: true
      affixTopOffset: 2

    _create: ->
      @toolbar = @options.toolbar
      @toolbar.show()

      jQuery(@options.parentElement).append @toolbar

      @_bindEvents()

      jQuery(window).resize (event) =>
        @setPosition()
      jQuery(window).scroll (event) =>
        @setPosition()

      # Make sure the toolbar has not got the full width of the editable
      # element when floating is set to true
      if @options.parentElement is 'body'
        el = jQuery(@element)
        widthToAdd = parseFloat el.css('padding-left')
        widthToAdd += parseFloat el.css('padding-right')
        widthToAdd += parseFloat el.css('border-left-width')
        widthToAdd += parseFloat el.css('border-right-width')
        widthToAdd += (parseFloat el.css('outline-width')) * 2
        widthToAdd += (parseFloat el.css('outline-offset')) * 2
        jQuery(@toolbar).css "width", el.width() + widthToAdd

    _getPosition: (event, selection) ->
      return unless event
      width = parseFloat @element.css 'outline-width'
      offset = width + parseFloat @element.css 'outline-offset'
      return position =
        top: @element.offset().top - @toolbar.outerHeight() - offset
        left: @element.offset().left - offset

    _getCaretPosition: (range) ->
      tmpSpan = jQuery "<span/>"
      newRange =rangy.createRange()
      newRange.setStart range.endContainer, range.endOffset
      newRange.insertNode tmpSpan.get 0

      position =
        top: tmpSpan.offset().top
        left: tmpSpan.offset().left
      tmpSpan.remove()

      return position

    setPosition: ->
      return unless @options.parentElement is 'body'
      @toolbar.css 'position', 'absolute'
      @toolbar.css 'top', @element.offset().top - @toolbar.outerHeight()

      if @options.affix
        scrollTop = jQuery(window).scrollTop()
        offset = @element.offset()
        height = @element.height()
        topOffset = @options.affixTopOffset
        elementTop = offset.top - (@toolbar.height() + @options.affixTopOffset)
        elementBottom = (height - topOffset) + (offset.top - @toolbar.height())
        
        if scrollTop > elementTop && scrollTop < elementBottom
          @toolbar.css('position', 'fixed')
          @toolbar.css('top', @options.affixTopOffset)
      else

      @toolbar.css 'left', @element.offset().left - 2

    _updatePosition: (position) ->
      return

    _bindEvents: ->
      # catch activate -> show
      @element.on 'halloactivated', (event, data) =>
        @setPosition()
        @toolbar.show()

      # catch deactivate -> hide
      @element.on 'hallodeactivated', (event, data) =>
        @toolbar.hide()
) jQuery
