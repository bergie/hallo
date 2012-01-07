(function() {
  var EntityCache, ns, uriSuffix, vie,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ns = {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    enhancer: 'http://fise.iks-project.eu/ontology/',
    dc: 'http://purl.org/dc/terms/',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    skos: 'http://www.w3.org/2004/02/skos/core#'
  };

  vie = new VIE();

  vie.use(new vie.StanbolService({
    url: "http://dev.iks-project.eu:8080",
    proxyDisabled: true
  }));

  EntityCache = (function() {

    function EntityCache(opts) {
      this.vie = opts.vie;
      this.logger = opts.logger;
    }

    EntityCache.prototype._entities = function() {
      var _ref;
      return (_ref = window.entityCache) != null ? _ref : window.entityCache = {};
    };

    EntityCache.prototype.get = function(uri, scope, success, error) {
      var cache,
        _this = this;
      uri = uri.replace(/^<|>$/g, "");
      if (this._entities()[uri] && this._entities()[uri].status === "done") {
        if (typeof success === "function") {
          success.apply(scope, [this._entities()[uri].entity]);
        }
      } else if (this._entities()[uri] && this._entities()[uri].status === "error") {
        if (typeof error === "function") error.apply(scope, ["error"]);
      } else if (!this._entities()[uri]) {
        this._entities()[uri] = {
          status: "pending",
          uri: uri
        };
        cache = this;
        this.vie.load({
          entity: uri
        }).using('stanbol').execute().success(function(entityArr) {
          return _.defer(function() {
            var cacheEntry, entity;
            cacheEntry = _this._entities()[uri];
            entity = _.detect(entityArr, function(e) {
              if (e.getSubject() === ("<" + uri + ">")) return true;
            });
            if (entity) {
              cacheEntry.entity = entity;
              cacheEntry.status = "done";
              return $(cacheEntry).trigger("done", entity);
            } else {
              _this.logger.warn("couldn''t load " + uri, entityArr);
              return cacheEntry.status = "not found";
            }
          });
        }).fail(function(e) {
          return _.defer(function() {
            var cacheEntry;
            _this.logger.error("couldn't load " + uri);
            cacheEntry = _this._entities()[uri];
            cacheEntry.status = "error";
            return $(cacheEntry).trigger("fail", e);
          });
        });
      }
      if (this._entities()[uri] && this._entities()[uri].status === "pending") {
        return $(this._entities()[uri]).bind("done", function(event, entity) {
          if (typeof success === "function") return success.apply(scope, [entity]);
        }).bind("fail", function(event, error) {
          if (typeof error === "function") return error.apply(scope, [error]);
        });
      }
    };

    return EntityCache;

  })();

  uriSuffix = function(uri) {
    var res;
    res = uri.substring(uri.lastIndexOf("#") + 1);
    return res.substring(res.lastIndexOf("/") + 1);
  };

  jQuery.widget('IKS.annotate', {
    __widgetName: "IKS.annotate",
    options: {
      vie: vie,
      vieServices: ["stanbol"],
      autoAnalyze: false,
      showTooltip: true,
      debug: false,
      depictionProperties: ["foaf:depiction", "schema:thumbnail"],
      labelProperties: ["rdfs:label", "skos:prefLabel", "schema:name", "foaf:name"],
      descriptionProperties: [
        "rdfs:comment", "skos:note", "schema:description", "skos:definition", {
          property: "skos:broader",
          makeLabel: function(propertyValueArr) {
            var labels;
            labels = _(propertyValueArr).map(function(termUri) {
              return termUri.replace(/<.*[\/#](.*)>/, "$1").replace(/_/g, "&nbsp;");
            });
            return "Subcategory of " + (labels.join(', ')) + ".";
          }
        }, {
          property: "dc:subject",
          makeLabel: function(propertyValueArr) {
            var labels;
            labels = _(propertyValueArr).map(function(termUri) {
              return termUri.replace(/<.*[\/#](.*)>/, "$1").replace(/_/g, "&nbsp;");
            });
            return "Subject(s): " + (labels.join(', ')) + ".";
          }
        }
      ],
      fallbackLanguage: "en",
      ns: {
        dbpedia: "http://dbpedia.org/ontology/",
        skos: "http://www.w3.org/2004/02/skos/core#"
      },
      typeFilter: null,
      getTypes: function() {
        return [
          {
            uri: "" + this.ns.dbpedia + "Place",
            label: 'Place'
          }, {
            uri: "" + this.ns.dbpedia + "Person",
            label: 'Person'
          }, {
            uri: "" + this.ns.dbpedia + "Organisation",
            label: 'Organisation'
          }, {
            uri: "" + this.ns.skos + "Concept",
            label: 'Concept'
          }
        ];
      },
      getSources: function() {
        return [
          {
            uri: "http://dbpedia.org/resource/",
            label: "dbpedia"
          }, {
            uri: "http://sws.geonames.org/",
            label: "geonames"
          }
        ];
      }
    },
    _create: function() {
      var widget;
      widget = this;
      this._logger = this.options.debug ? console : {
        info: function() {},
        warn: function() {},
        error: function() {},
        log: function() {}
      };
      this.entityCache = new EntityCache({
        vie: this.options.vie,
        logger: this._logger
      });
      if (this.options.autoAnalyze) return this.enable();
    },
    _destroy: function() {
      this.disable();
      return $(':IKS-annotationSelector', this.element).each(function() {
        if ($(this).data().annotationSelector) {
          return $(this).annotationSelector('destroy');
        }
      });
    },
    enable: function(cb) {
      var analyzedNode,
        _this = this;
      analyzedNode = this.element;
      return this.options.vie.analyze({
        element: this.element
      }).using(this.options.vieServices).execute().success(function(enhancements) {
        return _.defer(function() {
          var entAnn, entityAnnotations, textAnn, textAnnotations, textAnns, _i, _j, _len, _len2, _ref;
          entityAnnotations = Stanbol.getEntityAnnotations(enhancements);
          for (_i = 0, _len = entityAnnotations.length; _i < _len; _i++) {
            entAnn = entityAnnotations[_i];
            textAnns = entAnn.get("dc:relation");
            _ref = _.flatten([textAnns]);
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              textAnn = _ref[_j];
              if (!(textAnn instanceof Backbone.Model)) {
                textAnn = entAnn.vie.entities.get(textAnn);
              }
              if (!textAnn) continue;
              _(_.flatten([textAnn])).each(function(ta) {
                return ta.setOrAdd({
                  "entityAnnotation": entAnn.getSubject()
                });
              });
            }
          }
          textAnnotations = Stanbol.getTextAnnotations(enhancements);
          textAnnotations = _this._filterByType(textAnnotations);
          textAnnotations = _(textAnnotations).filter(function(textEnh) {
            if (textEnh.getSelectedText && textEnh.getSelectedText()) {
              return true;
            } else {
              return false;
            }
          });
          _(textAnnotations).each(function(s) {
            _this._logger.info(s._enhancement, 'confidence', s.getConfidence(), 'selectedText', s.getSelectedText(), 'type', s.getType(), 'EntityEnhancements', s.getEntityEnhancements());
            return _this.processTextEnhancement(s, analyzedNode);
          });
          _this._trigger("success", true);
          if (typeof cb === "function") return cb(true);
        });
      }).fail(function(xhr) {
        if (typeof cb === "function") cb(false, xhr);
        _this._trigger('error', xhr);
        return _this._logger.error("analyze failed", xhr.responseText, xhr);
      });
    },
    disable: function() {
      return $(':IKS-annotationSelector', this.element).each(function() {
        if ($(this).data().annotationSelector) {
          return $(this).annotationSelector('disable');
        }
      });
    },
    acceptAll: function(reportCallback) {
      var report;
      report = {
        updated: [],
        accepted: 0
      };
      $(':IKS-annotationSelector', this.element).each(function() {
        var res;
        if ($(this).data().annotationSelector) {
          res = $(this).annotationSelector('acceptBestCandidate');
          if (res) {
            report.updated.push(this);
            return report.accepted++;
          }
        }
      });
      return typeof reportCallback === "function" ? reportCallback(report) : void 0;
    },
    processTextEnhancement: function(textEnh, parentEl) {
      var eEnh, eEnhUri, el, options, sType, type, widget, _i, _j, _len, _len2, _ref,
        _this = this;
      if (!textEnh.getSelectedText()) {
        this._logger.warn("textEnh", textEnh, "doesn't have selected-text!");
        return;
      }
      el = $(this._getOrCreateDomElement(parentEl[0], textEnh.getSelectedText(), {
        createElement: 'span',
        createMode: 'existing',
        context: textEnh.getContext(),
        start: textEnh.getStart(),
        end: textEnh.getEnd()
      }));
      sType = textEnh.getType() || "Other";
      widget = this;
      el.addClass('entity');
      for (_i = 0, _len = sType.length; _i < _len; _i++) {
        type = sType[_i];
        el.addClass(uriSuffix(type).toLowerCase());
      }
      if (textEnh.getEntityEnhancements().length) el.addClass("withSuggestions");
      _ref = textEnh.getEntityEnhancements();
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        eEnh = _ref[_j];
        eEnhUri = eEnh.getUri();
        this.entityCache.get(eEnhUri, eEnh, function(entity) {
          if (("<" + eEnhUri + ">") === entity.getSubject()) {
            return _this._logger.info("entity " + eEnhUri + " is loaded:", entity.as("JSON"));
          } else {
            return widget._logger.info("forwarded entity for " + eEnhUri + " loaded:", entity.getSubject());
          }
        });
      }
      options = this.options;
      options.cache = this.entityCache;
      options.annotateElement = this.element;
      return el.annotationSelector(options).annotationSelector('addTextEnhancement', textEnh);
    },
    _filterByType: function(textAnnotations) {
      var _this = this;
      if (!this.options.typeFilter) return textAnnotations;
      return _.filter(textAnnotations, function(ta) {
        var type, _i, _len, _ref, _ref2;
        if (_ref = _this.options.typeFilter, __indexOf.call(ta.getType(), _ref) >= 0) {
          return true;
        }
        _ref2 = _this.options.typeFilter;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          type = _ref2[_i];
          if (__indexOf.call(ta.getType(), type) >= 0) return true;
        }
      });
    },
    _getOrCreateDomElement: function(element, text, options) {
      var domEl, len, nearest, nearestPosition, newElement, occurrences, pos, start, textContentOf, textToCut;
      if (options == null) options = {};
      occurrences = function(str, s) {
        var last, next, res, _results;
        res = [];
        last = 0;
        _results = [];
        while (str.indexOf(s, last + 1) !== -1) {
          next = str.indexOf(s, last + 1);
          res.push(next);
          _results.push(last = next);
        }
        return _results;
      };
      nearest = function(arr, nr) {
        return _(arr).sortedIndex(nr);
      };
      nearestPosition = function(str, s, ind) {
        var arr, d0, d1, i0, i1;
        arr = occurrences(str, s);
        i1 = nearest(arr, ind);
        if (arr.length === 1) {
          return arr[0];
        } else if (i1 === arr.length) {
          return arr[i1 - 1];
        } else {
          i0 = i1 - 1;
          d0 = ind - arr[i0];
          d1 = arr[i1] - ind;
          if (d1 > d0) {
            return arr[i0];
          } else {
            return arr[i1];
          }
        }
      };
      domEl = element;
      textContentOf = function(element) {
        return $(element).text().replace(/\n/g, " ");
      };
      if (textContentOf(element).indexOf(text) === -1) {
        console.error("'" + text + "' doesn't appear in the text block.");
        return $();
      }
      start = options.start + textContentOf(element).indexOf(textContentOf(element).trim());
      start = nearestPosition(textContentOf(element), text, start);
      pos = 0;
      while (textContentOf(domEl).indexOf(text) !== -1 && domEl.nodeName !== '#text') {
        domEl = _(domEl.childNodes).detect(function(el) {
          var p;
          p = textContentOf(el).lastIndexOf(text);
          if (p >= start - pos) {
            return true;
          } else {
            pos += textContentOf(el).length;
            return false;
          }
        });
      }
      if (options.createMode === "existing" && textContentOf($(domEl).parent()) === text) {
        return $(domEl).parent()[0];
      } else {
        pos = start - pos;
        len = text.length;
        textToCut = textContentOf(domEl).substring(pos, pos + len);
        if (textToCut === text) {
          domEl.splitText(pos + len);
          newElement = document.createElement(options.createElement || 'span');
          newElement.innerHTML = text;
          $(domEl).parent()[0].replaceChild(newElement, domEl.splitText(pos));
          return $(newElement);
        } else {
          return console.warn("dom element creation problem: " + textToCut + " isnt " + text);
        }
      }
    }
  });

  jQuery.widget('IKS.annotationSelector', {
    __widgetName: "IKS.annotationSelector",
    options: {
      ns: {
        dbpedia: "http://dbpedia.org/ontology/",
        skos: "http://www.w3.org/2004/02/skos/core#"
      },
      getTypes: function() {
        return [
          {
            uri: "" + this.ns.dbpedia + "Place",
            label: 'Place'
          }, {
            uri: "" + this.ns.dbpedia + "Person",
            label: 'Person'
          }, {
            uri: "" + this.ns.dbpedia + "Organisation",
            label: 'Organisation'
          }, {
            uri: "" + this.ns.skos + "Concept",
            label: 'Concept'
          }
        ];
      },
      getSources: function() {
        return [
          {
            uri: "http://dbpedia.org/resource/",
            label: "dbpedia"
          }, {
            uri: "http://sws.geonames.org/",
            label: "geonames"
          }
        ];
      }
    },
    _create: function() {
      var _this = this;
      this.enableEditing();
      this._logger = this.options.debug ? console : {
        info: function() {},
        warn: function() {},
        error: function() {},
        log: function() {}
      };
      if (this.isAnnotated()) {
        this._initTooltip();
        this.linkedEntity = {
          uri: this.element.attr("about"),
          type: this.element.attr("typeof")
        };
        return this.options.cache.get(this.linkedEntity.uri, this, function(cachedEntity) {
          var userLang;
          userLang = window.navigator.language.split("-")[0];
          _this.linkedEntity.label = _(cachedEntity.get("rdfs:label")).detect(function(label) {
            if (label.indexOf("@" + userLang) > -1) return true;
          }).replace(/(^\"*|\"*@..$)/g, "");
          return _this._logger.info("did I figure out?", _this.linkedEntity.label);
        });
      }
    },
    enableEditing: function() {
      var _this = this;
      return this.element.click(function(e) {
        _this._logger.log("click", e, e.isDefaultPrevented());
        if (!_this.dialog) {
          _this._createDialog();
          setTimeout((function() {
            return _this.dialog.open();
          }), 220);
          _this.entityEnhancements = _this._getEntityEnhancements();
          _this._createSearchbox();
          if (_this.entityEnhancements.length > 0) {
            if (_this.menu === void 0) return _this._createMenu();
          }
        } else {
          return _this.searchEntryField.find('.search').focus(100);
        }
      });
    },
    disableEditing: function() {
      return this._logger.info("TODO: remove click handler");
    },
    _destroy: function() {
      this.disableEditing();
      if (this.menu) {
        this.menu.destroy();
        this.menu.element.remove();
        delete this.menu;
      }
      if (this.dialog) {
        this.dialog.destroy();
        this.dialog.element.remove();
        this.dialog.uiDialogTitlebar.remove();
        return delete this.dialog;
      }
    },
    remove: function(event) {
      var el;
      el = this.element.parent();
      this.element.tooltip("destroy");
      if (!this.isAnnotated() && this.textEnhancements) {
        this._trigger('decline', event, {
          textEnhancements: this.textEnhancements
        });
      } else {
        this._trigger('remove', event, {
          textEnhancement: this._acceptedTextEnhancement,
          entityEnhancement: this._acceptedEntityEnhancement,
          linkedEntity: this.linkedEntity
        });
      }
      this.destroy();
      if (this.element.qname().name !== '#text') {
        return this.element.replaceWith(document.createTextNode(this.element.text()));
      }
    },
    disable: function() {
      if (!this.isAnnotated() && this.element.qname().name !== '#text') {
        return this.element.replaceWith(document.createTextNode(this.element.text()));
      } else {
        return this.disableEditing();
      }
    },
    isAnnotated: function() {
      if (this.element.attr('about')) {
        return true;
      } else {
        return false;
      }
    },
    annotate: function(entityEnhancement, options) {
      var entityClass, entityHtml, entityType, entityUri, newElement, rel, sType, ui;
      entityUri = entityEnhancement.getUri();
      entityType = entityEnhancement.getTextEnhancement().getType() || "";
      entityHtml = this.element.html();
      sType = entityEnhancement.getTextEnhancement().getType();
      if (!sType.length) sType = ["Other"];
      rel = options.rel || ("" + ns.skos + "related");
      entityClass = 'entity ' + uriSuffix(sType[0]).toLowerCase();
      newElement = $("<a href='" + entityUri + "'            about='" + entityUri + "'            typeof='" + entityType + "'            rel='" + rel + "'            class='" + entityClass + "'>" + entityHtml + "</a>");
      this._cloneCopyEvent(this.element[0], newElement[0]);
      this.linkedEntity = {
        uri: entityUri,
        type: entityType,
        label: entityEnhancement.getLabel()
      };
      this.element.replaceWith(newElement);
      this.element = newElement.addClass(options.styleClass);
      this._logger.info("created annotation in", this.element);
      this._updateTitle();
      this._insertLink();
      this._acceptedTextEnhancement = entityEnhancement.getTextEnhancement();
      this._acceptedEntityEnhancement = entityEnhancement;
      ui = {
        linkedEntity: this.linkedEntity,
        textEnhancement: entityEnhancement.getTextEnhancement(),
        entityEnhancement: entityEnhancement
      };
      this.select(ui);
      return this._initTooltip();
    },
    select: function(ui) {
      this._trigger('select', null, ui);
      return jQuery(this.options.annotateElement).trigger("annotateselect", ui);
    },
    acceptBestCandidate: function() {
      var eEnhancements;
      eEnhancements = this._getEntityEnhancements();
      if (!eEnhancements.length) return;
      if (this.isAnnotated()) return;
      this.annotate(eEnhancements[0], {
        styleClass: "acknowledged"
      });
      return eEnhancements[0];
    },
    addTextEnhancement: function(textEnh) {
      this.options.textEnhancements = this.options.textEnhancements || [];
      this.options.textEnhancements.push(textEnh);
      return this.textEnhancements = this.options.textEnhancements;
    },
    close: function() {
      this.destroy();
      return jQuery(".ui-tooltip").remove();
    },
    _initTooltip: function() {
      var widget,
        _this = this;
      widget = this;
      if (this.options.showTooltip) {
        return jQuery(this.element).tooltip({
          items: "[about]",
          hide: {
            effect: "hide",
            delay: 50
          },
          show: {
            effect: "show",
            delay: 50
          },
          content: function(response) {
            var uri;
            uri = _this.element.attr("about");
            _this._logger.info("tooltip uri:", uri);
            widget._createPreview(uri, response);
            return "loading...";
          }
        });
      }
    },
    _getEntityEnhancements: function() {
      var eEnhancements, enhancement, textEnh, _i, _j, _len, _len2, _ref, _ref2, _tempUris;
      eEnhancements = [];
      _ref = this.textEnhancements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        textEnh = _ref[_i];
        _ref2 = textEnh.getEntityEnhancements();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          enhancement = _ref2[_j];
          eEnhancements.push(enhancement);
        }
      }
      _tempUris = [];
      eEnhancements = _(eEnhancements).filter(function(eEnh) {
        var uri;
        uri = eEnh.getUri();
        if (_tempUris.indexOf(uri) === -1) {
          _tempUris.push(uri);
          return true;
        } else {
          return false;
        }
      });
      return _(eEnhancements).sortBy(function(e) {
        return -1 * e.getConfidence();
      });
    },
    _typeLabels: function(types) {
      var allKnownPrefixes, knownMapping, knownPrefixes,
        _this = this;
      knownMapping = this.options.getTypes();
      allKnownPrefixes = _(knownMapping).map(function(x) {
        return x.uri;
      });
      knownPrefixes = _.intersect(allKnownPrefixes, types);
      return _(knownPrefixes).map(function(key) {
        var foundPrefix;
        foundPrefix = _(knownMapping).detect(function(x) {
          return x.uri === key;
        });
        return foundPrefix.label;
      });
    },
    _sourceLabel: function(src) {
      var sourceObj, sources;
      if (!src) console.warn("No source");
      if (!src) return "";
      sources = this.options.getSources();
      sourceObj = _(sources).detect(function(s) {
        return src.indexOf(s.uri) !== -1;
      });
      if (sourceObj) {
        return sourceObj.label;
      } else {
        return src.split("/")[2];
      }
    },
    _createDialog: function() {
      var dialogEl, label, widget,
        _this = this;
      label = this.element.text();
      dialogEl = $("<div><span class='entity-link'></span></div>").attr("tabIndex", -1).addClass().keydown(function(event) {
        if (!event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.ESCAPE) {
          _this.close(event);
          return event.preventDefault();
        }
      }).bind('dialogblur', function(event) {
        _this._logger.info('dialog dialogblur');
        return _this.close(event);
      }).bind('blur', function(event) {
        _this._logger.info('dialog blur');
        return _this.close(event);
      }).appendTo($("body")[0]);
      widget = this;
      dialogEl.dialog({
        width: 400,
        title: label,
        close: function(event, ui) {
          return _this.close(event);
        },
        autoOpen: false,
        open: function(e, ui) {
          return $.data(this, 'dialog').uiDialog.position({
            of: widget.element,
            my: "left top",
            at: "left bottom",
            collision: "none"
          });
        }
      });
      this.dialog = dialogEl.data('dialog');
      this.dialog.uiDialogTitlebar.hide();
      this._logger.info("dialog widget:", this.dialog);
      this.dialog.element.focus(100);
      window.d = this.dialog;
      this._insertLink();
      this._updateTitle();
      return this._setButtons();
    },
    _insertLink: function() {
      if (this.isAnnotated() && this.dialog) {
        return $("Annotated: <a href='" + this.linkedEntity.uri + "' target='_blank'>            " + this.linkedEntity.label + " @ " + (this._sourceLabel(this.linkedEntity.uri)) + "</a><br/>").appendTo($('.entity-link', this.dialog.element));
      }
    },
    _setButtons: function() {
      var _this = this;
      return this.dialog.element.dialog('option', 'buttons', {
        rem: {
          text: this.isAnnotated() ? 'Remove' : 'Decline',
          click: function(event) {
            return _this.remove(event);
          }
        },
        Cancel: function() {
          return _this.close();
        }
      });
    },
    _updateTitle: function() {
      var title;
      if (this.dialog) {
        if (this.isAnnotated()) {
          title = "" + this.linkedEntity.label + " <small>@ " + (this._sourceLabel(this.linkedEntity.uri)) + "</small>";
        } else {
          title = this.element.text();
        }
        return this.dialog._setOption('title', title);
      }
    },
    _createMenu: function() {
      var ul, widget,
        _this = this;
      widget = this;
      ul = $('<ul></ul>').appendTo(this.dialog.element);
      this._renderMenu(ul, this.entityEnhancements);
      this.menu = ul.menu({
        select: function(event, ui) {
          _this._logger.info("selected menu item", ui.item);
          _this.annotate(ui.item.data('enhancement'), {
            styleClass: 'acknowledged'
          });
          return _this.close(event);
        },
        blur: function(event, ui) {
          return _this._logger.info('menu.blur()', ui.item);
        }
      }).focus(150);
      if (this.options.showTooltip) {
        this.menu.tooltip({
          items: ".ui-menu-item",
          hide: {
            effect: "hide",
            delay: 50
          },
          show: {
            effect: "show",
            delay: 50
          },
          content: function(response) {
            var uri;
            uri = jQuery(this).attr("entityuri");
            widget._createPreview(uri, response);
            return "loading...";
          }
        });
      }
      return this.menu = this.menu.data('menu');
    },
    _createPreview: function(uri, response) {
      var fail, success,
        _this = this;
      success = function(cacheEntity) {
        var depictionUrl, descr, html, picSize;
        html = "";
        picSize = 100;
        depictionUrl = _this._getDepiction(cacheEntity, picSize);
        if (depictionUrl) {
          html += "<img style='float:left;padding: 5px;width: " + picSize + "px' src='" + (depictionUrl.substring(1, depictionUrl.length - 1)) + "'/>";
        }
        descr = _this._getDescription(cacheEntity);
        if (!descr) {
          _this._logger.warn("No description found for", cacheEntity);
          descr = "No description found.";
        }
        html += "<div style='padding 5px;width:250px;float:left;'><small>" + descr + "</small></div>";
        _this._logger.info("tooltip for " + uri + ": cacheEntry loaded", cacheEntity);
        return setTimeout(function() {
          return response(html);
        }, 200);
      };
      fail = function(e) {
        _this._logger.error("error loading " + uri, e);
        return response("error loading entity for " + uri);
      };
      jQuery(".ui-tooltip").remove();
      return this.options.cache.get(uri, this, success, fail);
    },
    _getUserLang: function() {
      return window.navigator.language.split("-")[0];
    },
    _getDepiction: function(entity, picSize) {
      var depictionUrl, field, fieldValue, preferredFields;
      preferredFields = this.options.depictionProperties;
      field = _(preferredFields).detect(function(field) {
        if (entity.get(field)) return true;
      });
      if (field && (fieldValue = _([entity.get(field)]).flatten())) {
        depictionUrl = _(fieldValue).detect(function(uri) {
          if (uri.indexOf("thumb") !== -1) return true;
        }).replace(/[0-9]{2..3}px/, "" + picSize + "px");
        return depictionUrl;
      }
    },
    _getLabel: function(entity) {
      var preferredFields, preferredLanguages;
      preferredFields = this.options.labelProperties;
      preferredLanguages = [this._getUserLang(), this.options.fallbackLanguage];
      return this._getPreferredLangForPreferredProperty(entity, preferredFields, preferredLanguages);
    },
    _getDescription: function(entity) {
      var preferredFields, preferredLanguages;
      preferredFields = this.options.descriptionProperties;
      preferredLanguages = [this._getUserLang(), this.options.fallbackLanguage];
      return this._getPreferredLangForPreferredProperty(entity, preferredFields, preferredLanguages);
    },
    _getPreferredLangForPreferredProperty: function(entity, preferredFields, preferredLanguages) {
      var label, labelArr, lang, property, valueArr, _i, _j, _len, _len2,
        _this = this;
      for (_i = 0, _len = preferredLanguages.length; _i < _len; _i++) {
        lang = preferredLanguages[_i];
        for (_j = 0, _len2 = preferredFields.length; _j < _len2; _j++) {
          property = preferredFields[_j];
          if (typeof property === "string" && entity.get(property)) {
            labelArr = _.flatten([entity.get(property)]);
            label = _(labelArr).detect(function(label) {
              if (label.indexOf("@" + lang) > -1) return true;
            });
            if (label) return label.replace(/(^\"*|\"*@..$)/g, "");
          } else if (typeof property === "object" && entity.get(property.property)) {
            valueArr = _.flatten([entity.get(property.property)]);
            valueArr = _(valueArr).map(function(termUri) {
              if (termUri.isEntity) {
                return termUri.getSubject();
              } else {
                return termUri;
              }
            });
            return property.makeLabel(valueArr);
          }
        }
      }
      return "";
    },
    _renderMenu: function(ul, entityEnhancements) {
      var enhancement, _i, _len;
      entityEnhancements = _(entityEnhancements).sortBy(function(ee) {
        return -1 * ee.getConfidence();
      });
      for (_i = 0, _len = entityEnhancements.length; _i < _len; _i++) {
        enhancement = entityEnhancements[_i];
        this._renderItem(ul, enhancement);
      }
      return this._logger.info('rendered menu for the elements', entityEnhancements);
    },
    _renderItem: function(ul, eEnhancement) {
      var active, item, label, source, type;
      label = eEnhancement.getLabel().replace(/^\"|\"$/g, "");
      type = this._typeLabels(eEnhancement.getTypes()).toString() || "Other";
      source = this._sourceLabel(eEnhancement.getUri());
      active = this.linkedEntity && eEnhancement.getUri() === this.linkedEntity.uri ? " class='ui-state-active'" : "";
      return item = $("<li" + active + " entityuri='" + (eEnhancement.getUri()) + "'><a>" + label + " <small>(" + type + " from " + source + ")</small></a></li>").data('enhancement', eEnhancement).appendTo(ul);
    },
    _createSearchbox: function() {
      var sugg, widget,
        _this = this;
      this.searchEntryField = $('<span style="background: fff;"><label for="search">Search:</label> <input id="search" class="search"></span>').appendTo(this.dialog.element);
      sugg = this.textEnhancements[0];
      widget = this;
      this.searchbox = $('.search', this.searchEntryField).autocomplete({
        source: function(req, resp) {
          widget._logger.info("req:", req);
          return widget.options.vie.find({
            term: "" + req.term + (req.term.length > 3 ? '*' : '')
          }).using('stanbol').execute().fail(function(e) {
            return widget._logger.error("Something wrong happened at stanbol find:", e);
          }).success(function(entityList) {
            var _this = this;
            return _.defer(function() {
              var limit, res;
              widget._logger.info("resp:", _(entityList).map(function(ent) {
                return ent.id;
              }));
              limit = 10;
              entityList = _(entityList).filter(function(ent) {
                if (ent.getSubject().replace(/^<|>$/g, "") === "http://www.iks-project.eu/ontology/rick/query/QueryResultSet") {
                  return false;
                }
                return true;
              });
              res = _(entityList.slice(0, limit)).map(function(entity) {
                return {
                  key: entity.getSubject().replace(/^<|>$/g, ""),
                  label: "" + (widget._getLabel(entity)) + " @ " + (widget._sourceLabel(entity.id)),
                  _label: widget._getLabel(entity),
                  getLabel: function() {
                    return this._label;
                  },
                  getUri: function() {
                    return this.key;
                  },
                  _tEnh: sugg,
                  getTextEnhancement: function() {
                    return this._tEnh;
                  }
                };
              });
              return resp(res);
            });
          });
        },
        open: function(e, ui) {
          widget._logger.info("autocomplete.open", e, ui);
          if (widget.options.showTooltip) {
            return $(this).data().autocomplete.menu.activeMenu.tooltip({
              items: ".ui-menu-item",
              hide: {
                effect: "hide",
                delay: 50
              },
              show: {
                effect: "show",
                delay: 50
              },
              content: function(response) {
                var uri;
                uri = $(this).data()["item.autocomplete"].getUri();
                widget._createPreview(uri, response);
                return "loading...";
              }
            });
          }
        },
        select: function(e, ui) {
          _this.annotate(ui.item, {
            styleClass: "acknowledged"
          });
          return _this._logger.info("autocomplete.select", e.target, ui);
        }
      }).focus(200).blur(function(e, ui) {
        return _this._dialogCloseTimeout = setTimeout((function() {
          return _this.close();
        }), 200);
      });
      if (!this.entityEnhancements.length && !this.isAnnotated()) {
        setTimeout(function() {
          var label;
          label = _this.element.html();
          _this.searchbox.val(label);
          return _this.searchbox.autocomplete("search", label);
        }, 300);
      }
      return this._logger.info("show searchbox");
    },
    _cloneCopyEvent: function(src, dest) {
      var curData, events, i, internalKey, l, oldData, type;
      if (dest.nodeType !== 1 || !jQuery.hasData(src)) return;
      internalKey = $.expando;
      oldData = $.data(src);
      curData = $.data(dest, oldData);
      if (oldData = oldData[internalKey]) {
        events = oldData.events;
        curData = curData[internalKey] = jQuery.extend({}, oldData);
        if (events) {
          delete curData.handle;
          curData.events = {};
          for (type in events) {
            i = 0;
            l = events[type].length;
            while (i < l) {
              jQuery.event.add(dest, type + (events[type][i].namespace ? "." : "") + events[type][i].namespace, events[type][i], events[type][i].data);
              i++;
            }
          }
        }
        return null;
      }
    }
  });

  if (typeof Stanbol === "undefined" || Stanbol === null) Stanbol = {};

  Stanbol.getTextAnnotations = function(enhList) {
    var res;
    res = _(enhList).filter(function(e) {
      return e.isof("<" + ns.enhancer + "TextAnnotation>");
    });
    res = _(res).sortBy(function(e) {
      var conf;
      if (e.get("enhancer:confidence")) {
        conf = Number(e.get("enhancer:confidence"));
      }
      return -1 * conf;
    });
    return _(res).map(function(enh) {
      return new Stanbol.TextEnhancement(enh, enhList);
    });
  };

  Stanbol.getEntityAnnotations = function(enhList) {
    return _(enhList).filter(function(e) {
      return e.isof("<" + ns.enhancer + "EntityAnnotation>");
    });
  };

  Stanbol.TextEnhancement = (function() {

    function TextEnhancement(enhancement, enhList) {
      this._enhancement = enhancement;
      this._enhList = enhList;
      this.id = this._enhancement.getSubject();
    }

    TextEnhancement.prototype.getSelectedText = function() {
      return this._vals("enhancer:selected-text");
    };

    TextEnhancement.prototype.getConfidence = function() {
      return this._vals("enhancer:confidence");
    };

    TextEnhancement.prototype.getEntityEnhancements = function() {
      var rawList,
        _this = this;
      rawList = this._enhancement.get("entityAnnotation");
      if (!rawList) return [];
      rawList = _.flatten([rawList]);
      return _(rawList).map(function(ee) {
        return new Stanbol.EntityEnhancement(ee, _this);
      });
    };

    TextEnhancement.prototype.getType = function() {
      return this._uriTrim(this._vals("dc:type"));
    };

    TextEnhancement.prototype.getContext = function() {
      return this._vals("enhancer:selection-context");
    };

    TextEnhancement.prototype.getStart = function() {
      return Number(this._vals("enhancer:start"));
    };

    TextEnhancement.prototype.getEnd = function() {
      return Number(this._vals("enhancer:end"));
    };

    TextEnhancement.prototype.getOrigText = function() {
      var ciUri;
      ciUri = this._vals("enhancer:extracted-from");
      return this._enhList[ciUri]["http://www.semanticdesktop.org/ontologies/2007/01/19/nie#plainTextContent"][0].value;
    };

    TextEnhancement.prototype._vals = function(key) {
      return this._enhancement.get(key);
    };

    TextEnhancement.prototype._uriTrim = function(uriRef) {
      var bbColl, mod;
      if (!uriRef) return [];
      if (uriRef instanceof Backbone.Model || uriRef instanceof Backbone.Collection) {
        bbColl = uriRef;
        return (function() {
          var _i, _len, _ref, _results;
          _ref = bbColl.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            _results.push(mod.get("@subject").replace(/^<|>$/g, ""));
          }
          return _results;
        })();
      } else {

      }
      return _(_.flatten([uriRef])).map(function(ur) {
        return ur.replace(/^<|>$/g, "");
      });
    };

    return TextEnhancement;

  })();

  Stanbol.EntityEnhancement = (function() {

    function EntityEnhancement(ee, textEnh) {
      this._enhancement = ee;
      this._textEnhancement = textEnh;
      this;
    }

    EntityEnhancement.prototype.getLabel = function() {
      return this._vals("enhancer:entity-label").replace(/(^\"*|\"*@..$)/g, "");
    };

    EntityEnhancement.prototype.getUri = function() {
      return this._uriTrim(this._vals("enhancer:entity-reference"))[0];
    };

    EntityEnhancement.prototype.getTextEnhancement = function() {
      return this._textEnhancement;
    };

    EntityEnhancement.prototype.getTypes = function() {
      return this._uriTrim(this._vals("enhancer:entity-type"));
    };

    EntityEnhancement.prototype.getConfidence = function() {
      return Number(this._vals("enhancer:confidence"));
    };

    EntityEnhancement.prototype._vals = function(key) {
      var res;
      res = this._enhancement.get(key);
      if (!res) return [];
      if (res.pluck) {
        return res.pluck("@subject");
      } else {
        return res;
      }
    };

    EntityEnhancement.prototype._uriTrim = function(uriRef) {
      var bbColl, mod;
      if (!uriRef) return [];
      if (uriRef instanceof Backbone.Collection) {
        bbColl = uriRef;
        return (function() {
          var _i, _len, _ref, _results;
          _ref = bbColl.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            _results.push(mod.getSubject().replace(/^<|>$/g, ""));
          }
          return _results;
        })();
      } else if (uriRef instanceof Backbone.Model) {
        uriRef = uriRef.getSubject();
      }
      return _(_.flatten([uriRef])).map(function(ur) {
        return ur.replace(/^<|>$/g, "");
      });
    };

    return EntityEnhancement;

  })();

}).call(this);
