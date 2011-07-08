(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.halloheadings", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        headers: [1, 2, 3]
      },
      _create: function() {
        var button, buttonize, buttonset, header, id, label, widget, _i, _len, _ref;
        widget = this;
        buttonset = jQuery("<span></span>");
        id = "" + this.options.uuid + "-#paragraph";
        label = "P";
        buttonset.append(jQuery("<input id=\"" + id + "\" type=\"radio\" /><label for=\"" + id + "\">" + label + "</label>").button());
        button = jQuery("#" + id, buttonset);
        button.attr("hallo-command", "removeFormat");
        button.bind("change", function(event) {
          var cmd;
          cmd = jQuery(this).attr("hallo-command");
          alert(cmd);
          return widget.options.editable.execute(cmd);
        });
        buttonize = __bind(function(headerSize) {
          label = "H" + headerSize;
          id = "" + this.options.uuid + "-" + headerSize;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"radio\" /><label for=\"" + id + "\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-size", "H" + headerSize);
          return button.bind("change", function(event) {
            var size;
            size = jQuery(this).attr("hallo-size");
            return widget.options.editable.execute("formatBlock", size);
          });
        }, this);
        _ref = this.options.headers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          header = _ref[_i];
          buttonize(header);
        }
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
