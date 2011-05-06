#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            toolbar: null
            formattings: ["bold", "italic"]

        _create: ->
            widget = this
            for format in @options.formattings
                button = jQuery("<button>#{format}</button>").button()
                button.attr "hallo-command", format
                button.click ->
                    format = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute format
                @options.toolbar.append button

        _init: ->

)(jQuery)