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
                resizable: false
                draggable: false
            dialog: null

        _create: ->
            widget = this

            dialogId = "#{@options.uuid}-image-dialog"
            @options.dialog = jQuery "<div id=\"#{dialogId}\">
            <div class=\"#{widget.widgetName}-dialognav\">
                <ul class=\"#{widget.widgetName}-tabs\">
                <li id=\"#{@options.uuid}-tab-suggestions\"><img src=\"/bundles/liipvie/img/tabicon_suggestions.png\" /> Suggestions</li>
                <li id=\"#{@options.uuid}-tab-search\"><img src=\"/bundles/liipvie/img/tabicon_search.png\" /> Search</li>
                <li id=\"#{@options.uuid}-tab-upload\"><img src=\"/bundles/liipvie/img/tabicon_upload.png\" /> Upload</li>
                </ul>
                <img src=\"/bundles/liipvie/img/arrow.png\" id=\"#{@options.uuid}-tab-activeIndicator\" class=\"#{widget.widgetName}-tab-activeIndicator\" /></div>
            <div class=\"#{widget.widgetName}-dialogcontent\">
                <div id=\"#{@options.uuid}-tab-suggestions-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-suggestions\">
                    <div>
                        <img src=\"http://imagesus.homeaway.com/mda01/badf2e69babf2f6a0e4b680fc373c041c705b891\" class=\"#{widget.widgetName}-imageThumbnail #{widget.widgetName}-imageThumbnailActive\" />
                        <img src=\"http://www.ngkhai.net/cebupics/albums/userpics/10185/thumb_P1010613.JPG\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://idiotduck.com/wp-content/uploads/2011/03/amazing-nature-photography-waterfall-hdr-1024-768-14-150x200.jpg\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://photos.somd.com/data/14/thumbs/20080604_9-1.JPG\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://www.hotfrog.com.au/Uploads/PressReleases2/THAILAND-TRAVEL-PACKAGES-THAILAND-BEACH-TOURS-THAILAND-VACATION-SUNRISE-PHUKET-BEACH-TOUR-200614_image.jpg\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://photos.somd.com/data/14/thumbs/SunriseMyrtleBeach2008.jpg\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://www.zsqts.com.cn/product-photo/2009-07-17/a411bfd382731251ae26bfb311c30629/Buy-best-buy-fireworks-from-China-Liuyang-SKY-PIONEER-PYROTECHNICS-INC.jpg\" class=\"#{widget.widgetName}-imageThumbnail\" />
                        <img src=\"http://www.costumeattic.com/images_product/preview/Rubies/885106.jpg\" class=\"#{widget.widgetName}-imageThumbnail\" />
                    </div>
                    <div class=\"#{widget.widgetName}-activeImageContainer\">
                        <div class=\"#{widget.widgetName}-activeImageAligner\">
                            <img src=\"\" id=\"#{@options.uuid}-#{widget.widgetName}-activeImageBg\" class=\"#{widget.widgetName}-activeImage #{widget.widgetName}-activeImageBg\" />
                            <img src=\"\" id=\"#{@options.uuid}-#{widget.widgetName}-activeImage\" class=\"#{widget.widgetName}-activeImage\" />
                        </div>
                    </div>
                    <div class=\"#{widget.widgetName}-metadata\">
                        <label for=\"caption\">Caption</label><input type=\"text\" id=\"caption\" />
                        <button id=\"#{@options.uuid}-#{widget.widgetName}-addimage\">Add Image</button>
                    </div>
                </div>
                <div id=\"#{@options.uuid}-tab-search-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-search\">
                    <form action=\"app_dev.php/liip/vie/assets/search/?page=1&length=4\" tpye=\"post\" id=\"search_form\">
                        <input type=\"text\" class=\"searchInput\" /><input type=\"submit\" class=\"searchButton\" value=\"OK\"/>
                    </form>
                    <div class=\"searchResults\">
                        Search results come here!
                    </div>
                    <div class=\"#{widget.widgetName}-activeImageContainer\">
                        <img src=\"\" id=\"#{@options.uuid}-#{widget.widgetName}-activeImage_search\" class=\"#{widget.widgetName}-activeImage\" />
                    </div>
                </div>
                <div id=\"#{@options.uuid}-tab-upload-content\" class=\"#{widget.widgetName}-tab #{widget.widgetName}-tab-upload\">UPLOAD</div>
            </div></div>"
            
            jQuery(@options.dialog).contents().find('#search_form').submit (event) ->
                that = @
                jQuery.ajax({
                    type: "GET",
                    url: "/app_dev.php/liip/vie/assets/search/",
                    data: "page=1&length=4&searchString=2",
                    success: (response) ->
                        items = Array()
                        $.each response.assets, (key, val) ->
                            items.push("<img src=\"#{val.url}\" class=\"search_result_image #{widget.widgetName}-imageThumbnail\" />");
                        jQuery(that).parents().contents().find('.searchResults').html(items.join(''))

                        # Add action to image thumbnails
                        jQuery(".#{widget.widgetName}-imageThumbnail").live "click", (event) ->
                            jQuery(".#{widget.widgetName}-imageThumbnail").removeClass "#{widget.widgetName}-imageThumbnailActive"
                            jQuery(this).addClass "#{widget.widgetName}-imageThumbnailActive"
                            jQuery("##{widget.options.uuid}-#{widget.widgetName}-activeImage_search").attr "src", jQuery(this).attr "src"
                })
                event.preventDefault()

            insertImage = () ->
                #This may need to insert an image that does not have the same URL as the preview image, since it may be a different size

                # Check if we have a selection and fall back to @lastSelection otherwise
                try
                    if not widget.options.editable.getSelection()
                        throw new Error "SelectionNotSet"
                catch error
                    widget.options.editable.restoreSelection(widget.lastSelection)

                document.execCommand "insertImage", null, $(".halloimage-activeImage").attr('src')
                img = document.getSelection().anchorNode.firstChild
                jQuery(img).attr "alt", jQuery(".caption").value

                triggerModified = () ->
                    widget.element.trigger "hallomodified"
                window.setTimeout triggerModified, 100
                widget._closeDialog()

            @options.dialog.find(".halloimage-activeImage, ##{widget.options.uuid}-#{widget.widgetName}-addimage").click insertImage

            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"

            id = "#{@options.uuid}-image"
            buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"image_button\" >Image</label>").button()
            buttonset.children("label").unbind('mouseout')
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

            # Add action to image thumbnails
            jQuery(".#{widget.widgetName}-imageThumbnail").live "click", (event) ->
                jQuery(".#{widget.widgetName}-imageThumbnail").removeClass "#{widget.widgetName}-imageThumbnailActive"
                jQuery(this).addClass "#{widget.widgetName}-imageThumbnailActive"

                jQuery(".#{widget.widgetName}-activeImage").attr "src", jQuery(this).attr "src"



            buttonset.buttonset()
            @options.toolbar.append buttonset
            @options.dialog.dialog(@options.dialogOpts)

        _init: ->

        _openDialog: ->
            jQuery('.image_button').addClass('ui-state-active')

            # Update active Image
            jQuery(".#{@widgetName}-activeImage").attr "src", jQuery(".#{@widgetName}-imageThumbnailActive").first().attr "src"

            # Save current caret point
            @lastSelection = @options.editable.getSelection()

            # Position correctly
            xposition = jQuery(@options.editable.element).offset().left + jQuery(@options.editable.element).outerWidth() - 3 # 3 is the border width of the contenteditable border
            yposition = jQuery(@options.toolbar).offset().top - jQuery(document).scrollTop() - 29
            @options.dialog.dialog("option", "position", [xposition, yposition])
            @options.dialog.dialog("open")

        _closeDialog: ->
            jQuery('.image_button').removeClass('ui-state-active')
            @options.dialog.dialog("close")

)(jQuery)
