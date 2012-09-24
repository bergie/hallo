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

    _updatePosition: (position) ->
      return unless position
      return unless position.top and position.left
      @toolbar.css 'top', position.top
      @toolbar.css 'left', position.left

    _bindEvents: ->
      # catch select -> show (and reposition?)
      @element.bind 'halloselected', (event, data) =>
        position = @_getPosition data.originalEvent, data.selection
        return unless position
        @_updatePosition position
        @toolbar.show()

      # catch deselect -> hide
      @element.bind 'hallounselected', (event, data) =>
        @toolbar.hide()

      @element.bind 'hallodeactivated', (event, data) =>
        @toolbar.hide()
) jQuery
