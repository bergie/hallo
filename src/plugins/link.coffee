#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolink",
        options:
            editable: null
            toolbar: null
            uuid: ""
            link: true
            image: true
            defaultUrl: 'http://'
            dialogOpts:
                autoOpen: false
                width: 540
                height: 95
                title: "Enter Link"
                modal: true
                resizable: false
                draggable: false
                dialogClass: 'hallolink-dialog'

        _create: ->
            widget = this

            dialogId = "#{@options.uuid}-dialog"
            dialog = jQuery "<div id=\"#{dialogId}\"><form action=\"#\" method=\"post\" class=\"linkForm\"><input class=\"url\" type=\"text\" name=\"url\" value=\"#{@options.defaultUrl}\" /><input type=\"submit\" id=\"addlinkButton\" value=\"Insert\" /></form></div>"
            urlInput = jQuery('input[name=url]', dialog).focus (e)->
                this.select()
            dialogSubmitCb = () ->
                link = urlInput.val()
                widget.options.editable.restoreSelection(widget.lastSelection)
                if ((new RegExp(/^\s*$/)).test link) or link is widget.options.defaultUrl
                    # link is empty, remove it. Make sure the link is selected
                    if widget.lastSelection.collapsed
                        widget.lastSelection.setStartBefore(widget.lastSelection.startContainer)
                        widget.lastSelection.setEndAfter(widget.lastSelection.startContainer)
                        window.getSelection().addRange(widget.lastSelection);
                    document.execCommand "unlink", null, ""
                else
                    if widget.lastSelection.startContainer.parentNode.href is undefined
                        document.execCommand "createLink", null, link
                    else
                        widget.lastSelection.startContainer.parentNode.href = link
                widget.options.editable.element.trigger('change')
                widget.options.editable.removeAllSelections()
                dialog.dialog('close')
                return false

            dialog.find("form").submit dialogSubmitCb

            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (type) =>
                id = "#{@options.uuid}-#{type}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"btn anchor_button\" ><i class=\"icon-bookmark\"></i></label>").button()
                button = jQuery "##{id}", buttonset
                button.bind "change", (event) ->
                    # we need to save the current selection because we will lose focus
                    widget.lastSelection = widget.options.editable.getSelection()
                    urlInput = jQuery('input[name=url]', dialog);
                    if widget.lastSelection.startContainer.parentNode.href is undefined
                        urlInput.val(widget.options.defaultUrl)
                    else
                        urlInput.val(jQuery(widget.lastSelection.startContainer.parentNode).attr('href'))
                        jQuery(urlInput[0].form).find('input[type=submit]').val('update')
                    dialog.dialog('open')
                    widget.options.editable.protectFocusFrom dialog

                @element.bind "keyup paste change mouseup", (event) ->
                    start = jQuery(widget.options.editable.getSelection().startContainer)
                    nodeName = if start.prop('nodeName') then start.prop('nodeName') else start.parent().prop('nodeName')
                    if nodeName and nodeName.toUpperCase() is "A"
                        button.attr "checked", true
                        button.next().addClass "ui-state-clicked"
                        button.button "refresh"
                    else
                        button.attr "checked", false
                        button.next().removeClass "ui-state-clicked"
                        button.button "refresh"

            if (@options.link)
                buttonize "A"

            if (@options.link)
                buttonset.buttonset()
                @options.toolbar.append buttonset
                dialog.dialog(@options.dialogOpts)

        _init: ->

)(jQuery)
