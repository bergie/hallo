(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      toolbar: null,
      bound: false,
      originalContent: "",
      uuid: "",
      selection: null,
      options: {
        editable: true,
        plugins: {},
        activated: function() {},
        deactivated: function() {},
        selected: function() {},
        unselected: function() {}
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
        this.element.unbind("keyup mouseup", this, this._checkSelection);
        return this.bound = false;
      },
      enable: function() {
        var widget;
        this.element.attr("contentEditable", true);
        if (!this.bound) {
          this.element.bind("focus", this, this._activated);
          this.element.bind("blur", this, this._deactivated);
          this.element.bind("keyup paste change", this, this._checkModified);
          this.element.bind("keyup mouseup", this, this._checkSelection);
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
      _getToolbarPosition: function(event, selection) {
        var newRange, position, range, tmpSpan;
        if (event.originalEvent instanceof MouseEvent) {
          return [event.pageX, event.pageY];
        }
        range = selection.getRangeAt(0);
        tmpSpan = jQuery("<span/>");
        newRange = document.createRange();
        newRange.setStart(selection.focusNode, range.endOffset);
        newRange.insertNode(tmpSpan.get(0));
        position = [tmpSpan.offset().left, tmpSpan.offset().top];
        tmpSpan.remove();
        return position;
      },
      _prepareToolbar: function() {
        this.toolbar = jQuery('<div></div>').hide();
        this.toolbar.css("position", "absolute");
        this.toolbar.css("top", this.element.offset().top - 20);
        this.toolbar.css("left", this.element.offset().left);
        jQuery('body').append(this.toolbar);
        this.toolbar.bind("mousedown", function(event) {
          return event.preventDefault();
        });
        this.element.bind("halloselected", function(event, data) {
          var position, widget;
          widget = data.editable;
          position = widget._getToolbarPosition(data.originalEvent, data.selection);
          widget.toolbar.css("top", position[1]);
          widget.toolbar.css("left", position[0]);
          return widget.toolbar.show();
        });
        return this.element.bind("hallounselected", function(event, data) {
          return data.editable.toolbar.hide();
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
      _rangesEqual: function(r1, r2) {
        return r1.startContainer === r2.startContainer && r1.startOffset === r2.startOffset && r1.endContainer === r2.endContainer && r1.endOffset === r2.endOffset;
      },
      _checkSelection: function(event) {
        var changed, i, range, sel, selectedRanges, widget, _ref;
        widget = event.data;
        sel = window.getSelection();
        if (sel.type === "Caret") {
          if (widget.selection) {
            widget.selection = null;
            widget._trigger("unselected", null, {
              editable: widget,
              originalEvent: event
            });
          }
          return;
        }
        selectedRanges = [];
        changed = !widget.section || (sel.rangeCount !== widget.selection.length);
        for (i = 0, _ref = sel.rangeCount; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          range = sel.getRangeAt(i).cloneRange();
          selectedRanges[i] = range;
          if (!changed && !widget._rangesEqual(range, widget.selection[i])) {
            changed = true;
          }
          ++i;
        }
        widget.selection = selectedRanges;
        if (changed) {
          return widget._trigger("selected", null, {
            editable: widget,
            selection: sel,
            ranges: selectedRanges,
            originalEvent: event
          });
        }
      },
      _activated: function(event) {
        var widget;
        widget = event.data;
        if (widget.toolbar.html() !== "") {
          widget.toolbar.css("top", widget.element.offset().top - widget.toolbar.height());
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
