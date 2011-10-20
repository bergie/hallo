(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloimage", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        searchUrl: "liip/vie/assets/search",
        dialogOpts: {
          autoOpen: false,
          width: 270,
          height: 500,
          title: "Insert Images",
          modal: false,
          resizable: false,
          draggable: true,
          close: function(ev, ui) {
            return jQuery('.image_button').removeClass('ui-state-clicked');
          }
        },
        dialog: null
      },
      _create: function() {
        var button, buttonset, dialogId, id, insertImage, widget;
        widget = this;
        dialogId = "" + this.options.uuid + "-image-dialog";
        this.options.dialog = jQuery("<div id=\"" + dialogId + "\">            <div class=\"" + widget.widgetName + "-dialognav\">                <ul class=\"" + widget.widgetName + "-tabs\">                <li id=\"" + this.options.uuid + "-tab-suggestions\"><img src=\"/bundles/liipvie/img/tabicon_suggestions.png\" /> Suggestions</li>                <li id=\"" + this.options.uuid + "-tab-search\"><img src=\"/bundles/liipvie/img/tabicon_search.png\" /> Search</li>                <li id=\"" + this.options.uuid + "-tab-upload\"><img src=\"/bundles/liipvie/img/tabicon_upload.png\" /> Upload</li>                </ul>                <img src=\"/bundles/liipvie/img/arrow.png\" id=\"" + this.options.uuid + "-tab-activeIndicator\" class=\"" + widget.widgetName + "-tab-activeIndicator\" /></div>            <div class=\"" + widget.widgetName + "-dialogcontent\">                <div id=\"" + this.options.uuid + "-tab-suggestions-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-suggestions\">                    <div>                        <img src=\"http://imagesus.homeaway.com/mda01/badf2e69babf2f6a0e4b680fc373c041c705b891\" class=\"" + widget.widgetName + "-imageThumbnail " + widget.widgetName + "-imageThumbnailActive\" />                        <img src=\"http://www.ngkhai.net/cebupics/albums/userpics/10185/thumb_P1010613.JPG\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://idiotduck.com/wp-content/uploads/2011/03/amazing-nature-photography-waterfall-hdr-1024-768-14-150x200.jpg\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://photos.somd.com/data/14/thumbs/20080604_9-1.JPG\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://www.hotfrog.com.au/Uploads/PressReleases2/THAILAND-TRAVEL-PACKAGES-THAILAND-BEACH-TOURS-THAILAND-VACATION-SUNRISE-PHUKET-BEACH-TOUR-200614_image.jpg\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://photos.somd.com/data/14/thumbs/SunriseMyrtleBeach2008.jpg\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://www.zsqts.com.cn/product-photo/2009-07-17/a411bfd382731251ae26bfb311c30629/Buy-best-buy-fireworks-from-China-Liuyang-SKY-PIONEER-PYROTECHNICS-INC.jpg\" class=\"" + widget.widgetName + "-imageThumbnail\" />                        <img src=\"http://www.costumeattic.com/images_product/preview/Rubies/885106.jpg\" class=\"" + widget.widgetName + "-imageThumbnail\" />                    </div>                    <div class=\"" + widget.widgetName + "-activeImageContainer\">                        <div class=\"" + widget.widgetName + "-activeImageAligner\">                            <img src=\"\" id=\"" + this.options.uuid + "-" + widget.widgetName + "-sugg-activeImageBg\" class=\"" + widget.widgetName + "-activeImage " + widget.widgetName + "-activeImageBg\" />                            <img src=\"\" id=\"" + this.options.uuid + "-" + widget.widgetName + "-sugg-activeImage\" class=\"" + widget.widgetName + "-activeImage\" />                        </div>                    </div>                    <div class=\"" + widget.widgetName + "-metadata\">                        <label for=\"caption\">Caption</label><input type=\"text\" id=\"caption\" />                        <button id=\"" + this.options.uuid + "-" + widget.widgetName + "-addimage\">Add Image</button>                    </div>                </div>                <div id=\"" + this.options.uuid + "-tab-search-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-search\">                    <form action=\"" + widget.options.searchUrl + "/?page=1&length=4\" type=\"post\" id=\"search_form\">                        <input type=\"text\" class=\"searchInput\" /><input type=\"submit\" id=\"searchButton\" class=\"searchButton\" value=\"OK\"/>                    </form>                    <div class=\"searchResults\">                        Search results come here!                    </div>                    <div id=\"" + this.options.uuid + "-" + widget.widgetName + "-search-activeImageContainer\" class=\"" + widget.widgetName + "-search-activeImageContainer " + widget.widgetName + "-activeImageContainer\">                        <div class=\"" + widget.widgetName + "-activeImageAligner\">                            <img src=\"\" id=\"" + this.options.uuid + "-" + widget.widgetName + "-search-activeImageBg\" class=\"" + widget.widgetName + "-activeImage " + widget.widgetName + "-activeImageBg\" />                            <img src=\"\" id=\"" + this.options.uuid + "-" + widget.widgetName + "-search-activeImage\" class=\"" + widget.widgetName + "-activeImage\" />                        </div>                    </div>                </div>                <div id=\"" + this.options.uuid + "-tab-upload-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-upload\">UPLOAD</div>            </div></div>");
        jQuery(this.options.dialog).contents().find('#search_form').submit(function(event) {
          var that;
          that = this;
          jQuery.ajax({
            type: "GET",
            url: widget.options.searchUrl,
            data: "page=1&length=4&searchString=2",
            success: function(response) {
              var firstimage, items;
              items = Array();
              $.each(response.assets, function(key, val) {
                return items.push("<img src=\"" + val.url + "\" class=\"search_result_image " + widget.widgetName + "-imageThumbnail " + widget.widgetName + "-search-imageThumbnail\" /> ");
              });
              jQuery(that).parents().contents().find('.searchResults').html(items.join(''));
              jQuery("#" + widget.options.uuid + "-" + widget.widgetName + "-search-activeImageContainer").show();
              firstimage = jQuery("." + widget.widgetName + "-search-imageThumbnail").first();
              firstimage.addClass("" + widget.widgetName + "-imageThumbnailActive");
              return jQuery("#" + widget.options.uuid + "-" + widget.widgetName + "-search-activeImage, #" + widget.options.uuid + "-" + widget.widgetName + "-search-activeImageBg").attr("src", firstimage.attr("src"));
            }
          });
          return event.preventDefault();
        });
        insertImage = function() {
          var img, triggerModified;
          try {
            if (!widget.options.editable.getSelection()) {
              throw new Error("SelectionNotSet");
            }
          } catch (error) {
            widget.options.editable.restoreSelection(widget.lastSelection);
          }
          document.execCommand("insertImage", null, $(this).attr('src'));
          img = document.getSelection().anchorNode.firstChild;
          jQuery(img).attr("alt", jQuery(".caption").value);
          triggerModified = function() {
            return widget.element.trigger("hallomodified");
          };
          window.setTimeout(triggerModified, 100);
          return widget._closeDialog();
        };
        this.options.dialog.find(".halloimage-activeImage, #" + widget.options.uuid + "-" + widget.widgetName + "-addimage").click(insertImage);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        id = "" + this.options.uuid + "-image";
        buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\" class=\"image_button\" >Image</label>").button());
        button = jQuery("#" + id, buttonset);
        button.bind("change", function(event) {
          if (widget.options.dialog.dialog("isOpen")) {
            return widget._closeDialog();
          } else {
            return widget._openDialog();
          }
        });
        this.options.editable.element.bind("hallodeactivated", function(event) {
          return widget._closeDialog();
        });
        jQuery(this.options.editable.element).delegate("img", "click", function(event) {
          return widget._openDialog();
        });
        jQuery(this.options.dialog).find(".halloimage-dialognav li").click(function() {
          jQuery("." + widget.widgetName + "-tab").each(function() {
            return jQuery(this).hide();
          });
          id = jQuery(this).attr("id");
          jQuery("#" + id + "-content").show();
          return jQuery("#" + widget.options.uuid + "-tab-activeIndicator").css("margin-left", jQuery(this).position().left + (jQuery(this).width() / 2));
        });
        jQuery("." + widget.widgetName + "-imageThumbnail").live("click", function(event) {
          var scope;
          scope = jQuery(this).closest("." + widget.widgetName + "-tab");
          jQuery("." + widget.widgetName + "-imageThumbnail", scope).removeClass("" + widget.widgetName + "-imageThumbnailActive");
          jQuery(this).addClass("" + widget.widgetName + "-imageThumbnailActive");
          return jQuery("." + widget.widgetName + "-activeImage", scope).attr("src", jQuery(this).attr("src"));
        });
        buttonset.buttonset();
        this.options.toolbar.append(buttonset);
        return this.options.dialog.dialog(this.options.dialogOpts);
      },
      _init: function() {},
      _openDialog: function() {
        var xposition, yposition;
        jQuery('.image_button').addClass('ui-state-clicked');
        jQuery("#" + this.options.uuid + "-" + this.widgetName + "-sugg-activeImage").attr("src", jQuery("." + this.widgetName + "-imageThumbnailActive").first().attr("src"));
        this.lastSelection = this.options.editable.getSelection();
        xposition = jQuery(this.options.editable.element).offset().left + jQuery(this.options.editable.element).outerWidth() - 3;
        yposition = jQuery(this.options.toolbar).offset().top - jQuery(document).scrollTop() - 29;
        this.options.dialog.dialog("option", "position", [xposition, yposition]);
        return this.options.dialog.dialog("open");
      },
      _closeDialog: function() {
        return this.options.dialog.dialog("close");
      }
    });
  })(jQuery);
}).call(this);
