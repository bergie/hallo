(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallooverlay", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        updateInterval: 100,
        offsetTop: 0,
        offsetLeft: 0,
        offsetRight: 0,
        offsetBottom: 0,
        pieces: {}
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
          widget.options.editable.element.bind("hallomodified", function(event, data) {
            if (widget.options.visible) {
              return widget.updateOverlay();
            }
          });
          widget.options.editable.element.keydown(function(event, data) {
            if (event.keyCode === 27) {
              widget.options.editable.restoreOriginalContent();
              widget.options.editable.element.blur();
              return widget.hideOverlay();
            }
          });
          return jQuery(window).resize(function() {
            if (widget.options.visible) {
              return widget.updateOverlay(true);
            }
          });
        }
      },
      _init: function() {},
      showOverlay: function() {
        var key, piece, _ref;
        this.options.visible = true;
        if (this.options.pieces.top) {
          _ref = this.options.pieces;
          for (key in _ref) {
            piece = _ref[key];
            piece.show();
          }
          this.updateOverlay();
          return;
        }
        return this._createOverlay();
      },
      hideOverlay: function() {
        var key, piece, _ref;
        this.options.visible = false;
        if (this.options.pieces.top) {
          _ref = this.options.pieces;
          for (key in _ref) {
            piece = _ref[key];
            piece.hide();
          }
        }
        return this.options.editable._deactivated({
          data: this.options.editable
        });
      },
      updateOverlay: function(force) {
        var m, now;
        now = new Date().getTime();
        if (!force && this.options.lastUpdate && now - this.options.lastUpdate < this.options.updateInterval) {
          return;
        }
        this.options.lastUpdate = now;
        if (this.options.pieces.top) {
          m = this._getMeasures();
          this.options.pieces.left.css({
            height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom,
            width: m.editableLeft + this.options.offsetLeft
          });
          this.options.pieces.right.css({
            height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom,
            width: m.windowWidth - (m.editableLeft + m.editableWidth) + this.options.offsetRight
          });
          return this.options.pieces.bottom.css({
            top: m.editableTop + m.editableHeight - this.options.offsetBottom,
            height: m.documentHeight - (m.editableTop + m.editableHeight) + this.options.offsetBottom
          });
        }
      },
      _createOverlay: function() {
        var bottom, key, left, m, piece, right, top, _ref, _results;
        m = this._getMeasures();
        top = this._getBasicPiece();
        top.css({
          top: 0,
          left: 0,
          width: '100%',
          height: m.editableTop + this.options.offsetTop
        });
        jQuery(document.body).append(top);
        this.options.pieces.top = top;
        left = this._getBasicPiece();
        left.css({
          top: m.editableTop + this.options.offsetTop,
          left: 0,
          width: m.editableLeft + this.options.offsetLeft,
          height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom
        });
        jQuery(document.body).append(left);
        this.options.pieces.left = left;
        right = this._getBasicPiece();
        right.css({
          top: m.editableTop + this.options.offsetTop,
          right: 0,
          width: m.windowWidth - (m.editableLeft + m.editableWidth) + this.options.offsetRight,
          height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom
        });
        jQuery(document.body).append(right);
        this.options.pieces.right = right;
        bottom = this._getBasicPiece();
        bottom.css({
          top: m.editableTop + m.editableHeight - this.options.offsetBottom,
          left: 0,
          width: '100%',
          height: m.documentHeight - (m.editableTop + m.editableHeight) + this.options.offsetBottom
        });
        jQuery(document.body).append(bottom);
        this.options.pieces.bottom = bottom;
        _ref = this.options.pieces;
        _results = [];
        for (key in _ref) {
          piece = _ref[key];
          _results.push(piece.bind('click', jQuery.proxy(this.hideOverlay, this)));
        }
        return _results;
      },
      _getMeasures: function() {
        var m;
        m = {
          editableHeight: this.options.currentEditable.outerHeight(),
          editableWidth: this.options.currentEditable.outerWidth(),
          editableTop: parseInt(this.options.currentEditable.offset().top),
          editableLeft: parseInt(this.options.currentEditable.offset().left),
          windowWidth: jQuery(window).width(),
          documentHeight: jQuery(window.document).height()
        };
        m.editableRight = m.editableLeft + m.editableWidth;
        m.editableBottom = m.editableTop + m.editableHeight;
        return m;
      },
      _getBasicPiece: function() {
        var p;
        p = jQuery('<div class="halloOverlay">');
        return p.css({
          position: 'absolute'
        });
      }
    });
  })(jQuery);
}).call(this);
