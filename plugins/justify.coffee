#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallojustify",
        options:
            editable: null
            toolbar: null
            uuid: ""

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (alignment) =>
                id = "#{@options.uuid}-#{alignment}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"#{alignment}_button\" >#{alignment}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", "justify" + alignment
                button.bind "change", (event) ->
                    justify = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute justify

                queryState = (event) ->
                    if document.queryCommandState "justify" + alignment
                        button.attr "checked", true
                        button.next("label").addClass "ui-state-clicked"
                        button.button "refresh"
                    else
                        button.attr "checked", false
                        button.next("label").removeClass "ui-state-clicked"
                        button.button "refresh"

                element = @element
                element.bind "halloenabled", ->
                    element.bind "keyup paste change mouseup", queryState
                element.bind "hallodisabled", ->
                    element.unbind "keyup paste change mouseup", queryState
            
            buttonize "Left"
            buttonize "Center"
            buttonize "Right"

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)
