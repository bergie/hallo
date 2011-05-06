#    Hallo - a rich text editing jQuery UI widget
#    (c) 2011 Henri Bergius, IKS Consortium
#    Hallo may be freely distributed under the MIT license
((jQuery) ->
    # Hallo provides a jQuery UI widget `hallo`. Usage:
    #
    #     jQuery('p').hallo();
    #
    # Getting out of the editing state:
    #
    #     jQuery('p').hallo({editable: false});
    jQuery.widget "IKS.hallo",
        toolbar: null
        bound: false

        options:
            editable: true
            plugins: []

        # Called once for each element
        _create: ->
            @_prepareToolbar()

            for plugin in @options.plugins
                    jQuery(@element)[plugin]
                        editable: this
                        toolbar: @toolbar

        # Called per each invokation
        _init: ->
            @element.attr "contentEditable", @options.editable

            if @options.editable
                if not @bound
                    @element.bind "focus", this, @activated
                    @element.bind "blur", this, @deactivated
                    @bound = true
            else
                @element.unbind "focus", @activated
                @element.unbind "blur", @deactivated

        _prepareToolbar: ->
            @toolbar = jQuery('<div></div>').hide()
            @toolbar.css "position", "absolute"
            @toolbar.css "top", @element.offset().top - 20
            @toolbar.css "left", @element.offset().left
            jQuery('body').append(@toolbar)

        activated: (event) ->
            widget = event.data
            if widget.toolbar.html() isnt ""
                widget.toolbar.css "top", widget.element.offset().top - widget.toolbar.height()
                widget.toolbar.show()

        deactivated: (event) ->
            widget = event.data
            window.setTimeout ->
                widget.toolbar.hide()
            , 200

        execute: (command) ->
            document.execCommand command, false, null
            @element.focus()
)(jQuery)