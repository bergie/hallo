(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallooverlay", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        opacity: 0.5,
        backgroundColor: '#000000',
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
          widget.options.editable.element.bind("halloselected", function(event, data) {
            widget.options.currentEditable = jQuery(event.target);
            return widget.showOverlay();
          });
          widget.options.editable.element.bind("hallomodified", function(event, data) {
            if (widget.visible) {
              return widget.updateOverlay();
            }
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
      updateOverlay: function() {
        var m, now;
        now = new Date().getTime();
        if (this.options.lastUpdate && now - this.options.lastUpdate < this.options.updateInterval) {
          return;
        }
        this.options.lastUpdate = now;
        if (this.options.pieces.top) {
          m = this._getMeasures();
          this.options.pieces.left.css({
            height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom
          });
          this.options.pieces.right.css({
            height: m.editableHeight - this.options.offsetTop - this.options.offsetBottom
          });
          return this.options.pieces.bottom.css({
            top: m.editableTop + m.editableHeight - this.options.offsetBottom,
            height: m.documentHeight - m.editableTop + m.editableHeight + this.options.offsetBottom
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
          height: m.documentHeight - m.editableTop + m.editableHeight + this.options.offsetBottom
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
          editableHeight: this.options.toolbar.outerHeight() + this.options.currentEditable.outerHeight(),
          editableWidth: this.options.currentEditable.outerWidth(),
          editableTop: parseInt(this.options.toolbar.css('top')),
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
        p = jQuery('<div>');
        return p.css({
          position: 'absolute',
          backgroundColor: this.options.backgroundColor,
          opacity: this.options.opacity
        });
      }
    });
  })(jQuery);
}).call(this);
