#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Instant toolbar plugin
((jQuery) ->
  jQuery.widget 'IKS.halloToolbarInstant',
    toolbar: null

    options:
      parentElement: 'body'
      editable: null
      toolbar: null
      positionAbove: false

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

      # In case there is a selection, move toolbar on top of it and align with
      # start of selection.
      # Else move it on top of current position, center it and move
      # it slightly to the right.
      toolbar_height_offset = this.toolbar.outerHeight() + 10
      if selection and !selection.collapsed and selection.nativeRange
        selectionRect = selection.nativeRange.getBoundingClientRect()
        if this.options.positionAbove
          top_offset = selectionRect.top - toolbar_height_offset
        else
          top_offset = selectionRect.bottom + 10

        top = jQuery(window).scrollTop() + top_offset
        left = jQuery(window).scrollLeft() + selectionRect.left
      else
        if this.options.positionAbove
          top_offset = -10 - toolbar_height_offset
        else
          top_offset = 20
        top = position.top + top_offset
        left = position.left - @toolbar.outerWidth() / 2 + 30
      @toolbar.css 'top', top
      @toolbar.css 'left', left

    _bindEvents: ->
      # Show the toolbar when clicking the element
      @element.on 'click', (event, data) =>
        position = {}
        scrollTop = $('window').scrollTop()
        position.top = event.clientY + scrollTop
        position.left = event.clientX
        @_updatePosition(position, null)
        if @toolbar.html() != ''
          @toolbar.show()

      # catch select -> show (and reposition?)
      @element.on 'halloselected', (event, data) =>
        position = @_getPosition data.originalEvent, data.selection
        return unless position
        @_updatePosition position, data.selection
        if @toolbar.html() != ''
          @toolbar.show()

      # catch deselect -> hide
      @element.on 'hallounselected', (event, data) =>
        @toolbar.hide()

      @element.on 'hallodeactivated', (event, data) =>
        @toolbar.hide()
) jQuery
