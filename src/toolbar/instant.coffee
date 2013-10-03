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

    #
    # Constructor
    #
    _create: ->
      @toolbar = @options.toolbar
      jQuery(@options.parentElement).append @toolbar

      @_bindEvents()

    #
    # Returns an offset to be applied
    # based on the toolbar's height
    #
    getToolbarTopOffset: ->
      # Move it on top of current position, center it and move
      # it slightly to the right.
      toolbar_height_offset = this.toolbar.outerHeight() + 10

      if this.options.positionAbove
        @top_offset = -10 - toolbar_height_offset
      else
        @top_offset = 20

      # return the top_offset
      @top_offset

    #
    # Get top and left positions
    # based on the event
    #
    _getPosition: (event) ->
      $element = jQuery(event.currentTarget)
      scrollTop = jQuery(window).scrollTop()

      return position =
          top: $element.offset().top - @getToolbarTopOffset()
          left: $element.offset().left

    #
    # Sets the initial position of the toolbar
    #
    setPosition: ->
      unless @options.parentElement is 'body'
        # Floating toolbar, move to body
        @options.parentElement = 'body'
        jQuery(@options.parentElement).append @toolbar

    #
    # Updates the top and left positions of the toolbar
    # based on the click event
    #
    _updatePosition: (position) ->
      return unless position
      return unless position.top and position.left

      top = position.top - @getToolbarTopOffset()
      left = position.left

      @toolbar.css 'position', 'absolute'
      @toolbar.css 'top', top
      @toolbar.css 'left', left

    #
    # Attach event listeners
    #
    _bindEvents: ->

      # Show the toolbar when clicking the element
      @element.on 'click', (event, data) =>
        @_updatePosition @_getPosition event
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
