(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      toolbar: null,
      bound: false,
      originalContent: "",
      _modifiedContent: "",
      changeTimer: void 0,
      options: {
        editable: true,
        plugins: {},
        activated: function() {},
        deactivated: function() {}
      },
      _create: function() {
        var options, plugin, _ref, _results;
        this.originalContent = this.getContents();
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
        this.bound = false;
        if (this.changeTimer !== void 0) {
          return window.clearInterval(this.changeTimer);
        }
      },
      enable: function() {
        var widget;
        this.element.attr("contentEditable", true);
        if (!this.bound) {
          this.element.bind("focus", this, this._activated);
          this.element.bind("blur", this, this._deactivated);
          widget = this;
          this.changeTimer = window.setInterval(function() {
            return widget._checkModified();
          });
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
        document.execCommand(command, false, null);
        return this.activate();
      },
      _prepareToolbar: function() {
        this.toolbar = jQuery('<div></div>').hide();
        this.toolbar.css("position", "absolute");
        this.toolbar.css("top", this.element.offset().top - 20);
        this.toolbar.css("left", this.element.offset().left);
        return jQuery('body').append(this.toolbar);
      },
      _checkModified: function() {
        if (this.isModified() && this.getContents() !== this._modifiedContents) {
          this._modifiedContents = this.getContents();
          return this._trigger("modified", null, {
            editable: this,
            content: this._modifiedContents
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
        window.setTimeout(function() {
          return widget.toolbar.hide();
        }, 200);
        return widget._trigger("deactivated", event);
      }
    });
  })(jQuery);
}).call(this);
