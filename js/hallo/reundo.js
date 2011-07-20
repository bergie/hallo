(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.halloreundo", {
      options: {
        editable: null,
        toolbar: null,
        uuid: ""
      },
      _create: function() {
        var buttonize, buttonset, widget;
        widget = this;
        buttonset = jQuery("<span></span>");
        buttonize = __bind(function(cmd, label) {
          var button, id;
          id = "" + this.options.uuid + "-" + cmd;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", cmd);
          return button.bind("change", function(event) {
            cmd = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(cmd);
          });
        }, this);
        buttonize("undo", "Undo");
        buttonize("redo", "Redo");
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
