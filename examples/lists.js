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
        buttonset = jQuery("<span></span>");
        buttonize = __bind(function(type, label) {
          var button, id;
          id = "" + this.options.uuid + "-" + type;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", "insert" + type + "List");
          return button.bind("change", function(event) {
            var cmd;
            cmd = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(cmd);
          });
        }, this);
        buttonize("Ordered", "OL");
        buttonize("Unordered", "UL");
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
