#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            toolbar: null
            uuid: ""
            formattings: 
                bold: true
                italic: true
                strikeThrough: true
                underline: true

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (format) =>
                label = format.substr(0, 1).toUpperCase()
                id = "#{@options.uuid}-#{format}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"#{format}_button\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", format
                button.addClass format
                button.bind "change", (event) ->
                    format = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute format

                queryState = (event) ->
                    if document.queryCommandState format
                        button.attr "checked", true
                        button.next("label").addClass "ui-state-clicked"
                        button.button "refresh"
                    else
                        button.attr "checked", false
                        button.next("label").removeClass "ui-state-clicked"
                        button.button "refresh"

                element = @element
                @element.bind "halloenabled", ->
                    element.bind "keyup paste change mouseup", queryState
                @element.bind "hallodisabled", ->
                    element.unbind "keyup paste change mouseup", queryState
            buttonize format for format, enabled of @options.formattings when enabled

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)