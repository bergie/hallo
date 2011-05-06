(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloformat", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        formattings: ["bold", "italic"]
      },
      _create: function() {
        var button, buttonset, format, id, label, widget, _i, _len, _ref;
        widget = this;
        buttonset = jQuery("<span></span>");
        _ref = this.options.formattings;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          format = _ref[_i];
          label = format.substr(0, 1).toUpperCase();
          id = "" + this.options.uuid + "-" + format;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", format);
          button.bind("change", function(event) {
            format = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(format);
          });
        }
        buttonset.buttonset();
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
