#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolists",
        options:
            editable: null
            toolbar: null
            uuid: ""
            lists: 
                ordered: true
                unordered: true

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (type, label) =>
                id = "#{@options.uuid}-#{type}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"#{type}_button\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", "insert" + type + "List"
                button.bind "change", (event) ->
                    list = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute list

                queryState = (event) ->
                    if document.queryCommandState "insert" + type + "List"
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

            buttonize "Ordered", "OL" if @options.lists.ordered
            buttonize "Unordered", "UL" if @options.lists.unordered

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)
