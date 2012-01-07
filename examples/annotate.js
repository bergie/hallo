(function() {

  (function(jQuery) {
    var z;
    z = new VIE;
    z.use(new z.StanbolService({
      proxyDisabled: true,
      url: "http://dev.iks-project.eu:8081"
    }));
    return jQuery.widget("IKS.halloannotate", {
      options: {
        vie: z,
        editable: null,
        toolbar: null
      },
      _create: function() {
        var buttonize, buttonset, widget,
          _this = this;
        widget = this;
        widget.buttons = {};
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(cmd, label) {
          var button, id;
          id = "" + _this.options.uuid + "-" + cmd;
          buttonset.append(jQuery("<input id=\"" + id + "\" type=\"checkbox\" /><label for=\"" + id + "\">" + label + "</label>").button());
          button = jQuery("#" + id, buttonset);
          button.attr("hallo-command", cmd);
          button.bind("change", function(event) {
            cmd = jQuery(this).attr("hallo-command");
            return widget[cmd]();
          });
          return widget.buttons[cmd] = button;
        };
        buttonize("enhance", "Enhance");
        buttonize("done", "Done");
        buttonize("acceptAll", "Accept all");
        buttonset.buttonset();
        this.options.toolbar.append(buttonset);
        return this.instantiate();
      },
      instantiate: function() {
        this.options.editable.element.annotate({
          vie: this.options.vie,
          debug: true,
          showTooltip: true
        });
        return this.buttons.acceptAll.hide();
      },
      acceptAll: function() {
        this.options.editable.element.each(function() {
          return jQuery(this).annotate("acceptAll", function(report) {
            return console.log("AcceptAll finished with the report:", report);
          });
        });
        return this.buttons.acceptAll.button("disable");
      },
      enhance: function() {
        var origLabel, widget,
          _this = this;
        widget = this;
        console.info(".content", this.options.editable.element);
        origLabel = this.buttons.enhance.button("disable").button("option", "label");
        this.buttons.enhance.button("disable").button("option", "label", "in progress...");
        try {
          return this.options.editable.element.annotate("enable", function(success) {
            if (success) {
              _this.buttons.enhance.button("disable").button("option", "label", origLabel);
              _this.buttons.enhance.enable().hide();
              _this.buttons.done.show();
              return _this.buttons.acceptAll.show();
            } else {
              return _this.buttons.enhance.show().button("enable").button("option", "label", "error, see the log.. Try to enhance again!");
            }
          });
        } catch (e) {
          return alert(e);
        }
      },
      done: function() {
        this.options.editable.element.annotate("disable");
        this.buttons.enhance.show().button("option", "label", "Enhance!");
        return jQuery(".acceptAllButton").hide();
      }
    });
  })(jQuery);

}).call(this);
