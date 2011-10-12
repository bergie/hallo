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
#   The options are documented in the code.
#

((jQuery) ->
    jQuery.widget "IKS.hallooverlay",
        options:
            editable: null
            toolbar: null
            uuid: ""

            # The pieces of the overlay are re-positioned when the editable is modified. This value defines
            # the minimal interval between two repositioning to avoid performance issues
            updateInterval: 100

            # Adapt these values if you have rounded corners for the editable
            offsetTop: 0
            offsetLeft: 0
            offsetRight: 0
            offsetBottom: 0

            # The overlay pieces around the editable element
            pieces: {}

        _create: ->
            widget = this

            if not @options.bound
                @options.bound = true
                widget.options.editable.element.bind "halloselected", (event, data) ->
                    widget.options.currentEditable = jQuery(event.target)
                    widget.showOverlay()

                widget.options.editable.element.bind "hallomodified", (event, data) ->
                    if widget.options.visible
                        widget.updateOverlay()

                # abort editing when pressing ESCAPE
                widget.options.editable.element.keydown (event, data) ->
                    if event.keyCode == 27
                        widget.options.editable.restoreOriginalContent()
                        widget.options.editable.element.blur()
                        widget.hideOverlay()

                jQuery(window).resize ()->
                    if widget.options.visible
                        widget.updateOverlay(true)

        _init: ->

        showOverlay: ->
            @options.visible = true
            if @options.pieces.top
                for key, piece of @options.pieces
                    piece.show()
                @updateOverlay()
                return

            @_createOverlay()

        hideOverlay: ->
            @options.visible = false
            if @options.pieces.top
                for key, piece of @options.pieces
                    piece.hide()

            @options.editable._deactivated {data: @options.editable}

        # To prevent performance issue, we only allow the update if the last update did not occure
        # a few millieconds ago (see options.updateInterval)
        # Pass true as first argument if you want to force the update
        updateOverlay: (force) ->
            now = new Date().getTime();
            # trying to avoid performance issue
            if !force and @options.lastUpdate and now - @options.lastUpdate < @options.updateInterval
                return

            @options.lastUpdate = now
            if @options.pieces.top
                m = @_getMeasures();

                @options.pieces.left.css
                    height: m.editableHeight - @options.offsetTop - @options.offsetBottom
                    width: m.editableLeft + @options.offsetLeft

                @options.pieces.right.css
                    height: m.editableHeight - @options.offsetTop - @options.offsetBottom
                    width: m.windowWidth - (m.editableLeft + m.editableWidth) + @options.offsetRight

                @options.pieces.bottom.css
                    top: m.editableTop + m.editableHeight - @options.offsetBottom
                    height: m.documentHeight - (m.editableTop + m.editableHeight) + @options.offsetBottom

        _createOverlay: () ->
            m = @_getMeasures();

            top = @_getBasicPiece()
            top.css
                top: 0
                left: 0
                width: '100%'
                height: m.editableTop + @options.offsetTop
            jQuery(document.body).append top
            @options.pieces.top = top

            left = @_getBasicPiece()
            left.css
                top: m.editableTop + @options.offsetTop
                left: 0
                width: m.editableLeft + @options.offsetLeft
                height: m.editableHeight - @options.offsetTop - @options.offsetBottom
            jQuery(document.body).append left
            @options.pieces.left = left

            right = @_getBasicPiece()
            right.css
                top: m.editableTop + @options.offsetTop
                right: 0
                width: m.windowWidth - (m.editableLeft + m.editableWidth) + @options.offsetRight
                height: m.editableHeight - @options.offsetTop - @options.offsetBottom
            jQuery(document.body).append right
            @options.pieces.right = right

            bottom = @_getBasicPiece()
            bottom.css
                top: m.editableTop + m.editableHeight - @options.offsetBottom
                left: 0
                width: '100%'
                height: m.documentHeight - (m.editableTop + m.editableHeight) + @options.offsetBottom
            jQuery(document.body).append bottom
            @options.pieces.bottom = bottom

            for key, piece of @options.pieces
                piece.bind 'click', jQuery.proxy @hideOverlay, @

        _getMeasures: ->
            m =
                editableHeight: @options.currentEditable.outerHeight()
                editableWidth: @options.currentEditable.outerWidth()
                editableTop: parseInt @options.currentEditable.offset().top
                editableLeft: parseInt @options.currentEditable.offset().left
                windowWidth: jQuery(window).width()
                documentHeight: jQuery(window.document).height()
            m.editableRight = m.editableLeft + m.editableWidth
            m.editableBottom = m.editableTop + m.editableHeight
            return m

        _getBasicPiece: ->
            p = jQuery('<div class="halloOverlay">')
            p.css
                position: 'absolute'

)(jQuery)