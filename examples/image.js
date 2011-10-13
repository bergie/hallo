(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloimage", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        dialogOpts: {
          autoOpen: false,
          width: 270,
          height: 500,
          title: "Insert Images",
          modal: false,
          resizeable: false,
          draggable: false
        },
        dialog: null
      },
      _create: function() {
        var button, buttonset, dialogId, id, insertImage, widget;
        widget = this;
        dialogId = "" + this.options.uuid + "-image-dialog";
        this.options.dialog = jQuery("<div id=\"" + dialogId + "\"><div class=\"" + widget.widgetName + "-dialognav\"><ul class=\"" + widget.widgetName + "-tabs\"><li id=\"" + this.options.uuid + "-tab-suggestions\"><img src=\"/bundles/liipvie/img/tabicon_suggestions.png\" /> Suggestions</li><li id=\"" + this.options.uuid + "-tab-search\"><img src=\"/bundles/liipvie/img/tabicon_search.png\" /> Search</li><li id=\"" + this.options.uuid + "-tab-upload\"><img src=\"/bundles/liipvie/img/tabicon_upload.png\" /> Upload</li></ul><img src=\"/bundles/liipvie/img/arrow.png\" id=\"" + this.options.uuid + "-tab-activeIndicator\" class=\"" + widget.widgetName + "-tab-activeIndicator\" /></div><div class=\"" + widget.widgetName + "-dialogcontent\"><div id=\"" + this.options.uuid + "-tab-suggestions-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-suggestions\"><img src=\"http://www.wordtravels.com/dbpics/countries/Florida/Pensacola_Beach.jpg\" class=\"" + widget.widgetName + "-activeimage\" /></div><div id=\"" + this.options.uuid + "-tab-search-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-search\">SEARCH</div><div id=\"" + this.options.uuid + "-tab-upload-content\" class=\"" + widget.widgetName + "-tab " + widget.widgetName + "-tab-upload\">UPLOAD</div></div></div>");
        insertImage = function() {
          document.execCommand("insertImage", null, $(this).attr('src'));
          return widget._closeDialog();
        };
        this.options.dialog.find(".halloimage-activeimage").click(insertImage);
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
        buttonset.buttonset();
        this.options.toolbar.append(buttonset);
        return this.options.dialog.dialog(this.options.dialogOpts);
      },
      _init: function() {},
      _openDialog: function() {
        var xposition, yposition;
        xposition = jQuery(this.options.editable.element).offset().left + jQuery(this.options.editable.element).outerWidth();
        yposition = jQuery(this.options.toolbar).offset().top - jQuery(document).scrollTop() - 20;
        this.options.dialog.dialog("option", "position", [xposition, yposition]);
        return this.options.dialog.dialog("open");
      },
      _closeDialog: function() {
        return this.options.dialog.dialog("close");
      }
    });
  })(jQuery);
}).call(this);
