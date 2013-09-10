#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
# -----------------------------------------
#
#     Hallo overlay plugin
#     (c) 2011 Liip AG, Switzerland
#     This plugin may be freely distributed under the MIT license.
#
# The overlay plugin adds an overlay around the editable element.
# It has no direct dependency with other plugins, but requires the
# "floating" hallo option to be false to look nice. Furthermore, the
# toolbar should have the same width as the editable element.
((jQuery) ->
  jQuery.widget "IKS.hallooverlay",
    options:
      editable: null
      toolbar: null
      uuid: ""
      overlay: null
      padding: 10
      background: null

    _create: ->
      widget = this

      unless @options.bound
        @options.bound = true
        @options.editable.element.on "halloactivated", (event, data) ->
          widget.options.currentEditable = jQuery(event.target)
          if !widget.options.visible
            widget.showOverlay()

        @options.editable.element.on "hallomodified", (event, data) ->
          widget.options.currentEditable = jQuery(event.target)
          if widget.options.visible
            widget.resizeOverlay()

        @options.editable.element.on "hallodeactivated", (event, data) ->
          widget.options.currentEditable = jQuery(event.target)
          if widget.options.visible
            widget.hideOverlay()

    showOverlay: ->
      @options.visible = true
      if @options.overlay is null
        if jQuery("#halloOverlay").length > 0
          @options.overlay = jQuery("#halloOverlay")
        else
          @options.overlay = jQuery "<div id=\"halloOverlay\"
            class=\"halloOverlay\">"
          jQuery(document.body).append @options.overlay

        @options.overlay.on 'click'
        , jQuery.proxy @options.editable.turnOff, @options.editable

      @options.overlay.show()
            
      if @options.background is null
        if jQuery("#halloBackground").length > 0
          @options.background = jQuery("#halloBackground")
        else
          @options.background = jQuery "<div id=\"halloBackground\"
            class=\"halloBackground\">"
          jQuery(document.body).append @options.background


      @resizeOverlay()
      @options.background.show()

      unless @options.originalZIndex
        @options.originalZIndex = @options.currentEditable.css "z-index"
      @options.currentEditable.css 'z-index', '350'

    resizeOverlay: ->
      offset = @options.currentEditable.offset()
      @options.background.css
        top: offset.top - @options.padding
        left: offset.left - @options.padding
        width: @options.currentEditable.width() + 2 * @options.padding
        height: @options.currentEditable.height() + 2 * @options.padding

    hideOverlay: ->
      @options.visible = false
      @options.overlay.hide()
      @options.background.hide()

      @options.currentEditable.css 'z-index', @options.originalZIndex

    # Find the closest parent having a background color. If none, returns white.
    _findBackgroundColor: (jQueryfield) ->
      color = jQueryfield.css "background-color"
      if color isnt 'rgba(0, 0, 0, 0)' and color isnt 'transparent'
        return color

      if jQueryfield.is "body"
        return "white"
      else
        return @_findBackgroundColor jQueryfield.parent()

)(jQuery)
