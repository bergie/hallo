(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      toolbar: null,
      bound: false,
      options: {
        editable: true,
        plugins: {},
        activated: function() {},
        deactivated: function() {}
      },
      _create: function() {
        var options, plugin, _ref, _results;
        this._prepareToolbar();
        _ref = this.options.plugins;
        _results = [];
        for (plugin in _ref) {
          options = _ref[plugin];
          if (!jQuery.isPlainObject(options)) {
            options = {};
          }
          options["editable"] = this;
          options["toolbar"] = this.toolbar;
          _results.push(jQuery(this.element)[plugin](options));
        }
        return _results;
      },
      _init: function() {
        this.element.attr("contentEditable", this.options.editable);
        if (this.options.editable) {
          if (!this.bound) {
            this.element.bind("focus", this, this.activated);
            this.element.bind("blur", this, this.deactivated);
            return this.bound = true;
          }
        } else {
          this.element.unbind("focus", this.activated);
          this.element.unbind("blur", this.deactivated);
          return this.bound = false;
        }
      },
      _prepareToolbar: function() {
        this.toolbar = jQuery('<div></div>').hide();
        this.toolbar.css("position", "absolute");
        this.toolbar.css("top", this.element.offset().top - 20);
        this.toolbar.css("left", this.element.offset().left);
        return jQuery('body').append(this.toolbar);
      },
      activated: function(event) {
        var widget;
        widget = event.data;
        if (widget.toolbar.html() !== "") {
          widget.toolbar.css("top", widget.element.offset().top - widget.toolbar.height());
          widget.toolbar.show();
        }
        return widget._trigger("activated", event);
      },
      deactivated: function(event) {
        var widget;
        widget = event.data;
        window.setTimeout(function() {
          return widget.toolbar.hide();
        }, 200);
        return widget._trigger("deactivated", event);
      },
      execute: function(command) {
        document.execCommand(command, false, null);
        return this.element.focus();
      }
    });
  })(jQuery);
}).call(this);
