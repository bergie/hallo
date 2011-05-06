#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            toolbar: null
            uuid: ""
            formattings: ["bold", "italic"]

        _create: ->
            widget = this
            buttonset = jQuery "<span></span>"
            for format in @options.formattings
                label = format.substr(0, 1).toUpperCase()
                id = "#{@options.uuid}-#{format}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", format
                button.bind "change", (event) ->
                    format = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute format

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->
)(jQuery)