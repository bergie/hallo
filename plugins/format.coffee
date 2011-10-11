#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            toolbar: null
            uuid: ""
            formattings: ["bold", "italic", "underline"]

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (format) =>
                label = format.substr(0, 1).toUpperCase()
                id = "#{@options.uuid}-#{format}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"#{format}_button\">#{label}</label>").button()
                buttonset.children("label").unbind('mouseout')
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", format
                button.addClass format
                button.bind "change", (event) ->
                    format = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute format
                @element.bind "keyup paste change mouseup", (event) ->
                    if document.queryCommandState format
                        button.attr "checked", true
                        button.button "refresh"
                    else
                        button.attr "checked", false
                        button.button "refresh"

            buttonize format for format in @options.formattings

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)