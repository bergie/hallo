(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      toolbar: null,
      bound: false,
      options: {
        editable: true,
        plugins: []
      },
      _create: function() {
        var plugin, _i, _len, _ref, _results;
        this._prepareToolbar();
        _ref = this.options.plugins;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          plugin = _ref[_i];
          _results.push(jQuery(this.element)[plugin]({
            editable: this,
            toolbar: this.toolbar
          }));
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
          return this.element.unbind("blur", this.deactivated);
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
        console.log("Got activated");
        if (widget.toolbar.html() !== "") {
          widget.toolbar.css("top", widget.element.offset().top - widget.toolbar.height());
          return widget.toolbar.show();
        }
      },
      deactivated: function(event) {
        var widget;
        widget = event.data;
        console.log("Got deactivated");
        return window.setTimeout(function() {
          return widget.toolbar.hide();
        }, 200);
      },
      execute: function(command) {
        document.execCommand(command, false, null);
        return this.element.focus();
      }
    });
  })(jQuery);
}).call(this);
