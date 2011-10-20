(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallooverlay", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        overlay: null
      },
      _create: function() {
        var widget;
        widget = this;
        if (!this.options.bound) {
          this.options.bound = true;
          widget.options.editable.element.bind("halloactivated", function(event, data) {
            widget.options.currentEditable = jQuery(event.target);
            return widget.showOverlay();
          });
          return widget.options.editable.element.keydown(function(event, data) {
            if (event.keyCode === 27) {
              widget.options.editable.restoreOriginalContent();
              widget.options.editable.element.blur();
              return widget.hideOverlay();
            }
          });
        }
      },
      _init: function() {},
      showOverlay: function() {
        this.options.visible = true;
        if (this.options.overlay === null) {
          if (jQuery("#halloOverlay").length > 0) {
            this.options.overlay = jQuery("#halloOverlay");
            this.options.overlay.bind('click', jQuery.proxy(this.hideOverlay, this));
          } else {
            this.options.overlay = jQuery('<div id="halloOverlay" class="halloOverlay">');
            jQuery(document.body).append(this.options.overlay);
            this.options.overlay.bind('click', jQuery.proxy(this.hideOverlay, this));
          }
        }
        this.options.overlay.show();
        this.options.originalBgColor = this.options.currentEditable.css("background-color");
        this.options.currentEditable.css('background-color', this._findBackgroundColor(this.options.currentEditable));
        if (!this.options.originalZIndex) {
          this.options.originalZIndex = this.options.currentEditable.css("z-index");
        }
        return this.options.currentEditable.css('z-index', '350');
      },
      hideOverlay: function() {
        this.options.visible = false;
        this.options.overlay.hide();
        this.options.currentEditable.css('background-color', this.options.originalBgColor);
        this.options.currentEditable.css('z-index', this.options.originalZIndex);
        return this.options.editable._deactivated({
          data: this.options.editable
        });
      },
      _findBackgroundColor: function(jQueryfield) {
        var color;
        color = jQueryfield.css("background-color");
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          return color;
        }
        if (jQueryfield.is("body")) {
          return "white";
        } else {
          return this._findBackgroundColor(jQueryfield.parent());
        }
      }
    });
  })(jQuery);
}).call(this);
