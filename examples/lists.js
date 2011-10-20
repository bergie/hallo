(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.hallolists", {
      options: {
        editable: null,
        toolbar: null,
        uuid: ""
      },
      _create: function() {
        var buttonize, buttonset, widget;
        widget = this;
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = __bind(function(type, label) {
          var button, id;
          id = "" + this.options.uuid + "-" + type;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\" class=\"" + type + "_button\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", "insert" + type + "List");
          button.bind("change", function(event) {
            var list;
            list = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(list);
          });
          return this.element.bind("keyup paste change mouseup", function(event) {
            if (document.queryCommandState("insert" + type + "List")) {
              button.attr("checked", true);
              button.next("label").addClass("ui-state-clicked");
              return button.button("refresh");
            } else {
              button.attr("checked", false);
              button.next("label").removeClass("ui-state-clicked");
              return button.button("refresh");
            }
          });
        }, this);
        buttonize("Unordered", "UL");
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
