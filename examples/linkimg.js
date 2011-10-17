(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.hallolinkimg", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        link: true,
        image: true,
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 120,
          title: "Enter Link",
          modal: true
        }
      },
      _create: function() {
        var buttonize, buttonset, dialog, dialogId, dialogSubmitCb, widget;
        widget = this;
        dialogId = "" + this.options.uuid + "-dialog";
        dialog = jQuery("<div id=\"" + dialogId + "\"><form action=\"#\" method=\"post\" class=\"linkForm\"><input class=\"url\" type=\"text\" name=\"url\" size=\"40\" value=\"http://\" /><input type=\"submit\" value=\"Insert\" /></form></div>");
        dialogSubmitCb = function() {
          var link;
          link = $(this).find(".url").val();
          widget.options.editable.restoreSelection(widget.lastSelection);
          if (widget.lastSelection.startContainer.parentNode.href === void 0) {
            document.execCommand("createLink", null, link);
          } else {
            widget.lastSelection.startContainer.parentNode.href = link;
          }
          widget.options.editable.removeAllSelections();
          dialog.dialog('close');
          return false;
        };
        dialog.find("form").submit(dialogSubmitCb);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = __bind(function(type) {
          var button, id;
          id = "" + this.options.uuid + "-" + type;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\" class=\"anchor_button\" >" + type + "</label>").button());
          buttonset.children("label").unbind('mouseout');
          button = jQuery("#" + id, buttonset);
          button.bind("change", function(event) {
            widget.lastSelection = widget.options.editable.getSelection();
            if (widget.lastSelection.startContainer.parentNode.href === null) {
              jQuery(dialog).children().children(".url").val("http://");
            } else {
              jQuery(dialog).children().children(".url").val(widget.lastSelection.startContainer.parentNode.href);
            }
            return dialog.dialog('open');
          });
          return this.element.bind("keyup paste change mouseup", function(event) {
            if (jQuery(event.target)[0].nodeName === "A") {
              button.attr("checked", true);
              button.next().addClass("ui-state-active");
              return button.button("refresh");
            } else {
              button.attr("checked", false);
              button.next().removeClass("ui-state-active");
              return button.button("refresh");
            }
          });
        }, this);
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          buttonset.buttonset();
          this.options.toolbar.append(buttonset);
          return dialog.dialog(this.options.dialogOpts);
        }
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
