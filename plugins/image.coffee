#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloimage",
        options:
            editable: null
            toolbar: null
            uuid: ""
            dialogOpts:
                autoOpen: false
                width: 270
                height: 500
                title: "Insert Images"
                modal: false
                resizeable: false
                draggable: false
            dialog: null

        _create: ->
            widget = this

            dialogId = "#{@options.uuid}-image-dialog"
            @options.dialog = jQuery "<div id=\"#{dialogId}\"><div class=\"#{widget.widgetName}-dialognav\">Suggestions | Search | Upload</div><div class=\"#{widget.widgetName}-dialogcontent\"><img src=\"http://www.wordtravels.com/dbpics/countries/Florida/Pensacola_Beach.jpg\" class=\"#{widget.widgetName}-activeimage\" /></div></div>"

            insertImage = () ->
                #This may need to insert an image that does not have the same URL as the preview image, since it may be a different size
                document.execCommand "insertImage", null, $(this).attr('src')
                widget._closeDialog()

            @options.dialog.find(".halloimage-activeimage").click insertImage

            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"

            id = "#{@options.uuid}-image"
            buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"image_button\" >Image</label>").button()
            button = jQuery "##{id}", buttonset
            button.bind "change", (event) ->
                if widget.options.dialog.dialog "isOpen"
                    widget._closeDialog()
                else
                    widget._openDialog()

            @options.editable.element.bind "hallodeactivated", (event) ->
                widget._closeDialog()

            jQuery(@options.editable.element).delegate "img", "click", (event) ->
                widget._openDialog()

            buttonset.buttonset()
            @options.toolbar.append buttonset
            @options.dialog.dialog(@options.dialogOpts)

        _init: ->

        _openDialog: ->
            xposition = jQuery(@options.editable.element).offset().left + jQuery(@options.editable.element).outerWidth()
            yposition = jQuery(@options.toolbar).offset().top - jQuery(document).scrollTop() - 60

            @options.dialog.dialog("option", "position", [xposition, yposition])
            @options.dialog.dialog("open")

        _closeDialog: ->
            @options.dialog.dialog("close")


)(jQuery)