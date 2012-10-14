#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Contextual toolbar plugin
((jQuery) ->
  jQuery.widget 'Hallo.halloToolbarContextual',
    toolbar: null

    options:
      parentElement: 'body'
      editable: null
      toolbar: null

    _create: ->
      @toolbar = @options.toolbar
      jQuery(@options.parentElement).append @toolbar

      @_bindEvents()

      jQuery(window).resize (event) =>
        @_updatePosition @_getPosition event

    _getPosition: (event, selection) ->
      return unless event
      eventType = event.type
      switch eventType
        when 'keydown', 'keyup', 'keypress'
          return @_getCaretPosition selection
        when 'click', 'mousedown', 'mouseup'
          return position =
            top: event.pageY
            left: event.pageX

    _getCaretPosition: (range) ->
      tmpSpan = jQuery "<span/>"
      newRange = rangy.createRange()
      newRange.setStart range.endContainer, range.endOffset
      newRange.insertNode tmpSpan.get 0

      position =
        top: tmpSpan.offset().top
        left: tmpSpan.offset().left
      tmpSpan.remove()

      return position

    setPosition: ->
      unless @options.parentElement is 'body'
        # Floating toolbar, move to body
        @options.parentElement = 'body'
        jQuery(@options.parentElement).append @toolbar

      @toolbar.css 'position', 'absolute'
      @toolbar.css 'top', @element.offset().top - 20
      @toolbar.css 'left', @element.offset().left

    _updatePosition: (position, selection=null) ->
      return unless position
      return unless position.top and position.left

      # In case there is a selction, move toolbar on top of a selection
      # else move it on top of current position, center it and move
      # it slightly to the right.
      if selection and !selection.collapsed and selection.nativeRange
        selectionRect = selection.nativeRange.getBoundingClientRect()
        top = $(window).scrollTop() + selectionRect.top
        left = $(window).scrollLeft() + selectionRect.left
      else
        top = position.top - 10
        left = position.left - @toolbar.outerWidth() / 2 + 30
      @toolbar.css 'top', top - (@toolbar.outerHeight() + 10)
      @toolbar.css 'left', left

    _bindEvents: ->
      # catch select -> show (and reposition?)
      @element.bind 'halloselected', (event, data) =>
        position = @_getPosition data.originalEvent, data.selection
        return unless position
        @_updatePosition position, data.selection
        @toolbar.show()

      # catch deselect -> hide
      @element.bind 'hallounselected', (event, data) =>
        @toolbar.hide()

      @element.bind 'hallodeactivated', (event, data) =>
        @toolbar.hide()
) jQuery
