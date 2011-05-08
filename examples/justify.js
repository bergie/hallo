(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.hallojustify", {
      options: {
        editable: null,
        toolbar: null,
        uuid: ""
      },
      _create: function() {
        var buttonize, buttonset, widget;
        widget = this;
        buttonset = jQuery("<span></span>");
        buttonize = __bind(function(alignment) {
          var button, id;
          id = "" + this.options.uuid + "-" + alignment;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + alignment + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", "justify" + alignment);
          return button.bind("change", function(event) {
            var cmd;
            cmd = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(cmd);
          });
        }, this);
        buttonize("Left");
        buttonize("Center");
        buttonize("Right");
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
