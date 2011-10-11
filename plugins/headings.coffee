#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloheadings",
        options:
            editable: null
            toolbar: null
            uuid: ""
            headers: [1,2,3]

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            id = "#{@options.uuid}-#paragraph"
            label = "P"
            buttonset.append jQuery("<input id=\"#{id}\" type=\"radio\" /><label for=\"#{id}\">#{label}</label>").button()
            button = jQuery "##{id}", buttonset
            button.attr "hallo-command", "removeFormat"
            button.bind "change", (event) ->
                cmd = jQuery(this).attr "hallo-command"
                alert cmd
                widget.options.editable.execute cmd

            buttonize = (headerSize) =>
                label = "H" + headerSize
                id = "#{@options.uuid}-#{headerSize}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"radio\" /><label for=\"#{id}\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-size", "H"+headerSize
                button.bind "change", (event) ->
                    size = jQuery(this).attr "hallo-size"
                    widget.options.editable.execute "formatBlock", size

            buttonize header for header in @options.headers

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)