#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Fixed toolbar plugin
((jQuery) ->
  jQuery.widget 'Hallo.halloToolbarFixed',
    toolbar: null

    options:
      parentElement: 'body'
      editable: null
      toolbar: null
      toolbarOffset: 0

    _create: ->
      @toolbar = @options.toolbar
      @toolbar.show()

      jQuery(@options.parentElement).append @toolbar

      @_bindEvents()

      jQuery(window).resize (event) =>
        @_updatePosition @_getPosition event

      # Make sure the toolbar has not got the full width of the editable
      # element when floating is set to true
      if @options.parentElement is 'body' and not @options.floating
        el = jQuery(@element)
        elementWidth=el.width()
        if elementWidth > 20
          widthToAdd = parseFloat el.css('padding-left')
          widthToAdd += parseFloat el.css('padding-right')
          widthToAdd += parseFloat el.css('border-left-width')
          widthToAdd += parseFloat el.css('border-right-width')
          try
            widthToAdd += (parseFloat el.css('outline-width')) * 2
            widthToAdd += (parseFloat el.css('outline-offset')) * 2
          # clear right padding
          jQuery(@toolbar).css "padding-right", ""
          jQuery(@toolbar).css "width", el.width() + widthToAdd
        else
          jQuery(@toolbar).css "padding-right", "4px"
          jQuery(@toolbar).css "width", ""

    _getPosition: (event, selection) ->
      return position =
        top: 0
        left: 0

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
      @toolbar.css 'top', @element.offset().top - @toolbar.outerHeight() - @options.toolbarOffset
      @toolbar.css 'left', @element.offset().left

    _updatePosition: (position) ->
      return

    _bindEvents: ->
      # catch activate -> show
      @element.bind 'halloactivated', (event, data) =>
        @_updatePosition @_getPosition event
        @toolbar.show()

      # catch deactivate -> hide
      @element.bind 'hallodeactivated', (event, data) =>
        @toolbar.hide()
) jQuery
