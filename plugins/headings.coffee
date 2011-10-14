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
            id = "#{@options.uuid}-paragraph"
            label = "P"
            buttonset.append jQuery("<input id=\"#{id}\" type=\"radio\" /><label for=\"#{id}\" class=\"p_button\">#{label}</label>").button()
            buttonset.children("label").unbind('mouseout')
            button = jQuery "##{id}", buttonset
            button.attr "hallo-command", "formatBlock"
            button.bind "change", (event) ->
                cmd = jQuery(this).attr "hallo-command"
                widget.options.editable.execute cmd, "P"

            buttonize = (headerSize) =>
                label = "H" + headerSize
                id = "#{@options.uuid}-#{headerSize}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"radio\" /><label for=\"#{id}\" class=\"h#{headerSize}_button\">#{label}</label>").button()
                buttonset.children("label").unbind('mouseout')
                button = jQuery "##{id}", buttonset
                button.attr "hallo-size", "H"+headerSize
                button.bind "change", (event) ->
                    size = jQuery(this).attr "hallo-size"
                    widget.options.editable.execute "formatBlock", size

            buttonize header for header in @options.headers

            buttonset.buttonset()

            @element.bind "keyup paste change mouseup", (event) ->
                labelParent = jQuery(buttonset)
                labelParent.children('input').attr "checked", false
                format = document.queryCommandValue("formatBlock").toUpperCase()

                if format is "P"
                    selectedButton = jQuery("##{widget.options.uuid}-paragraph")
                else
                    selectedButton = jQuery("[hallo-size='#{format}']")

                selectedButton.attr "checked", true
                labelParent.children('label').removeClass "ui-state-active"
                selectedButton.next().addClass "ui-state-active"
                selectedButton.button("widget").button "refresh"

            @options.toolbar.append buttonset

        _init: ->

)(jQuery)
