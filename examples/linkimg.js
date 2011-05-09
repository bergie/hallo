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
        dialog = jQuery("<div id=\"" + dialogId + "\"><form action=\"#\" method=\"post\"><input class=\"url\" type=\"text\" name=\"url\" size=\"40\" value=\"http://\" /><input type=\"submit\" value=\"Insert\" /></form></div>");
        dialogSubmitCb = function() {
          var link;
          link = $(this).find(".url").val();
          widget.options.editable.replaceSelection(function(text) {
            var html;
            return html = '<a href="' + link + '">' + text + '</a>';
          });
          dialog.dialog('close');
          return false;
        };
        dialog.find("form").submit(dialogSubmitCb);
        buttonset = jQuery("<span></span>");
        buttonize = __bind(function(type) {
          var button, id;
          id = "" + this.options.uuid + "-" + type;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + type + "</label>").button());
          button = jQuery("#" + id, buttonset);
          return button.bind("change", function(event) {
            return dialog.dialog('open');
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
