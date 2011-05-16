(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      toolbar: null,
      bound: false,
      originalContent: "",
      uuid: "",
      options: {
        editable: true,
        plugins: {},
        activated: function() {},
        deactivated: function() {}
      },
      _create: function() {
        var options, plugin, _ref, _results;
        this.originalContent = this.getContents();
        this.id = this._generateUUID();
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
          options["uuid"] = this.id;
          _results.push(jQuery(this.element)[plugin](options));
        }
        return _results;
      },
      _init: function() {
        if (this.options.editable) {
          return this.enable();
        } else {
          return this.disable();
        }
      },
      disable: function() {
        this.element.attr("contentEditable", false);
        this.element.unbind("focus", this._activated);
        this.element.unbind("blur", this._deactivated);
        this.element.unbind("keyup paste change", this, this._checkModified);
        return this.bound = false;
      },
      enable: function() {
        var widget;
        this.element.attr("contentEditable", true);
        if (!this.bound) {
          this.element.bind("focus", this, this._activated);
          this.element.bind("blur", this, this._deactivated);
          this.element.bind("keyup paste change", this, this._checkModified);
          widget = this;
          return this.bound = true;
        }
      },
      activate: function() {
        return this.element.focus();
      },
      getContents: function() {
        return this.element.html();
      },
      isModified: function() {
        return this.originalContent !== this.getContents();
      },
      setUnmodified: function() {
        return this.originalContent = this.getContents();
      },
      execute: function(command) {
        if (document.execCommand(command, false, null)) {
          return this.element.trigger("change");
        }
      },
      _generateUUID: function() {
        var S4;
        S4 = function() {
          return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        };
        return "" + (S4()) + (S4()) + "-" + (S4()) + "-" + (S4()) + "-" + (S4()) + "-" + (S4()) + (S4()) + (S4());
      },
      _prepareToolbar: function() {
        this.toolbar = jQuery('<div></div>').hide();
        this.toolbar.css("position", "absolute");
        this.toolbar.css("top", this.element.offset().top - 20);
        this.toolbar.css("left", this.element.offset().left);
        jQuery('body').append(this.toolbar);
        return this.toolbar.bind("mousedown", function(event) {
          return event.preventDefault();
        });
      },
      _checkModified: function(event) {
        var widget;
        widget = event.data;
        if (widget.isModified()) {
          return widget._trigger("modified", null, {
            editable: widget,
            content: widget.getContents()
          });
        }
      },
      _activated: function(event) {
        var widget;
        widget = event.data;
        if (widget.toolbar.html() !== "") {
          widget.toolbar.css("top", widget.element.offset().top - widget.toolbar.height());
          widget.toolbar.show();
        }
        return widget._trigger("activated", event);
      },
      _deactivated: function(event) {
        var widget;
        widget = event.data;
        widget.toolbar.hide();
        return widget._trigger("deactivated", event);
      }
    });
  })(jQuery);
}).call(this);
