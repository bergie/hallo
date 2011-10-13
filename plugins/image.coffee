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
            @options.dialog = jQuery "<div id=\"#{dialogId}\"><div class=\"#{widget.widgetName}-dialognav\"><ul class=\"#{widget.widgetName}-tabs\"><li id=\"#{@options.uuid}-tab-suggestions\"><img src=\"/bundles/liipvie/img/tabicon_suggestions.png\" /> Suggestions</li><li id=\"#{@options.uuid}-tab-search\"><img src=\"/bundles/liipvie/img/tabicon_search.png\" /> Search</li><li id=\"#{@options.uuid}-tab-upload\"><img src=\"/bundles/liipvie/img/tabicon_upload.png\" /> Upload</li></ul><img src=\"/bundles/liipvie/img/arrow.png\" id=\"#{@options.uuid}-tab-activeIndicator\" class=\"#{widget.widgetName}-tab-activeIndicator\" /></div><div class=\"#{widget.widgetName}-dialogcontent\"><div id=\"#{@options.uuid}-tab-suggestions-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-suggestions\"><img src=\"http://www.wordtravels.com/dbpics/countries/Florida/Pensacola_Beach.jpg\" class=\"#{widget.widgetName}-activeimage\" /></div><div id=\"#{@options.uuid}-tab-search-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-search\">SEARCH</div><div id=\"#{@options.uuid}-tab-upload-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-upload\">UPLOAD</div></div></div>"

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

            jQuery(@options.dialog).find(".halloimage-dialognav li").click () ->
                jQuery(".#{widget.widgetName}-tab").each () ->
                    jQuery(this).hide()

                id = jQuery(this).attr("id")
                jQuery("##{id}-content").show()
                jQuery("##{widget.options.uuid}-tab-activeIndicator").css("margin-left", jQuery(this).position().left + (jQuery(this).width()/2))

            buttonset.buttonset()
            @options.toolbar.append buttonset
            @options.dialog.dialog(@options.dialogOpts)

        _init: ->

        _openDialog: ->
            xposition = jQuery(@options.editable.element).offset().left + jQuery(@options.editable.element).outerWidth()
            yposition = jQuery(@options.toolbar).offset().top - jQuery(document).scrollTop() - 20

            @options.dialog.dialog("option", "position", [xposition, yposition])
            @options.dialog.dialog("open")

        _closeDialog: ->
            @options.dialog.dialog("close")


)(jQuery)