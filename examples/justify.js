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
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = __bind(function(alignment) {
          var button, id;
          id = "" + this.options.uuid + "-" + alignment;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\" class=\"" + alignment + "_button\" >" + alignment + "</label>").button());
          buttonset.children("label").unbind('mouseout');
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", "justify" + alignment);
          button.bind("change", function(event) {
            var justify;
            justify = jQuery(this).attr("hallo-command");
            return widget.options.editable.execute(justify);
          });
          return this.element.bind("keyup paste change mouseup", function(event) {
            if (document.queryCommandState("justify" + alignment)) {
              button.attr("checked", true);
              return button.button("refresh");
            } else {
              button.attr("checked", false);
              return button.button("refresh");
            }
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
