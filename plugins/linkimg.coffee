#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolinkimg",
        options:
            editable: null
            toolbar: null
            uuid: ""
            link: true
            image: true
            dialogOpts:
                autoOpen: false
                width: 540
                height: 120
                title: "Enter Link"
                modal: true

        _create: ->
            widget = this

            dialogId = "#{@options.uuid}-dialog"
            dialog = jQuery "<div id=\"#{dialogId}\"><form action=\"#\" method=\"post\" class=\"linkForm\"><input class=\"url\" type=\"text\" name=\"url\" size=\"40\" value=\"http://\" /><input type=\"submit\" value=\"Insert\" /></form></div>"
            dialogSubmitCb = () ->
                link = $(this).find(".url").val()
                widget.options.editable.restoreSelection(widget.lastSelection)
                if widget.lastSelection.startContainer.parentNode.href is undefined
                    document.execCommand "createLink", null, link
                else
                    widget.lastSelection.startContainer.parentNode.href = link
                widget.options.editable.removeAllSelections()
                dialog.dialog('close')
                return false
            dialog.find("form").submit dialogSubmitCb

            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (type) =>
                id = "#{@options.uuid}-#{type}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"anchor_button\" >#{type}</label>").button()
                buttonset.children("label").unbind('mouseout')
                button = jQuery "##{id}", buttonset
                button.bind "change", (event) ->
                    # we need to save the current selection because we will loose focus
                    widget.lastSelection = widget.options.editable.getSelection()
                    if widget.lastSelection.startContainer.parentNode.href is null
                        jQuery(dialog).children().children(".url").val("http://")
                    else
                        jQuery(dialog).children().children(".url").val(widget.lastSelection.startContainer.parentNode.href)
                    dialog.dialog('open')

                @element.bind "keyup paste change mouseup", (event) ->
                    if jQuery(event.target)[0].nodeName is "A"
                        button.attr "checked", true
                        button.next().addClass "ui-state-active"
                        button.button "refresh"
                    else
                        button.attr "checked", false
                        button.next().removeClass "ui-state-active"
                        button.button "refresh"

            if (@options.link)
                buttonize "A"

            if (@options.link)
                buttonset.buttonset()
                @options.toolbar.append buttonset
                dialog.dialog(@options.dialogOpts)

        _init: ->

)(jQuery)