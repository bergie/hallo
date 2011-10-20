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
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        id = "" + this.options.uuid + "-paragraph";
        label = "P";
        buttonset.append(jQuery("<input id=\"" + id + "\" type=\"radio\" name=\"" + widget.options.uuid + "-headings\"/><label for=\"" + id + "\" class=\"p_button\">" + label + "</label>").button());
        button = jQuery("#" + id, buttonset);
        button.attr("hallo-command", "formatBlock");
        button.bind("change", function(event) {
          var cmd;
          cmd = jQuery(this).attr("hallo-command");
          return widget.options.editable.execute(cmd, "P");
        });
        buttonize = __bind(function(headerSize) {
          label = "H" + headerSize;
          id = "" + this.options.uuid + "-" + headerSize;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"radio\" name=\"" + widget.options.uuid + "-headings\"/><label for=\"" + id + "\" class=\"h" + headerSize + "_button\">" + label + "</label>").button());
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
        this.element.bind("keyup paste change mouseup", function(event) {
          var format, formatNumber, labelParent, selectedButton;
          format = document.queryCommandValue("formatBlock").toUpperCase();
          if (format === '') {
            labelParent = jQuery(buttonset);
            labelParent.children("input").attr("checked", false);
            labelParent.children("label").removeClass("ui-state-clicked");
            labelParent.children("input").button("widget").button("refresh");
            return;
          }
          if (format === "P") {
            selectedButton = jQuery("#" + widget.options.uuid + "-paragraph");
          } else {
            formatNumber = format.match(/\d/)[0];
            selectedButton = jQuery("#" + widget.options.uuid + "-" + formatNumber);
          }
          labelParent = jQuery(buttonset);
          labelParent.children("input").attr("checked", false);
          labelParent.children("label").removeClass("ui-state-clicked");
          labelParent.children("input").button("widget").button("refresh");
          selectedButton.attr("checked", true);
          selectedButton.next("label").addClass("ui-state-clicked");
          return selectedButton.button("refresh");
        });
        return this.options.toolbar.append(buttonset);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
