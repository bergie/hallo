(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloformat", {
      options: {
        editable: null,
        toolbar: null,
        formattings: ["bold", "italic"]
      },
      _create: function() {
        var button, format, widget, _i, _len, _ref, _results;
        widget = this;
        _ref = this.options.formattings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          format = _ref[_i];
          button = jQuery("<button>" + format + "</button>").button();
          button.attr("hallo-command", format);
          button.click(function() {
            format = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(format);
          });
          _results.push(this.options.toolbar.append(button));
        }
        return _results;
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
