#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
#     Instant toolbar plugin
#     by Marco Barbosa <iam@marcobarbosa.com>
#
((jQuery) ->
  jQuery.widget 'IKS.halloToolbarInstant',
    toolbar: null
    isActive: false

    options:
      parentElement: 'body'
      editable: null
      toolbar: null
      positionAbove: true
      toolbarActiveClass: 'hallotoolbar-active'

    _create: ->
      @toolbar = @options.toolbar
      jQuery(@options.parentElement).append @toolbar

      @_bindEvents()

    getToolbarTopOffset: ->
      # In case there is a selection, move toolbar on top of it and align with
      # start of selection.
      # Else move it on top of current position, center it and move
      # it slightly to the right.
      toolbar_height_offset = this.toolbar.outerHeight() + 10

      if this.options.positionAbove
        @top_offset = -10 - toolbar_height_offset
      else
        @top_offset = 20

      # return the top_offset
      @top_offset

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

      top = position.top - @getToolbarTopOffset()
      left = position.left

      @toolbar.css 'top', top
      @toolbar.css 'left', left

    _bindEvents: ->

      jQuery(window).resize (event) =>
        @_updatePosition @_getPosition event

      # Show the toolbar when clicking the element
      @element.on 'click', (event, data) =>
        position = {}
        $element = jQuery(event.currentTarget)
        scrollTop = jQuery(window).scrollTop()
        position.top = $element.offset().top - @getToolbarTopOffset()
        position.left = $element.offset().left
        @_updatePosition position
        if @toolbar.html() != ''
          unless @isActive
            @toolbar.show()
            @toolbar.addClass @options.toolbarActiveClass
            @isActive = true

      @element.on 'hallodeactivated', (event, data) =>
        if @isActive
          @toolbar.removeClass @options.toolbarActiveClass
          @toolbar.hide()
          @isActive = false
) jQuery
