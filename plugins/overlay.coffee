#   Hallo - a rich text editing jQuery UI widget
#   (c) 2011 Henri Bergius, IKS Consortium
#   Hallo may be freely distributed under the MIT license
#
# ============================================================
#
#   Hallo overlay plugin
#   (c) 2011 Liip AG, Switzerland
#   This plugin may be freely distributed under the MIT license.
#
#   The overlay plugin adds an overlay around the editable element.
#   It has no direct dependency with other plugins, but requires the
#   "floating" hallo option to be false to look nice. Furthermore, the
#   toolbar should have the same width as the editable element.
#

((jQuery) ->
    jQuery.widget "IKS.hallooverlay",
        options:
            editable: null
            toolbar: null
            uuid: ""
            overlay: null

        _create: ->
            widget = this

            if not @options.bound
                @options.bound = true
                widget.options.editable.element.bind "halloactivated", (event, data) ->
                    widget.options.currentEditable = jQuery(event.target)
                    widget.showOverlay()

                # abort editing when pressing ESCAPE --- This should be covered in hallo core, it's just not working yet
                widget.options.editable.element.keydown (event, data) ->
                    if event.keyCode == 27
                        widget.options.editable.restoreOriginalContent()
                        widget.options.editable.element.blur()
                        widget.hideOverlay()

        _init: ->

        showOverlay: ->
            @options.visible = true
            if @options.overlay is null
                if jQuery("#halloOverlay").length > 0
                    @options.overlay = jQuery("#halloOverlay")
                    @options.overlay.bind 'click', jQuery.proxy @hideOverlay, @
                else
                    @options.overlay = jQuery('<div id="halloOverlay" class="halloOverlay">')
                    jQuery(document.body).append @options.overlay
                    @options.overlay.bind 'click', jQuery.proxy @hideOverlay, @

            @options.overlay.show()

            @options.originalBgColor = @options.currentEditable.css "background-color"
            @options.currentEditable.css 'background-color', @_findBackgroundColor(jQuery(@options.currentEditable))
            if not @options.originalZIndex
                @options.originalZIndex = @options.currentEditable.css "z-index"
            @options.currentEditable.css 'z-index', '350'

        hideOverlay: ->
            @options.visible = false
            @options.overlay.hide()

            @options.currentEditable.css 'background-color', @options.originalBgColor
            @options.currentEditable.css 'z-index', @options.originalZIndex

            @options.editable._deactivated {data: @options.editable}

        _findBackgroundColor: (jQueryfield) ->
            color = jQueryfield.css("background-color")
            if color isnt 'rgba(0, 0, 0, 0)' and color isnt 'transparent'
                return color

            if jQueryfield.is "body"
                return "white"
            else
                return @_findBackgroundColor(jQueryfield.parent())

)(jQuery)