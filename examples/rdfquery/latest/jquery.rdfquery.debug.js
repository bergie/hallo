/*
 * $ URIs @VERSION
 * 
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 */
/**
 * @fileOverview $ URIs
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 */
/**
 * @class
 * @name jQuery
 * @exports $ as jQuery
 * @description rdfQuery is a <a href="http://jquery.com/">jQuery</a> plugin. The only fields and methods listed here are those that come as part of the rdfQuery library.
 */
(function ($) {

  var
    mem = {},
    uriRegex = /^(([a-z][\-a-z0-9+\.]*):)?(\/\/([^\/?#]+))?([^?#]*)?(\?([^#]*))?(#(.*))?$/i,
    docURI,

    parseURI = function (u) {
      var m = u.match(uriRegex);
      if (m === null) {
        throw "Malformed URI: " + u;
      }
      return {
        scheme: m[1] ? m[2].toLowerCase() : undefined,
        authority: m[3] ? m[4] : undefined,
        path: m[5] || '',
        query: m[6] ? m[7] : undefined,
        fragment: m[8] ? m[9] : undefined
      };
    },

    removeDotSegments = function (u) {
      var r = '', m = [];
      if (/\./.test(u)) {
        while (u !== undefined && u !== '') {
          if (u === '.' || u === '..') {
            u = '';
          } else if (/^\.\.\//.test(u)) { // starts with ../
            u = u.substring(3);
          } else if (/^\.\//.test(u)) { // starts with ./
            u = u.substring(2);
          } else if (/^\/\.(\/|$)/.test(u)) { // starts with /./ or consists of /.
            u = '/' + u.substring(3);
          } else if (/^\/\.\.(\/|$)/.test(u)) { // starts with /../ or consists of /..
            u = '/' + u.substring(4);
            r = r.replace(/\/?[^\/]+$/, '');
          } else {
            m = u.match(/^(\/?[^\/]*)(\/.*)?$/);
            u = m[2];
            r = r + m[1];
          }
        }
        return r;
      } else {
        return u;
      }
    },

    merge = function (b, r) {
      if (b.authority !== '' && (b.path === undefined || b.path === '')) {
        return '/' + r;
      } else {
        return b.path.replace(/[^\/]+$/, '') + r;
      }
    };

  /**
   * Creates a new jQuery.uri object. This should be invoked as a method rather than constructed using new.
   * @class Represents a URI
   * @param {String} [relative='']
   * @param {String|jQuery.uri} [base] Defaults to the base URI of the page
   * @returns {jQuery.uri} The new jQuery.uri object.
   * @example uri = jQuery.uri('/my/file.html');
   */
  $.uri = function (relative, base) {
    var uri;
    relative = relative || '';
    if (mem[relative]) {
      return mem[relative];
    }
    base = base || $.uri.base();
    if (typeof base === 'string') {
      base = $.uri.absolute(base);
    }
    uri = new $.uri.fn.init(relative, base);
    if (mem[uri]) {
      return mem[uri];
    } else {
      mem[uri] = uri;
      return uri;
    }
  };

  $.uri.fn = $.uri.prototype = {
    /**
     * The scheme used in the URI
     * @type String
     */
    scheme: undefined,
    /**
     * The authority used in the URI
     * @type String
     */
    authority: undefined,
    /**
     * The path used in the URI
     * @type String
     */
    path: undefined,
    /**
     * The query part of the URI
     * @type String
     */
    query: undefined,
    /**
     * The fragment part of the URI
     * @type String
     */
    fragment: undefined,
    
    init: function (relative, base) {
      var r = {};
      base = base || {};
      $.extend(this, parseURI(relative));
      if (this.scheme === undefined) {
        this.scheme = base.scheme;
        if (this.authority !== undefined) {
          this.path = removeDotSegments(this.path);
        } else {
          this.authority = base.authority;
          if (this.path === '') {
            this.path = base.path;
            if (this.query === undefined) {
              this.query = base.query;
            }
          } else {
            if (!/^\//.test(this.path)) {
              this.path = merge(base, this.path);
            }
            this.path = removeDotSegments(this.path);
          }
        }
      }
      if (this.scheme === undefined) {
        throw "Malformed URI: URI is not an absolute URI and no base supplied: " + relative;
      }
      return this;
    },
  
    /**
     * Resolves a relative URI relative to this URI
     * @param {String} relative
     * @returns jQuery.uri
     */
    resolve: function (relative) {
      return $.uri(relative, this);
    },
    
    /**
     * Creates a relative URI giving the path from this URI to the absolute URI passed as a parameter
     * @param {String|jQuery.uri} absolute
     * @returns String
     */
    relative: function (absolute) {
      var aPath, bPath, i = 0, j, resultPath = [], result = '';
      if (typeof absolute === 'string') {
        absolute = $.uri(absolute, {});
      }
      if (absolute.scheme !== this.scheme || 
          absolute.authority !== this.authority) {
        return absolute.toString();
      }
      if (absolute.path !== this.path) {
        aPath = absolute.path.split('/');
        bPath = this.path.split('/');
        if (aPath[1] !== bPath[1]) {
          result = absolute.path;
        } else {
          while (aPath[i] === bPath[i]) {
            i += 1;
          }
          j = i;
          for (; i < bPath.length - 1; i += 1) {
            resultPath.push('..');
          }
          for (; j < aPath.length; j += 1) {
            resultPath.push(aPath[j]);
          }
          result = resultPath.join('/');
        }
        result = absolute.query === undefined ? result : result + '?' + absolute.query;
        result = absolute.fragment === undefined ? result : result + '#' + absolute.fragment;
        return result;
      }
      if (absolute.query !== undefined && absolute.query !== this.query) {
        return '?' + absolute.query + (absolute.fragment === undefined ? '' : '#' + absolute.fragment);
      }
      if (absolute.fragment !== undefined && absolute.fragment !== this.fragment) {
        return '#' + absolute.fragment;
      }
      return '';
    },
  
    /**
     * Returns the URI as an absolute string
     * @returns String
     */
    toString: function () {
      var result = '';
      if (this._string) {
        return this._string;
      } else {
        result = this.scheme === undefined ? result : (result + this.scheme + ':');
        result = this.authority === undefined ? result : (result + '//' + this.authority);
        result = result + this.path;
        result = this.query === undefined ? result : (result + '?' + this.query);
        result = this.fragment === undefined ? result : (result + '#' + this.fragment);
        this._string = result;
        return result;
      }
    }
  
  };

  $.uri.fn.init.prototype = $.uri.fn;

  /**
   * Creates a {@link jQuery.uri} from a known-to-be-absolute URI
   * @param {String}
   * @returns {jQuery.uri}
   */
  $.uri.absolute = function (uri) {
    return $.uri(uri, {});
  };

  /**
   * Creates a {@link jQuery.uri} from a relative URI and an optional base URI
   * @returns {jQuery.uri}
   * @see jQuery.uri
   */
  $.uri.resolve = function (relative, base) {
    return $.uri(relative, base);
  };
  
  /**
   * Creates a string giving the relative path from a base URI to an absolute URI
   * @param {String} absolute
   * @param {String} base
   * @returns {String}
   */
  $.uri.relative = function (absolute, base) {
    return $.uri(base, {}).relative(absolute);
  };
  
  /**
   * Returns the base URI of the page
   * @returns {jQuery.uri}
   */
  $.uri.base = function () {
    return $(document).base();
  };
  
  /**
   * Returns the base URI in scope for the first selected element
   * @methodOf jQuery#
   * @name jQuery#base
   * @returns {jQuery.uri}
   * @example baseURI = $('img').base();
   */
  $.fn.base = function () {
    var base = $(this).parents().andSelf().find('base').attr('href'),
      doc = $(this)[0].ownerDocument || document,
      docURI = $.uri.absolute(doc.location === null ? document.location.href : doc.location.href);
    return base === undefined ? docURI : $.uri(base, docURI);
  };

})(jQuery);
/*
 * jQuery CURIE @VERSION
 * 
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 */
/**
 * @fileOverview XML Namespace processing
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 * @requires jquery.uri.js
 */

/*global jQuery */
(function ($) {

  var 
    xmlNs = 'http://www.w3.org/XML/1998/namespace',
    xmlnsNs = 'http://www.w3.org/2000/xmlns/',
    
    xmlnsRegex = /\sxmlns(?::([^ =]+))?\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
    
    ncNameChar = '[-A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF\.0-9\u00B7\u0300-\u036F\u203F-\u2040]',
    ncNameStartChar = '[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4-\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7-\u04C8\u04CB-\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8-\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5-\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B36-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60-\u0D61\u0E01-\u0E2E\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EAE\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102-\u1103\u1105-\u1107\u1109\u110B-\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154-\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D-\u116E\u1172-\u1173\u1175\u119E\u11A8\u11AB\u11AE-\u11AF\u11B7-\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A-\u212B\u212E\u2180-\u2182\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\uAC00-\uD7A3\u4E00-\u9FA5\u3007\u3021-\u3029_]',
    ncNameRegex = new RegExp('^' + ncNameStartChar + ncNameChar + '*$');
    

/**
 * Returns the namespaces declared in the scope of the first selected element, or
 * adds a namespace declaration to all selected elements. Pass in no parameters
 * to return all namespaces bindings on the first selected element. If only 
 * the prefix parameter is specified, this method will return the namespace
 * URI that is bound to the specified prefix on the first element in the selection
 * If the prefix and uri parameters are both specified, this method will
 * add the binding of the specified prefix and namespace URI to all elements
 * in the selection.
 * @methodOf jQuery#
 * @name jQuery#xmlns
 * @param {String} [prefix] Restricts the namespaces returned to only the namespace with the specified namespace prefix.
 * @param {String|jQuery.uri} [uri] Adds a namespace declaration to the selected elements that maps the specified prefix to the specified namespace.
 * @param {Object} [inherited] A map of inherited namespace bindings.
 * @returns {Object|jQuery.uri|jQuery}
 * @example 
 * // Retrieve all of the namespace bindings on the HTML document element
 * var nsMap = $('html').xmlns();
 * @example
 * // Retrieve the namespace URI mapped to the 'dc' prefix on the HTML document element
 * var dcNamespace = $('html').xmlns('dc');
 * @example
 * // Create a namespace declaration that binds the 'dc' prefix to the URI 'http://purl.org/dc/elements/1.1/'
 * $('html').xmlns('dc', 'http://purl.org/dc/elements/1.1/');
 */
  $.fn.xmlns = function (prefix, uri, inherited) {
    var 
      elem = this.eq(0),
      ns = elem.data('xmlns'),
      e = elem[0], a, p, i,
      decl = prefix ? 'xmlns:' + prefix : 'xmlns',
      value,
      tag, found = false;
    if (uri === undefined) {
      if (prefix === undefined) { // get the in-scope declarations on the first element
        if (ns === undefined) {
          ns = {
//            xml: $.uri(xmlNs)
          };
          if (e.attributes && e.attributes.getNamedItemNS) {
            for (i = 0; i < e.attributes.length; i += 1) {
              a = e.attributes[i];
              if (/^xmlns(:(.+))?$/.test(a.nodeName)) {
                prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
                value = a.nodeValue;
                if (prefix === '' || (value !== '' && value !== xmlNs && value !== xmlnsNs && ncNameRegex.test(prefix) && prefix !== 'xml' && prefix !== 'xmlns')) {
                  ns[prefix] = $.uri(a.nodeValue);
                  found = true;
                }
              }
            }
          } else {
            tag = /<[^>]+>/.exec(e.outerHTML);
            a = xmlnsRegex.exec(tag);
            while (a !== null) {
              prefix = a[1] || '';
              value = a[2] || a[3];
              if (prefix === '' || (value !== '' && value !== xmlNs && value !== xmlnsNs && ncNameRegex.test(prefix) && prefix !== 'xml' && prefix !== 'xmlns')) {
                ns[prefix] = $.uri(a[2] || a[3]);
                found = true;
              }
              a = xmlnsRegex.exec(tag);
            }
            xmlnsRegex.lastIndex = 0;
          }
          inherited = inherited || (e.parentNode.nodeType === 1 ? elem.parent().xmlns() : {});
          ns = found ? $.extend({}, inherited, ns) : inherited;
          elem.data('xmlns', ns);
        }
        return ns;
      } else if (typeof prefix === 'object') { // set the prefix mappings defined in the object
        for (p in prefix) {
          if (typeof prefix[p] === 'string' && ncNameRegex.test(p)) {
            this.xmlns(p, prefix[p]);
          }
        }
        this.find('*').andSelf().removeData('xmlns');
        return this;
      } else { // get the in-scope declaration associated with this prefix on the first element
        if (ns === undefined) {
          ns = elem.xmlns();
        }
        return ns[prefix];
      }
    } else { // set
      this.find('*').andSelf().removeData('xmlns');
      return this.attr(decl, uri);
    }
  };

/**
 * Removes one or more XML namespace bindings from the selected elements.
 * @methodOf jQuery#
 * @name jQuery#removeXmlns
 * @param {String|Object|String[]} prefix The prefix(es) of the XML namespace bindings that are to be removed from the selected elements.
 * @returns {jQuery} The original jQuery object.
 * @example
 * // Remove the foaf namespace declaration from the body element:
 * $('body').removeXmlns('foaf');
 * @example
 * // Remove the foo and bar namespace declarations from all h2 elements
 * $('h2').removeXmlns(['foo', 'bar']);
 * @example
 * // Remove the foo and bar namespace declarations from all h2 elements
 * var namespaces = { foo : 'http://www.example.org/foo', bar : 'http://www.example.org/bar' };
 * $('h2').removeXmlns(namespaces);
 */
  $.fn.removeXmlns = function (prefix) {
    var decl, p, i;
    if (typeof prefix === 'object') {
      if (prefix.length === undefined) { // assume an object representing namespaces
        for (p in prefix) {
          if (typeof prefix[p] === 'string') {
            this.removeXmlns(p);
          }
        }
      } else { // it's an array
        for (i = 0; i < prefix.length; i += 1) {
          this.removeXmlns(prefix[i]);
        }
      }
    } else {
      decl = prefix ? 'xmlns:' + prefix : 'xmlns';
      this.removeAttr(decl);
    }
    this.find('*').andSelf().removeData('xmlns');
    return this;
  };

  $.fn.qname = function (name) {
    var m, prefix, namespace;
    if (name === undefined) {
      if (this[0].outerHTML === undefined) {
        name = this[0].nodeName.toLowerCase();
      } else {
        name = /<([^ >]+)/.exec(this[0].outerHTML)[1].toLowerCase();
      }
    }
    if (name === '?xml:namespace') {
      // there's a prefix on the name, but we can't get at it
      throw "XMLinHTML: Unable to get the prefix to resolve the name of this element";
    }
    m = /^(([^:]+):)?([^:]+)$/.exec(name);
    prefix = m[2] || '';
    namespace = this.xmlns(prefix);
    if (namespace === undefined && prefix !== '') {
      throw "MalformedQName: The prefix " + prefix + " is not declared";
    }
    return {
      namespace: namespace,
      localPart: m[3],
      prefix: prefix,
      name: name
    };
  };

})(jQuery);
/*
 * jQuery CURIE @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 */
/**
 * @fileOverview XML Schema datatype handling
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 * @requires jquery.uri.js
 */

(function ($) {

  var strip = function (value) {
    return value.replace(/[ \t\n\r]+/, ' ').replace(/^ +/, '').replace(/ +$/, '');
  };

  /**
   * Creates a new jQuery.typedValue object. This should be invoked as a method
   * rather than constructed using new.
   * @class Represents a value with an XML Schema datatype
   * @param {String} value The string representation of the value
   * @param {String} datatype The XML Schema datatype URI
   * @returns {jQuery.typedValue}
   * @example intValue = jQuery.typedValue('42', 'http://www.w3.org/2001/XMLSchema#integer');
   */
  $.typedValue = function (value, datatype) {
    return $.typedValue.fn.init(value, datatype);
  };

  $.typedValue.fn = $.typedValue.prototype = {
    /**
     * The string representation of the value
     * @memberOf jQuery.typedValue#
     */
    representation: undefined,
    /**
     * The value as an object. The type of the object will
     * depend on the XML Schema datatype URI specified
     * in the constructor. The following table lists the mappings
     * currently supported:
     * <table>
     *   <tr>
     *   <th>XML Schema Datatype</th>
     *   <th>Value type</th>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#string</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#token</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#NCName</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#boolean</td>
     *     <td>bool</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#decimal</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#integer</td>
     *     <td>int</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#int</td>
     *     <td>int</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#float</td>
     *     <td>float</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#double</td>
     *     <td>float</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#dateTime</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#date</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#gYear</td>
     *     <td>int</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#gMonthDay</td>
     *     <td>string</td>
     *   </tr>
     *   <tr>
     *     <td>http://www.w3.org/2001/XMLSchema#anyURI</td>
     *     <td>{@link jQuery.uri}</td>
     *   </tr>
     * </table>
     * @memberOf jQuery.typedValue#
     */
    value: undefined,
    /**
     * The XML Schema datatype URI for the value's datatype
     * @memberOf jQuery.typedValue#
     */
    datatype: undefined,

    init: function (value, datatype) {
      var d = $.typedValue.types[datatype];
      if ($.typedValue.valid(value, datatype)) {
        this.representation = value;
        this.datatype = datatype;
        this.value = d === undefined ? strip(value) : d.value(d.strip ? strip(value) : value);
        return this;
      } else {
        throw {
          name: 'InvalidValue',
          message: value + ' is not a valid ' + datatype + ' value'
        };
      }
    }
  };

  $.typedValue.fn.init.prototype = $.typedValue.fn;

  /**
   * An object that holds the datatypes supported by the script. The properties of this object are the URIs of the datatypes, and each datatype has four properties:
   * <dl>
   *   <dt>strip</dt>
   *   <dd>A boolean value that indicates whether whitespace should be stripped from the value prior to testing against the regular expression or passing to the value function.</dd>
   *   <dt>regex</dt>
   *   <dd>A regular expression that valid values of the type must match.</dd>
   *   <dt>validate</dt>
   *   <dd>Optional. A function that performs further testing on the value.</dd>
   *   <dt>value</dt>
   *   <dd>A function that returns a Javascript object equivalent for the value.</dd>
   * </dl>
   * You can add to this object as necessary for your own datatypes, and {@link jQuery.typedValue} and {@link jQuery.typedValue.valid} will work with them.
   * @see jQuery.typedValue
   * @see jQuery.typedValue.valid
   */
  $.typedValue.types = {};

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#string'] = {
    regex: /^.*$/,
    strip: false,
    /** @ignore */
    value: function (v) {
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#token'] = {
    regex: /^.*$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      return strip(v);
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#NCName'] = {
    regex: /^[a-z_][-\.a-z0-9]+$/i,
    strip: true,
    /** @ignore */
    value: function (v) {
      return strip(v);
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#boolean'] = {
    regex: /^(?:true|false|1|0)$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      return v === 'true' || v === '1';
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#decimal'] = {
    regex: /^[\-\+]?(?:[0-9]+\.[0-9]*|\.[0-9]+|[0-9]+)$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      v = v.replace(/^0+/, '')
        .replace(/0+$/, '');
      if (v === '') {
        v = '0.0';
      }
      if (v.substring(0, 1) === '.') {
        v = '0' + v;
      }
      if (/\.$/.test(v)) {
        v = v + '0';
      } else if (!/\./.test(v)) {
        v = v + '.0';
      }
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#integer'] = {
    regex: /^[\-\+]?[0-9]+$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      return parseInt(v, 10);
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#int'] = {
    regex: /^[\-\+]?[0-9]+$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      return parseInt(v, 10);
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#float'] = {
    regex: /^(?:[\-\+]?(?:[0-9]+\.[0-9]*|\.[0-9]+|[0-9]+)(?:[eE][\-\+]?[0-9]+)?|[\-\+]?INF|NaN)$/,
    strip: true,
    /** @ignore */
    value: function (v) {
      if (v === '-INF') {
        return -1 / 0;
      } else if (v === 'INF' || v === '+INF') {
        return 1 / 0;
      } else {
        return parseFloat(v);
      }
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#double'] = {
    regex: $.typedValue.types['http://www.w3.org/2001/XMLSchema#float'].regex,
    strip: true,
    value: $.typedValue.types['http://www.w3.org/2001/XMLSchema#float'].value
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#duration'] = {
    regex: /^([\-\+])?P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+(?:\.[0-9]+))?S)?)$/,
    /** @ignore */
    validate: function (v) {
      var m = this.regex.exec(v);
      return m[2] || m[3] || m[4] || m[5] || m[6] || m[7];
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#yearMonthDuration'] = {
    regex: /^([\-\+])?P(?:([0-9]+)Y)?(?:([0-9]+)M)?$/,
    /** @ignore */
    validate: function (v) {
      var m = this.regex.exec(v);
      return m[2] || m[3];
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      var m = this.regex.exec(v),
        years = m[2] || 0,
        months = m[3] || 0;
      months += years * 12;
      return m[1] === '-' ? -1 * months : months;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#dateTime'] = {
    regex: /^(-?[0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):(([0-9]{2})(\.([0-9]+))?)((?:[\-\+]([0-9]{2}):([0-9]{2}))|Z)?$/,
    /** @ignore */
    validate: function (v) {
      var
        m = this.regex.exec(v),
        year = parseInt(m[1], 10),
        tz = m[10] === undefined || m[10] === 'Z' ? '+0000' : m[10].replace(/:/, ''),
        date;
      if (year === 0 ||
          parseInt(tz, 10) < -1400 || parseInt(tz, 10) > 1400) {
        return false;
      }
      try {
        year = year < 100 ? Math.abs(year) + 1000 : year;
        month = parseInt(m[2], 10);
        day = parseInt(m[3], 10);
        if (day > 31) {
          return false;
        } else if (day > 30 && !(month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12)) {
          return false;
        } else if (month === 2) {
          if (day > 29) {
            return false;
          } else if (day === 29 && (year % 4 !== 0 || (year % 100 === 0 && year % 400 !== 0))) {
            return false;
          }
        }
        date = '' + year + '/' + m[2] + '/' + m[3] + ' ' + m[4] + ':' + m[5] + ':' + m[7] + ' ' + tz;
        date = new Date(date);
        return true;
      } catch (e) {
        return false;
      }
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#date'] = {
    regex: /^(-?[0-9]{4,})-([0-9]{2})-([0-9]{2})((?:[\-\+]([0-9]{2}):([0-9]{2}))|Z)?$/,
    /** @ignore */
    validate: function (v) {
      var
        m = this.regex.exec(v),
        year = parseInt(m[1], 10),
        month = parseInt(m[2], 10),
        day = parseInt(m[3], 10),
        tz = m[10] === undefined || m[10] === 'Z' ? '+0000' : m[10].replace(/:/, '');
      if (year === 0 ||
          month > 12 ||
          day > 31 ||
          parseInt(tz, 10) < -1400 || parseInt(tz, 10) > 1400) {
        return false;
      } else {
        return true;
      }
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#gYear'] = {
    regex: /^-?([0-9]{4,})$/,
    /** @ignore */
    validate: function (v) {
      var i = parseInt(v, 10);
      return i !== 0;
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      return parseInt(v, 10);
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#gMonthDay'] = {
    regex: /^--([0-9]{2})-([0-9]{2})((?:[\-\+]([0-9]{2}):([0-9]{2}))|Z)?$/,
    /** @ignore */
    validate: function (v) {
      var
        m = this.regex.exec(v),
        month = parseInt(m[1], 10),
        day = parseInt(m[2], 10),
        tz = m[3] === undefined || m[3] === 'Z' ? '+0000' : m[3].replace(/:/, '');
      if (month > 12 ||
          day > 31 ||
          parseInt(tz, 10) < -1400 || parseInt(tz, 10) > 1400) {
        return false;
      } else if (month === 2 && day > 29) {
        return false;
      } else if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
        return false;
      } else {
        return true;
      }
    },
    strip: true,
    /** @ignore */
    value: function (v) {
      return v;
    }
  };

  $.typedValue.types['http://www.w3.org/2001/XMLSchema#anyURI'] = {
    regex: /^.*$/,
    strip: true,
    /** @ignore */
    value: function (v, options) {
      var opts = $.extend({}, $.typedValue.defaults, options);
      return $.uri.resolve(v, opts.base);
    }
  };

  $.typedValue.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  /**
   * Checks whether a value is valid according to a given datatype. The datatype must be held in the {@link jQuery.typedValue.types} object.
   * @param {String} value The value to validate.
   * @param {String} datatype The URI for the datatype against which the value will be validated.
   * @returns {boolean} True if the value is valid or the datatype is not recognised.
   * @example validDate = $.typedValue.valid(date, 'http://www.w3.org/2001/XMLSchema#date');
   */
  $.typedValue.valid = function (value, datatype) {
    var d = $.typedValue.types[datatype];
    if (d === undefined) {
      return true;
    } else {
      value = d.strip ? strip(value) : value;
      if (d.regex.test(value)) {
        return d.validate === undefined ? true : d.validate(value);
      } else {
        return false;
      }
    }
  };

})(jQuery);
/*
 * jQuery CURIE @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 */

/**
 * @fileOverview jQuery CURIE handling
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 * @requires jquery.uri.js
 * @requires jquery.xmlns.js
 */
(function ($) {

   /**
    * Creates a {@link jQuery.uri} object by parsing a CURIE.
    * @methodOf jQuery
    * @param {String} curie The CURIE to be parsed
    * @param {String} uri The URI string to be converted to a CURIE.
    * @param {Object} [options] CURIE parsing options
    * @param {string} [options.reservedNamespace='http://www.w3.org/1999/xhtml/vocab#'] The namespace to apply to a CURIE that has no prefix and either starts with a colon or is in the list of reserved local names
    * @param {string} [options.defaultNamespace]  The namespace to apply to a CURIE with no prefix which is not mapped to the reserved namespace by the rules given above.
    * @param {Object} [options.namespaces] A map of namespace bindings used to map CURIE prefixes to URIs.
    * @param {string[]} [options.reserved=['alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright', 'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next', 'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up']] A list of local names that will always be mapped to the URI specified by reservedNamespace.
    * @param {string} [options.charcase='lower'] Specifies whether the curie's case is altered before it's interpreted. Acceptable values are:
    * <dl>
    * <dt>lower</dt><dd>Force the CURIE string to lower case.</dd>
    * <dt>upper</dt><dd>Force the CURIE string to upper case.</dd>
    * <dt>preserve</dt><dd>Preserve the original case of the CURIE. Note that this might not be possible if the CURIE has been taken from an HTML attribute value because of the case conversions performed automatically by browsers. For this reason, it's a good idea to avoid mixed-case CURIEs within RDFa.</dd>
    * </dl>
    * @returns {jQuery.uri} A new {@link jQuery.uri} object representing the full absolute URI specified by the CURIE.
    */
  $.curie = function (curie, options) {
    var
      opts = $.extend({}, $.curie.defaults, options || {}),
      m = /^(([^:]*):)?(.+)$/.exec(curie),
      prefix = m[2],
      local = m[3],
      ns = opts.namespaces[prefix];
    if (/^:.+/.test(curie)) { // This is the case of a CURIE like ":test"
      if (opts.reservedNamespace === undefined || opts.reservedNamespace === null) {
        throw "Malformed CURIE: No prefix and no default namespace for unprefixed CURIE " + curie;
      } else {
        ns = opts.reservedNamespace;
      }
    } else if (prefix) {
      if (ns === undefined) {
        throw "Malformed CURIE: No namespace binding for " + prefix + " in CURIE " + curie;
      }
    } else {
      if (opts.charcase === 'lower') {
        curie = curie.toLowerCase();
      } else if (opts.charcase === 'upper') {
        curie = curie.toUpperCase();
      }
      if (opts.reserved.length && $.inArray(curie, opts.reserved) >= 0) {
        ns = opts.reservedNamespace;
        local = curie;
      } else if (opts.defaultNamespace === undefined || opts.defaultNamespace === null) {
        // the default namespace is provided by the application; it's not clear whether
        // the default XML namespace should be used if there's a colon but no prefix
        throw "Malformed CURIE: No prefix and no default namespace for unprefixed CURIE " + curie;
      } else {
        ns = opts.defaultNamespace;
      }
    }
    return $.uri(ns + local);
  };

  $.curie.defaults = {
    namespaces: {},
    reserved: [],
    reservedNamespace: undefined,
    defaultNamespace: undefined,
    charcase: 'preserve'
  };

   /**
    * Creates a {@link jQuery.uri} object by parsing a safe CURIE string (a CURIE
    * contained within square brackets). If the input safeCurie string does not
    * start with '[' and end with ']', the entire string content will be interpreted
    * as a URI string.
    * @methodOf jQuery
    * @param {String} safeCurie The safe CURIE string to be parsed.
    * @param {Object} [options] CURIE parsing options
    * @param {string} [options.reservedNamespace='http://www.w3.org/1999/xhtml/vocab#'] The namespace to apply to a CURIE that has no prefix and either starts with a colon or is in the list of reserved local names
    * @param {string} [options.defaultNamespace]  The namespace to apply to a CURIE with no prefix which is not mapped to the reserved namespace by the rules given above.
    * @param {Object} [options.namespaces] A map of namespace bindings used to map CURIE prefixes to URIs.
    * @param {string[]} [options.reserved=['alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright',
      'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
      'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up']]
                        A list of local names that will always be mapped to the URI specified by reservedNamespace.
    * @param {string} [options.charcase='lower'] Specifies whether the curie's case is altered before it's interpreted. Acceptable values are:
    * <dl>
    * <dt>lower</dt><dd>Force the CURIE string to lower case.</dd>
    * <dt>upper</dt><dd>Force the CURIE string to upper case.</dd>
    * <dt>preserve</dt><dd>Preserve the original case of the CURIE. Note that this might not be possible if the CURIE has been taken from an HTML attribute value because of the case conversions performed automatically by browsers. For this reason, it's a good idea to avoid mixed-case CURIEs within RDFa.</dd>
    * </dl>
    * @returns {jQuery.uri} A new {@link jQuery.uri} object representing the full absolute URI specified by the CURIE.
    */
  $.safeCurie = function (safeCurie, options) {
    var m = /^\[([^\]]+)\]$/.exec(safeCurie);
    return m ? $.curie(m[1], options) : $.uri(safeCurie);
  };

   /**
    * Creates a CURIE string from a URI string.
    * @methodOf jQuery
    * @param {String} uri The URI string to be converted to a CURIE.
    * @param {Object} [options] CURIE parsing options
    * @param {string} [options.reservedNamespace='http://www.w3.org/1999/xhtml/vocab#']
    *        If the input URI starts with this value, the generated CURIE will
    *        have no namespace prefix and will start with a colon character (:),
    *        unless the local part of the CURIE is one of the reserved names specified
    *        by the reservedNames option (see below), in which case the generated
    *        CURIE will have no namespace prefix and will not start with a colon
    *        character.
    * @param {string} [options.defaultNamespace]  If the input URI starts with this value, the generated CURIE will have no namespace prefix and will not start with a colon.
    * @param {Object} [options.namespaces] A map of namespace bindings used to map CURIE prefixes to URIs.
    * @param {string[]} [options.reserved=['alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright',
      'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
      'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up']]
                        A list of local names that will always be mapped to the URI specified by reservedNamespace.
    * @param {string} [options.charcase='lower'] Specifies the case normalisation done to the CURIE. Acceptable values are:
    * <dl>
    * <dt>lower</dt><dd>Normalise the CURIE to lower case.</dd>
    * <dt>upper</dt><dd>Normalise the CURIE to upper case.</dd>
    * <dt>preserve</dt><dd>Preserve the original case of the CURIE. Note that this might not be possible if the CURIE has been taken from an HTML attribute value because of the case conversions performed automatically by browsers. For this reason, it's a good idea to avoid mixed-case CURIEs within RDFa.</dd>
    * </dl>
    * @returns {jQuery.uri} A new {@link jQuery.uri} object representing the full absolute URI specified by the CURIE.
    */
  $.createCurie = function (uri, options) {
    var opts = $.extend({}, $.curie.defaults, options || {}),
      ns = opts.namespaces,
      curie;
    uri = $.uri(uri).toString();
    if (opts.reservedNamespace !== undefined && 
        uri.substring(0, opts.reservedNamespace.toString().length) === opts.reservedNamespace.toString()) {
      curie = uri.substring(opts.reservedNamespace.toString().length);
      if ($.inArray(curie, opts.reserved) === -1) {
        curie = ':' + curie;
      }
    } else {
      $.each(ns, function (prefix, namespace) {
        if (uri.substring(0, namespace.toString().length) === namespace.toString()) {
          curie = prefix + ':' + uri.substring(namespace.toString().length);
          return null;
        }
      });
    }
    if (curie === undefined) {
      throw "No Namespace Binding: There's no appropriate namespace binding for generating a CURIE from " + uri;
    } else {
      return curie;
    }
  };

   /**
    * Creates a {@link jQuery.uri} object by parsing the specified
    * CURIE string in the context of the namespaces defined by the
    * jQuery selection.
    * @methodOf jQuery#
    * @name jQuery#curie
    * @param {String} curie The CURIE string to be parsed
    * @param {Object} options The CURIE parsing options.
    *        See {@link jQuery.curie} for details of the supported options.
    *        The namespace declarations declared on the current jQuery
    *        selection (and inherited from any ancestor elements) will automatically
    *        be included in the options.namespaces property.
    * @returns {jQuery.uri}
    * @see jQuery.curie
    */
  $.fn.curie = function (curie, options) {
    var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
    return $.curie(curie, opts);
  };

   /**
    * Creates a {@link jQuery.uri} object by parsing the specified
    * safe CURIE string in the context of the namespaces defined by
    * the jQuery selection.
    *
    * @methodOf jQuery#
    * @name jQuery#safeCurie
    * @param {String} safeCurie The safe CURIE string to be parsed. See {@link jQuery.safeCurie} for details on how safe CURIE strings are processed.
    * @param {Object} options   The CURIE parsing options.
    *        See {@link jQuery.safeCurie} for details of the supported options.
    *        The namespace declarations declared on the current jQuery
    *        selection (and inherited from any ancestor elements) will automatically
    *        be included in the options.namespaces property.
    * @returns {jQuery.uri}
    * @see jQuery.safeCurie
    */
  $.fn.safeCurie = function (safeCurie, options) {
    var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
    return $.safeCurie(safeCurie, opts);
  };

   /**
    * Creates a CURIE string from a URI string using the namespace
    * bindings in the context of the current jQuery selection.
    *
    * @methodOf jQuery#
    * @name jQuery#createCurie
    * @param {String|jQuery.uri} uri The URI string to be converted to a CURIE
    * @param {Object} options the CURIE parsing options.
    *        See {@link jQuery.createCurie} for details of the supported options.
    *        The namespace declarations declared on the current jQuery
    *        selection (and inherited from any ancestor elements) will automatically
    *        be included in the options.namespaces property.
    * @returns {String}
    * @see jQuery.createCurie
    */
  $.fn.createCurie = function (uri, options) {
    var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
    return $.createCurie(uri, opts);
  };

  $.fn.curie.defaults = {
    reserved: [
      'alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright',
      'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
      'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up'
    ],
    reservedNamespace: 'http://www.w3.org/1999/xhtml/vocab#',
    defaultNamespace: undefined,
    charcase: 'lower'
  };

})(jQuery);
/*
 * jQuery RDF @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 *  jquery.json.js
 */
/**
 * @fileOverview jQuery RDF
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 */
/**
 * @exports $ as jQuery
 */
/**
 * @ignore
 */
(function ($) {
  var
    memResource = {},
    memBlank = {},
    memLiteral = {},
    memTriple = {},
    memPattern = {},
    
    xsdNs = "http://www.w3.org/2001/XMLSchema#",
    rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfsNs = "http://www.w3.org/2000/01/rdf-schema#",
    
    uriRegex = /^<(([^>]|\\>)*)>$/,
    literalRegex = /^("""((\\"|[^"])*)"""|"((\\"|[^"])*)")(@([a-z]+(-[a-z0-9]+)*)|\^\^(.+))?$/,
    tripleRegex = /(("""((\\"|[^"])*)""")|("(\\"|[^"]|)*")|(<(\\>|[^>])*>)|\S)+/g,

    blankNodeSeed = databankSeed = new Date().getTime() % 1000,
    blankNodeID = function () {
      blankNodeSeed += 1;
      return 'b' + blankNodeSeed.toString(16);
    },

    databankID = function () {
      databankSeed += 1;
      return 'data' + databankSeed.toString(16);
    },
    databanks = {},

    documentQueue = {},

    subject = function (subject, opts) {
      if (typeof subject === 'string') {
        try {
          return $.rdf.resource(subject, opts);
        } catch (e) {
          try {
            return $.rdf.blank(subject, opts);
          } catch (f) {
            throw "Bad Triple: Subject " + subject + " is not a resource: " + f;
          }
        }
      } else {
        return subject;
      }
    },

    property = function (property, opts) {
      if (property === 'a') {
        return $.rdf.type;
      } else if (typeof property === 'string') {
        try {
          return $.rdf.resource(property, opts);
        } catch (e) {
          throw "Bad Triple: Property " + property + " is not a resource: " + e;
        }
      } else {
        return property;
      }
    },

    object = function (object, opts) {
      if (typeof object === 'string') {
        try {
          return $.rdf.resource(object, opts);
        } catch (e) {
          try {
            return $.rdf.blank(object, opts);
          } catch (f) {
            try {
              return $.rdf.literal(object, opts);
            } catch (g) {
              throw "Bad Triple: Object " + object + " is not a resource or a literal " + g;
            }
          }
        }
      } else {
        return object;
      }
    },

    testResource = function (resource, filter, existing) {
      var variable;
      if (typeof filter === 'string') {
        variable = filter.substring(1);
        if (existing[variable] && existing[variable] !== resource) {
          return null;
        } else {
          existing[variable] = resource;
          return existing;
        }
      } else if (filter === resource) {
        return existing;
      } else {
        return null;
      }
    },

    findMatches = function (databank, pattern) {
      if (databank.union === undefined) {
        if (pattern.subject.type !== undefined) {
          if (databank.subjectIndex[pattern.subject] === undefined) {
            return [];
          }
          return $.map(databank.subjectIndex[pattern.subject], function (triple) {
            var bindings = pattern.exec(triple);
            return bindings === null ? null : { bindings: bindings, triples: [triple] };
          });
        } else if (pattern.object.type === 'uri' || pattern.object.type === 'bnode') {
          if (databank.objectIndex[pattern.object] === undefined) {
            return [];
          }
          return $.map(databank.objectIndex[pattern.object], function (triple) {
            var bindings = pattern.exec(triple);
            return bindings === null ? null : { bindings: bindings, triples: [triple] };
          });
        } else if (pattern.property.type !== undefined) {
          if (databank.propertyIndex[pattern.property] === undefined) {
            return [];
          }
          return $.map(databank.propertyIndex[pattern.property], function (triple) {
            var bindings = pattern.exec(triple);
            return bindings === null ? null : { bindings: bindings, triples: [triple] };
          });
        }
      }
      return $.map(databank.triples(), function (triple) {
        var bindings = pattern.exec(triple);
        return bindings === null ? null : { bindings: bindings, triples: [triple] };
      });
    },
    
    mergeMatches = function (existingMs, newMs, optional) {
      return $.map(existingMs, function (existingM, i) {
        var compatibleMs = $.map(newMs, function (newM) {
          // For newM to be compatible with existingM, all the bindings
          // in newM must either be the same as in existingM, or not
          // exist in existingM
          var k, b, isCompatible = true;
          for (k in newM.bindings) {
            b = newM.bindings[k];
            if (!(existingM.bindings[k] === undefined ||
                  existingM.bindings[k] === b)) {
              isCompatible = false;
              break;
            }
          }
          return isCompatible ? newM : null;
        });
        if (compatibleMs.length > 0) {
          return $.map(compatibleMs, function (compatibleM) {
            return {
              bindings: $.extend({}, existingM.bindings, compatibleM.bindings),
              triples: $.unique(existingM.triples.concat(compatibleM.triples))
            };
          });
        } else {
          return optional ? existingM : null;
        }
      });
    },

    registerQuery = function (databank, query) {
      var s, p, o;
      if (query.filterExp !== undefined && !$.isFunction(query.filterExp)) {
        if (databank.union === undefined) {
          s = typeof query.filterExp.subject === 'string' ? '' : query.filterExp.subject;
          p = typeof query.filterExp.property === 'string' ? '' : query.filterExp.property;
          o = typeof query.filterExp.object === 'string' ? '' : query.filterExp.object;
          if (databank.queries[s] === undefined) {
            databank.queries[s] = {};
          }
          if (databank.queries[s][p] === undefined) {
            databank.queries[s][p] = {};
          }
          if (databank.queries[s][p][o] === undefined) {
            databank.queries[s][p][o] = [];
          }
          databank.queries[s][p][o].push(query);
        } else {
          $.each(databank.union, function (i, databank) {
            registerQuery(databank, query);
          });
        }
      }
    },

    resetQuery = function (query) {
      query.length = 0;
      query.matches = [];
      $.each(query.children, function (i, child) {
        resetQuery(child);
      });
      $.each(query.partOf, function (i, union) {
        resetQuery(union);
      });
    },

    updateQuery = function (query, matches) {
      if (matches.length > 0) {
        $.each(query.children, function (i, child) {
          leftActivate(child, matches);
        });
        $.each(query.partOf, function (i, union) {
          updateQuery(union, matches);
        });
        $.each(matches, function (i, match) {
          query.matches.push(match);
          Array.prototype.push.call(query, match.bindings);
        });
      }
    },

    filterMatches = function (matches, variables) {
      var i, bindings, triples, j, k, variable, value, nvariables = variables.length,
        newbindings, match = {}, keyobject = {}, keys = {}, filtered = [];
      for (i = 0; i < matches.length; i += 1) {
        bindings = matches[i].bindings;
        triples = matches[i].triples;
        keyobject = keys;
        for (j = 0; j < nvariables; j += 1) {
          variable = variables[j];
          value = bindings[variable];
          if (j === nvariables - 1) {
            if (keyobject[value] === undefined) {
              match = { bindings: {}, triples: triples };
              for (k = 0; k < nvariables; k += 1) {
                match.bindings[variables[k]] = bindings[variables[k]];
              }
              keyobject[value] = match;
              filtered.push(match);
            } else {
              match = keyobject[value];
              match.triples = match.triples.concat(triples);
            }
          } else {
            if (keyobject[value] === undefined) {
              keyobject[value] = {};
            }
            keyobject = keyobject[value];
          }
        }
      }
      return filtered;
    },

    renameMatches = function (matches, old) {
      var i, match, newMatch, keys = {}, renamed = [];
      for (i = 0; i < matches.length; i += 1) {
        match = matches[i];
        if (keys[match.bindings[old]] === undefined) {
          newMatch = {
            bindings: { node: match.bindings[old] },
            triples: match.triples
          };
          renamed.push(newMatch);
          keys[match.bindings[old]] = newMatch;
        } else {
          newMatch = keys[match.bindings[old]];
          newMatch.triples = newMatch.triples.concat(match.triples);
        }
      }
      return renamed;
    },

    leftActivate = function (query, matches) {
      var newMatches;
      if (query.union === undefined) {
        if (query.top || query.parent.top) {
          newMatches = query.alphaMemory;
        } else {
          matches = matches || query.parent.matches;
          if ($.isFunction(query.filterExp)) {
            newMatches = $.map(matches, function (match, i) {
              return query.filterExp.call(match.bindings, i, match.bindings, match.triples) ? match : null;
            });
          } else if (query.filterExp !== undefined) {
            newMatches = mergeMatches(matches, query.alphaMemory, query.filterExp.optional);
          } else {
            newMatches = matches;
          }
        }
      } else {
        newMatches = $.map(query.union, function (q) {
          return q.matches;
        });
      }
      if (query.selections !== undefined) {
        newMatches = filterMatches(newMatches, query.selections);
      } else if (query.navigate !== undefined) {
        newMatches = renameMatches(newMatches, query.navigate);
      }
      updateQuery(query, newMatches);
    },

    rightActivate = function (query, match) {
      var newMatches;
      if (query.filterExp.optional) {
        resetQuery(query);
        leftActivate(query);
      } else {
        if (query.top || query.parent.top) {
          newMatches = [match];
        } else {
          newMatches = mergeMatches(query.parent.matches, [match], false);
        }
        updateQuery(query, newMatches);
      }
    },

    addToQuery = function (query, triple) {
      var match,
        bindings = query.filterExp.exec(triple);
      if (bindings !== null) {
        match = { triples: [triple], bindings: bindings };
        query.alphaMemory.push(match);
        rightActivate(query, match);
      }
    },

    removeFromQuery = function (query, triple) {
      query.alphaMemory.splice($.inArray(triple, query.alphaMemory), 1);
      resetQuery(query);
      leftActivate(query);
    },

    addToQueries = function (queries, triple) {
      $.each(queries, function (i, query) {
        addToQuery(query, triple);
      });
    },

    removeFromQueries = function (queries, triple) {
      $.each(queries, function (i, query) {
        removeFromQuery(query, triple);
      });
    },

    addToDatabankQueries = function (databank, triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object;
      if (databank.union === undefined) {
        if (databank.queries[s] !== undefined) {
          if (databank.queries[s][p] !== undefined) {
            if (databank.queries[s][p][o] !== undefined) {
              addToQueries(databank.queries[s][p][o], triple);
            }
            if (databank.queries[s][p][''] !== undefined) {
              addToQueries(databank.queries[s][p][''], triple);
            }
          }
          if (databank.queries[s][''] !== undefined) {
            if (databank.queries[s][''][o] !== undefined) {
              addToQueries(databank.queries[s][''][o], triple);
            }
            if (databank.queries[s][''][''] !== undefined) {
              addToQueries(databank.queries[s][''][''], triple);
            }
          }
        }
        if (databank.queries[''] !== undefined) {
          if (databank.queries[''][p] !== undefined) {
            if (databank.queries[''][p][o] !== undefined) {
              addToQueries(databank.queries[''][p][o], triple);
            }
            if (databank.queries[''][p][''] !== undefined) {
              addToQueries(databank.queries[''][p][''], triple);
            }
          }
          if (databank.queries[''][''] !== undefined) {
            if (databank.queries[''][''][o] !== undefined) {
              addToQueries(databank.queries[''][''][o], triple);
            }
            if (databank.queries[''][''][''] !== undefined) {
              addToQueries(databank.queries[''][''][''], triple);
            }
          }
        }
      } else {
        $.each(databank.union, function (i, databank) {
          addToDatabankQueries(databank, triple);
        });
      }
    },

    removeFromDatabankQueries = function (databank, triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object;
      if (databank.union === undefined) {
        if (databank.queries[s] !== undefined) {
          if (databank.queries[s][p] !== undefined) {
            if (databank.queries[s][p][o] !== undefined) {
              removeFromQueries(databank.queries[s][p][o], triple);
            }
            if (databank.queries[s][p][''] !== undefined) {
              removeFromQueries(databank.queries[s][p][''], triple);
            }
          }
          if (databank.queries[s][''] !== undefined) {
            if (databank.queries[s][''][o] !== undefined) {
              removeFromQueries(databank.queries[s][''][o], triple);
            }
            if (databank.queries[s][''][''] !== undefined) {
              removeFromQueries(databank.queries[s][''][''], triple);
            }
          }
        }
        if (databank.queries[''] !== undefined) {
          if (databank.queries[''][p] !== undefined) {
            if (databank.queries[''][p][o] !== undefined) {
              removeFromQueries(databank.queries[''][p][o], triple);
            }
            if (databank.queries[''][p][''] !== undefined) {
              removeFromQueries(databank.queries[''][p][''], triple);
            }
          }
          if (databank.queries[''][''] !== undefined) {
            if (databank.queries[''][''][o] !== undefined) {
              removeFromQueries(databank.queries[''][''][o], triple);
            }
            if (databank.queries[''][''][''] !== undefined) {
              removeFromQueries(databank.queries[''][''][''], triple);
            }
          }
        }
      } else {
        $.each(databank.union, function (i, databank) {
          removeFromDatabankQueries(databank, triple);
        });
      }
    },
    
    group = function (bindings, variables, base) {
      var variable = variables[0], grouped = {}, results = [], i, newbase;
      base = base || {};
      if (variables.length === 0) {
        for (i = 0; i < bindings.length; i += 1) {
          for (v in bindings[i]) {
            if (base[v] === undefined) {
              base[v] = [];
            }
            if ($.isArray(base[v])) {
              base[v].push(bindings[i][v]);
            }
          }
        }
        return [base];
      }
      // collect together the grouped results
      for (i = 0; i < bindings.length; i += 1) {
        key = bindings[i][variable];
        if (grouped[key] === undefined) {
          grouped[key] = [];
        }
        grouped[key].push(bindings[i]);
      }
      // call recursively on each group
      variables = variables.splice(1, 1);
      for (v in grouped) {
        newbase = $.extend({}, base);
        newbase[variable] = grouped[v][0][variable];
        results = results.concat(group(grouped[v], variables, newbase));
      }
      return results;
    },
    
    queue = function (databank, url, callbacks) {
      if (documentQueue[databank.id] === undefined) {
        documentQueue[databank.id] = {};
      }
      if (documentQueue[databank.id][url] === undefined) {
        documentQueue[databank.id][url] = callbacks;
        return false;
      }
      return true;
    }
    
    dequeue = function (databank, url, result, args) {
      var callbacks = documentQueue[databank.id][url];
      if ($.isFunction(callbacks[result])) {
        callbacks[result].call(databank, args);
      }
      documentQueue[databank.id][url] = undefined;
    };

  $.typedValue.types['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'] = {
    regex: /^.*$/m,
    strip: false,
    value: function (v) {
      return v;
    }
  };

  /**
   * <p>Creates a new jQuery.rdf object. This should be invoked as a method rather than constructed using new; indeed you will usually want to generate these objects using a method such as {@link jQuery#rdf} or {@link jQuery.rdf#where}.</p>
   * @class <p>A jQuery.rdf object represents the results of a query over its {@link jQuery.rdf#databank}. The results of a query are a sequence of objects which represent the bindings of values to the variables used in filter expressions specified using {@link jQuery.rdf#where} or {@link jQuery.rdf#optional}. Each of the objects in this sequence has associated with it a set of triples that are the sources for the variable bindings, which you can get at using {@link jQuery.rdf#sources}.</p>
    * <p>The {@link jQuery.rdf} object itself is a lot like a {@link jQuery} object. It has a {@link jQuery.rdf#length} and the individual matches can be accessed using <code>[<var>n</var>]</code>, but you can also iterate through the matches using {@link jQuery.rdf#map} or {@link jQuery.rdf#each}.</p>
    * <p>{@link jQuery.rdf} is designed to mirror the functionality of <a href="http://www.w3.org/TR/rdf-sparql-query/">SPARQL</a> while providing an interface that's familiar and easy to use for jQuery programmers.</p>
   * @param {Object} [options]
   * @param {jQuery.rdf.databank} [options.databank] The databank that this query should operate over.
   * @param {jQuery.rdf.triple[]} [options.triples] A set of triples over which the query operates; this is only used if options.databank isn't specified, in which case a new databank with these triples is generated.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings. Rather than passing this in when you construct the {@link jQuery.rdf} instance, you will usually want to use the {@link jQuery.rdf#prefix} method.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the query.
   * @returns {jQuery.rdf}
   * @example rdf = jQuery.rdf();
   * @see jQuery#rdf
   */
  $.rdf = function (options) {
    return new $.rdf.fn.init(options);
  };

  $.rdf.fn = $.rdf.prototype = {
    /**
     * The version of rdfQuery.
     * @type String
     */
    rdfquery: '1.1',

    init: function (options) {
      var databanks, i;
      options = options || {};
      /* must specify either a parent or a union, otherwise it's the top */
      this.parent = options.parent;
      this.union = options.union;
      this.top = this.parent === undefined && this.union === undefined;
      if (this.union === undefined) {
        if (options.databank === undefined) {
          /**
           * The databank over which this query operates.
           * @type jQuery.rdf.databank
           */
          this.databank = this.parent === undefined ? $.rdf.databank(options.triples, options) : this.parent.databank;
        } else {
          this.databank = options.databank;
        }
      } else {
        databanks = $.map(this.union, function (query) {
          return query.databank;
        });
        databanks = $.unique(databanks);
        if (databanks[1] !== undefined) {
          this.databank = $.rdf.databank(undefined, { union: databanks });
        } else {
          this.databank = databanks[0];
        }
      }
      this.children = [];
      this.partOf = [];
      this.filterExp = options.filter;
      this.selections = options.distinct;
      this.navigate = options.navigate;
      this.alphaMemory = [];
      this.matches = [];
      /**
       * The number of matches represented by the {@link jQuery.rdf} object.
       * @type Integer
       */
      this.length = 0;
      if (this.filterExp !== undefined) {
        if (!$.isFunction(this.filterExp)) {
          registerQuery(this.databank, this);
          this.alphaMemory = findMatches(this.databank, this.filterExp);
        }
      } else if (options.nodes !== undefined) {
        this.alphaMemory = [];
        for (i = 0; i < options.nodes.length; i += 1) {
          this.alphaMemory.push({
            bindings: { node: options.nodes[i] },
            triples: []
          });
        }
      }
      leftActivate(this);
      return this;
    },

    /**
     * Sets or returns the base URI of the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [base]
     * @returns A {@link jQuery.uri} if no base URI is specified, otherwise returns this {@link jQuery.rdf} object.
     * @example baseURI = jQuery('html').rdf().base();
     * @example jQuery('html').rdf().base('http://www.example.org/');
     * @see jQuery.rdf.databank#base
     */
    base: function (base) {
      if (base === undefined) {
        return this.databank.base();
      } else {
        this.databank.base(base);
        return this;
      }
    },

    /**
     * Sets or returns a namespace binding on the {@link jQuery.rdf#databank}.
     * @param {String} [prefix]
     * @param {String} [namespace]
     * @returns {Object|jQuery.uri|jQuery.rdf} If no prefix or namespace is specified, returns an object providing all namespace bindings on the {@link jQuery.rdf.databank}. If a prefix is specified without a namespace, returns the {@link jQuery.uri} associated with that prefix. Otherwise returns this {@link jQuery.rdf} object after setting the namespace binding.
     * @example namespace = jQuery('html').rdf().prefix('foaf');
     * @example jQuery('html').rdf().prefix('foaf', 'http://xmlns.com/foaf/0.1/');
     * @see jQuery.rdf.databank#prefix
     */
    prefix: function (prefix, namespace) {
      if (namespace === undefined) {
        return this.databank.prefix(prefix);
      } else {
        this.databank.prefix(prefix, namespace);
        return this;
      }
    },

    /**
     * Adds a triple to the {@link jQuery.rdf#databank} or another {@link jQuery.rdf} object to create a union.
     * @param {String|jQuery.rdf.triple|jQuery.rdf.pattern|jQuery.rdf} triple The triple, {@link jQuery.rdf.pattern} or {@link jQuery.rdf} object to be added to this one. If the triple is a {@link jQuery.rdf} object, the two queries are unioned together. If the triple is a string, it's parsed as a {@link jQuery.rdf.pattern}. The pattern will be completed using the current matches on the {@link jQuery.rdf} object to create multiple triples, one for each set of bindings.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret CURIEs within the triple. Defaults to the namespace bindings defined on the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the triple. Defaults to the base URI defined on the {@link jQuery.rdf#databank}.
     * @returns {jQuery.rdf} This {@link jQuery.rdf} object.
     * @example
     * var rdf = $.rdf()
     *   .prefix('dc', ns.dc)
     *   .prefix('foaf', ns.foaf)
     *   .add('&lt;photo1.jpg> dc:creator &lt;http://www.blogger.com/profile/1109404> .')
     *   .add('&lt;http://www.blogger.com/profile/1109404> foaf:img &lt;photo1.jpg> .');
     * @example
     * var rdfA = $.rdf()
     *   .prefix('dc', ns.dc)
     *   .add('&lt;photo1.jpg> dc:creator "Jane"');
     * var rdfB = $.rdf()
     *   .prefix('foaf', ns.foaf)
     *   .add('&lt;photo1.jpg> foaf:depicts "Jane"');
     * var rdf = rdfA.add(rdfB);
     * @see jQuery.rdf.databank#add
     */
    add: function (triple, options) {
      var query, databank;
      if (triple.rdfquery !== undefined) {
        if (triple.top) {
          databank = this.databank.add(triple.databank);
          query = $.rdf({ parent: this.parent, databank: databank });
          return query;
        } else if (this.top) {
          databank = triple.databank.add(this.databank);
          query = $.rdf({ parent: triple.parent, databank: databank });
          return query;
        } else if (this.union === undefined) {
          query = $.rdf({ union: [this, triple] });
          this.partOf.push(query);
          triple.partOf.push(query);
          return query;
        } else {
          this.union.push(triple);
          triple.partOf.push(this);
        }
      } else {
        if (typeof triple === 'string') {
          options = $.extend({}, { base: this.base(), namespaces: this.prefix(), source: triple }, options);
          triple = $.rdf.pattern(triple, options);
        }
        if (triple.isFixed()) {
          this.databank.add(triple.triple(), options);
        } else {
          query = this;
          this.each(function (i, data) {
            var t = triple.triple(data);
            if (t !== null) {
              query.databank.add(t, options);
            }
          });
        }
      }
      return this;
    },

    /**
     * Removes a triple or several triples from the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.rdf.triple|jQuery.rdf.pattern} triple The triple to be removed, or a {@link jQuery.rdf.pattern} that matches the triples that should be removed.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret any CURIEs within the triple or pattern. Defaults to the namespace bindings defined on the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the triple or pattern. Defaults to the base URI defined on the {@link jQuery.rdf#databank}.
     * @returns {jQuery.rdf} The {@link jQuery.rdf} object itself.
     * @example
     * var rdf = $('html').rdf()
     *   .prefix('foaf', ns.foaf)
     *   .where('?person foaf:givenname ?gname')
     *   .where('?person foaf:family_name ?fname')
     *   .remove('?person foaf:family_name ?fname');
     * @see jQuery.rdf.databank#remove
     */
    remove: function (triple, options) {
      if (typeof triple === 'string') {
        options = $.extend({}, { base: this.base(), namespaces: this.prefix() }, options);
        triple = $.rdf.pattern(triple, options);
      }
      if (triple.isFixed()) {
        this.databank.remove(triple.triple(), options);
      } else {
        query = this;
        this.each(function (i, data) {
          var t = triple.triple(data);
          if (t !== null) {
            query.databank.remove(t, options);
          }
        });
      }
      return this;
    },

    /**
     * Loads some data into the {@link jQuery.rdf#databank}
     * @param data
     * @param {Object} [options]
     * @see jQuery.rdf.databank#load
     */
    load: function (data, options) {
      var rdf = this,
        options = options || {},
        success = options.success;
      if (success !== undefined) {
        options.success = function () {
          success.call(rdf);
        }
      }
      this.databank.load(data, options);
      return this;
    },

    /**
     * Creates a new {@link jQuery.rdf} object whose databank contains all the triples in this object's databank except for those in the argument's databank.
     * @param {jQuery.rdf} query
     * @see jQuery.rdf.databank#except
     */
    except: function (query) {
      return $.rdf({ databank: this.databank.except(query.databank) });
    },

    /**
     * Creates a new {@link jQuery.rdf} object that is the result of filtering the matches on this {@link jQuery.rdf} object based on the filter that's passed into it.
     * @param {String|jQuery.rdf.pattern} filter An expression that filters the triples in the {@link jQuery.rdf#databank} to locate matches based on the matches on this {@link jQuery.rdf} object. If it's a string, the filter is parsed as a {@link jQuery.rdf.pattern}.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret any CURIEs within the pattern. Defaults to the namespace bindings defined on the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the pattern. Defaults to the base URI defined on the {@link jQuery.rdf#databank}.
     * @param {boolean} [options.optional] Not usually used (use {@link jQuery.rdf#optional} instead).
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#optional
     * @see jQuery.rdf#filter
     * @see jQuery.rdf#about
     * @example
     * var rdf = $.rdf()
     *   .prefix('foaf', ns.foaf)
     *   .add('_:a foaf:givenname   "Alice" .')
     *   .add('_:a foaf:family_name "Hacker" .')
     *   .add('_:b foaf:givenname   "Bob" .')
     *   .add('_:b foaf:family_name "Hacker" .')
     *   .where('?person foaf:family_name "Hacker"')
     *   .where('?person foaf:givenname "Bob");
     */ 
    where: function (filter, options) {
      var query, base, namespaces, optional;
      options = options || {};
      if (typeof filter === 'string') {
        base = options.base || this.base();
        namespaces = $.extend({}, this.prefix(), options.namespaces || {});
        optional = options.optional || false;
        filter = $.rdf.pattern(filter, { namespaces: namespaces, base: base, optional: optional });
      }
      query = $.rdf($.extend({}, options, { parent: this, filter: filter }));
      this.children.push(query);
      return query;
    },

    /**
     * Creates a new {@link jQuery.rdf} object whose set of bindings might optionally include those based on the filter pattern.
     * @param {String|jQuery.rdf.pattern} filter An pattern for a set of bindings that might be added to those in this {@link jQuery.rdf} object.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret any CURIEs within the pattern. Defaults to the namespace bindings defined on the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the pattern. Defaults to the base URI defined on the {@link jQuery.rdf#databank}.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#where
     * @see jQuery.rdf#filter
     * @see jQuery.rdf#about
     * @example
     * var rdf = $.rdf()
     *   .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
     *   .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
     *   .add('_:a  rdf:type        foaf:Person .')
     *   .add('_:a  foaf:name       "Alice" .')
     *   .add('_:a  foaf:mbox       &lt;mailto:alice@example.com> .')
     *   .add('_:a  foaf:mbox       &lt;mailto:alice@work.example> .')
     *   .add('_:b  rdf:type        foaf:Person .')
     *   .add('_:b  foaf:name       "Bob" .')
     *   .where('?x foaf:name ?name')
     *   .optional('?x foaf:mbox ?mbox');
     */
    optional: function (filter, options) {
      return this.where(filter, $.extend({}, options || {}, { optional: true }));
    },

    /**
     * Creates a new {@link jQuery.rdf} object whose set of bindings include <code>property</code> and <code>value</code> for every triple that is about the specified resource.
     * @param {String|jQuery.rdf.resource} resource The subject of the matching triples.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret the resource if it's a CURIE. Defaults to the namespace bindings defined on the {@link jQuery.rdf#databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret the resource if it's a relative URI (wrapped in <code>&lt;</code> and <code>&gt;</code>). Defaults to the base URI defined on the {@link jQuery.rdf#databank}.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#where
     * @see jQuery.rdf#optional
     * @see jQuery.rdf#filter
     * @example
     * var rdf = $.rdf()
     *   .prefix('dc', ns.dc)
     *   .prefix('foaf', ns.foaf)
     *   .add('&lt;photo1.jpg> dc:creator &lt;http://www.blogger.com/profile/1109404> .')
     *   .add('&lt;http://www.blogger.com/profile/1109404> foaf:img &lt;photo1.jpg> .')
     *   .add('&lt;photo2.jpg> dc:creator &lt;http://www.blogger.com/profile/1109404> .')
     *   .add('&lt;http://www.blogger.com/profile/1109404> foaf:img &lt;photo2.jpg> .')
     *   .about('&lt;http://www.blogger.com/profile/1109404>');
     */
    about: function (resource, options) {
      return this.where(resource + ' ?property ?value', options);
    },

    /**
     * Creates a new {@link jQuery.rdf} object whose set of bindings include only those that satisfy some arbitrary condition. There are two main ways to call this method: with two arguments in which case the first is a binding to be tested and the second represents a condition on the test, or with one argument which is a function that should return true for acceptable bindings.
     * @param {Function|String} property <p>In the two-argument version, this is the name of a property to be tested against the condition specified in the second argument. In the one-argument version, this is a function in which <code>this</code> is an object whose properties are a set of {@link jQuery.rdf.resource}, {@link jQuery.rdf.literal} or {@link jQuery.rdf.blank} objects and whose arguments are:</p>
     * <dl>
     *   <dt>i</dt>
     *   <dd>The index of the set of bindings amongst the other matches</dd>
     *   <dt>bindings</dt>
     *   <dd>An object representing the bindings (the same as <code>this</code>)</dd>
     *   <dt>triples</dt>
     *   <dd>The {@link jQuery.rdf.triple}s that underly this set of bindings</dd>
     * </dl>
     * @param {RegExp|String} condition In the two-argument version of this function, the condition that the property's must match. If it is a regular expression, the value must match the regular expression. If it is a {@link jQuery.rdf.literal}, the value of the literal must match the property's value. Otherwise, they must be the same resource.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#where
     * @see jQuery.rdf#optional
     * @see jQuery.rdf#about
     * @example
     * var rdf = $.rdf()
     *   .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
     *   .add('_:a foaf:surname "Jones" .')
     *   .add('_:b foaf:surname "Macnamara" .')
     *   .add('_:c foaf:surname "O\'Malley"')
     *   .add('_:d foaf:surname "MacFee"')
     *   .where('?person foaf:surname ?surname')
     *     .filter('surname', /^Ma?c/)
     *       .each(function () { scottish.push(this.surname.value); })
     *     .end()
     *     .filter('surname', /^O'/)
     *       .each(function () { irish.push(this.surname.value); })
     *     .end();
     * @example
     * var rdf = $.rdf()
     *   .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
     *   .add('_:a foaf:surname "Jones" .')
     *   .add('_:b foaf:surname "Macnamara" .')
     *   .add('_:c foaf:surname "O\'Malley"')
     *   .add('_:d foaf:surname "MacFee"')
     *   .where('?person foaf:surname ?surname')
     *   .filter(function () { return this.surname !== "Jones"; })
     */
    filter: function (property, condition) {
      var func, query;
      if (typeof property === 'string') {
        if (condition.constructor === RegExp) {
          /** @ignore func */
          func = function () {
            return condition.test(this[property].value);
          };
        } else {
          func = function () {
            return this[property].type === 'literal' ? this[property].value === condition : this[property] === condition;
          };
        }
      } else {
        func = property;
      }
      query = $.rdf({ parent: this, filter: func });
      this.children.push(query);
      return query;
    },

    /**
     * Creates a new {@link jQuery.rdf} object containing one binding for each selected resource.
     * @param {String|Object} node The node to be selected. If this is a string beginning with a question mark the resources are those identified by the bindings of that value in the currently selected bindings. Otherwise, only the named resource is selected as the node.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object.
     * @see jQuery.rdf#find
     * @see jQuery.rdf#back
     * @example
     * // returns an rdfQuery object with a pointer to <http://example.com/aReallyGreatBook>
     * var rdf = $('html').rdf()
     *   .node('<http://example.com/aReallyGreatBook>');
     */
    node: function (resource) {
      var variable, query;
      if (resource.toString().substring(0, 1) === '?') {
        variable = resource.toString().substring(1);
        query = $.rdf({ parent: this, navigate: variable });
      } else {
        if (typeof resource === 'string') {
          resource = object(resource, { namespaces: this.prefix(), base: this.base() });
        }
        query = $.rdf({ parent: this, nodes: [resource] });
      }
      this.children.push(query);
      return query;
    },
    
    /**
     * Navigates from the resource identified by the 'node' binding to another node through the property passed as the argument.
     * @param {String|Object} property The property whose value will be the new node.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#back
     * @see jQuery.rdf#node
     * @example
     * var creators = $('html').rdf()
     *   .node('<>')
     *   .find('dc:creator');
     */
    find: function (property) {
      return this.where('?node ' + property + ' ?object', { navigate: 'object' });
    },
    
    /**
     * Navigates from the resource identified by the 'node' binding to another node through the property passed as the argument, like {jQuery.rdf#find}, but backwards.
     * @param {String|Object} property The property whose value will be the new node.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object whose {@link jQuery.rdf#parent} is this {@link jQuery.rdf}.
     * @see jQuery.rdf#find
     * @see jQuery.rdf#node
     * @example
     * var people = $('html').rdf()
     *   .node('foaf:Person')
     *   .back('rdf:type');
     */
    back: function (property) {
      return this.where('?subject ' + property + ' ?node', { navigate: 'subject' });
    },

    /**
     * Groups the bindings held by this {@link jQuery.rdf} object based on the values of the variables passed as the parameter.
     * @param {String[]} [bindings] The variables to group by. The returned objects will contain all their current properties, but those aside from the specified variables will be arrays listing the relevant values.
     * @returns {jQuery} A jQuery object containing objects representing the grouped bindings.
     * @example
     * // returns one object per person and groups all the names and all the emails together in arrays
     * var grouped = rdf
     *   .where('?person foaf:name ?name')
     *   .where('?person foaf:email ?email')
     *   .group('person');
     * @example
     * // returns one object per surname/firstname pair, with the person property being an array in the resulting objects
     * var grouped = rdf
     *   .where('?person foaf:first_name ?forename')
     *   .where('?person foaf:givenname ?surname')
     *   .group(['surname', 'forename']);
     */
    group: function (bindings) {
      var grouped = {}, results = [], i, key, v;
      if (!$.isArray(bindings)) {
        bindings = [bindings];
      }
      return $(group(this, bindings));
    },

    /**
     * Filters the variable bindings held by this {@link jQuery.rdf} object down to those listed in the bindings parameter. This mirrors the <a href="http://www.w3.org/TR/rdf-sparql-query/#select">SELECT</a> form in SPARQL.
     * @param {String[]} [bindings] The variables that you're interested in. The returned objects will only contain those variables. If bindings is undefined, you will get all the variable bindings in the returned objects.
     * @returns {Object[]} An array of objects with the properties named by the bindings parameter.
     * @example
     * var filtered = rdf
     *   .where('?photo dc:creator ?creator')
     *   .where('?creator foaf:img ?photo');
     * var selected = rdf.select(['creator']);
     */
    select: function (bindings) {
      var s = [], i, j;
      for (i = 0; i < this.length; i += 1) {
        if (bindings === undefined) {
          s[i] = this[i];
        } else {
          s[i] = {};
          for (j = 0; j < bindings.length; j += 1) {
            s[i][bindings[j]] = this[i][bindings[j]];
          }
        }
      }
      return s;
    },

    /**
     * Provides <a href="http://n2.talis.com/wiki/Bounded_Descriptions_in_RDF#Simple_Concise_Bounded_Description">simple concise bounded descriptions</a> of the resources or bindings that are passed in the argument. This mirrors the <a href="http://www.w3.org/TR/rdf-sparql-query/#describe">DESCRIBE</a> form in SPARQL.
     * @param {(String|jQuery.rdf.resource)[]} bindings An array that can contain strings, {@link jQuery.rdf.resource}s or a mixture of the two. Any strings that begin with a question mark (<code>?</code>) are taken as variable names; each matching resource is described by the function.
     * @returns {jQuery} A {@link jQuery} object that contains {@link jQuery.rdf.triple}s that describe the listed resources.
     * @see jQuery.rdf.databank#describe
     * @example
     * $.rdf.dump($('html').rdf().describe(['<photo1.jpg>']));
     * @example
     * $('html').rdf()
     *   .where('?person foaf:img ?picture')
     *   .describe(['?photo'])
     */
    describe: function (bindings) {
      var i, j, binding, resources = [];
      for (i = 0; i < bindings.length; i += 1) {
        binding = bindings[i];
        if (binding.substring(0, 1) === '?') {
          binding = binding.substring(1);
          for (j = 0; j < this.length; j += 1) {
            resources.push(this[j][binding]);
          }
        } else {
          resources.push(binding);
        }
      }
      return this.databank.describe(resources);
    },

    /**
     * Returns a new {@link jQuery.rdf} object that contains only one set of variable bindings. This is designed to mirror the <a href="http://docs.jquery.com/Traversing/eq#index">jQuery#eq</a> method.
     * @param {Integer} n The index number of the match that should be selected.
     * @returns {jQuery.rdf} A new {@link jQuery.rdf} object with just that match.
     * @example
     * var rdf = $.rdf()
     *   .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
     *   .add('_:a  foaf:name       "Alice" .')
     *   .add('_:a  foaf:homepage   <http://work.example.org/alice/> .')
     *   .add('_:b  foaf:name       "Bob" .')
     *   .add('_:b  foaf:mbox       <mailto:bob@work.example> .')
     *   .where('?x foaf:name ?name')
     *   .eq(1);
     */
    eq: function (n) {
      return this.filter(function (i) {
        return i === n;
      });
    },

    /**
     * Returns a {@link jQuery.rdf} object that includes no filtering (and therefore has no matches) over the {@link jQuery.rdf#databank}.
     * @returns {jQuery.rdf} An empty {@link jQuery.rdf} object.
     * @example
     * $('html').rdf()
     *   .where('?person foaf:family_name "Hacker"')
     *   .where('?person foaf:givenname "Alice"')
     *   .each(...do something with Alice Hacker...)
     *   .reset()
     *   .where('?person foaf:family_name "Jones"')
     *   .where('?person foaf:givenname "Bob"')
     *   .each(...do something with Bob Jones...);
     */
    reset: function () {
      var query = this;
      while (query.parent !== undefined) {
        query = query.parent;
      }
      return query;
    },

    /**
     * Returns the parent {@link jQuery.rdf} object, which is equivalent to undoing the most recent filtering operation (such as {@link jQuery.rdf#where} or {@link jQuery.rdf#filter}). This is designed to mirror the <a href="http://docs.jquery.com/Traversing/end">jQuery#end</a> method.
     * @returns {jQuery.rdf}
     * @example
     * $('html').rdf()
     *   .where('?person foaf:family_name "Hacker"')
     *   .where('?person foaf:givenname "Alice"')
     *   .each(...do something with Alice Hacker...)
     *   .end()
     *   .where('?person foaf:givenname "Bob"')
     *   .each(...do something with Bob Hacker...);
     */
    end: function () {
      return this.parent;
    },

    /**
     * Returns the number of matches in this {@link jQuery.rdf} object (equivalent to {@link jQuery.rdf#length}).
     * @returns {Integer} The number of matches in this {@link jQuery.rdf} object.
     * @see jQuery.rdf#length
     */
    size: function () {
      return this.length;
    },

    /**
     * Gets the triples that form the basis of the variable bindings that are the primary product of {@link jQuery.rdf}. Getting hold of the triples can be useful for understanding the facts that form the basis of the variable bindings.
     * @returns {jQuery} A {@link jQuery} object containing arrays of {@link jQuery.rdf.triple} objects. A {@link jQuery} object is returned so that you can easily iterate over the contents.
     * @example
     * $('html').rdf()
     *   .where('?thing a foaf:Person')
     *   .sources()
     *   .each(function () {
     *     ...do something with the array of triples... 
     *   });
     */
    sources: function () {
         
            return $($.map(this.matches, 
                function(match){
                    // return an array-of-an-array because arrays automatically get expanded by $.map()
                    return [match.triples.reverse()];
                }));
    },

    /**
     * Dumps the triples that form the basis of the variable bindings that are the primary product of {@link jQuery.rdf} into a format that can be shown to the user or sent to a server.
     * @param {Object} [options] Options that control the formatting of the triples. See {@link jQuery.rdf.dump} for details.
     * @see jQuery.rdf.dump
     */
    dump: function (options) {
      var triples = $.map(this.matches, function (match) {
        return match.triples;
      });
      options = $.extend({ namespaces: this.databank.namespaces, base: this.databank.base }, options || {});
      return $.rdf.dump(triples, options);
    },

    /**
     * Either returns the item specified by the argument or turns the {@link jQuery.rdf} object into an array. This mirrors the <a href="http://docs.jquery.com/Core/get">jQuery#get</a> method.
     * @param {Integer} [num] The number of the item to be returned.
     * @returns {Object[]|Object} Returns either a single Object representing variable bindings or an array of such.
     * @example
     * $('html').rdf()
     *   .where('?person a foaf:Person')
     *   .get(0)
     *   .subject
     *   .value;
     */
    get: function (num) {
      return (num === undefined) ? $.makeArray(this) : this[num];
    },

    /**
     * Iterates over the matches held by the {@link jQuery.rdf} object and performs a function on each of them. This mirrors the <a href="http://docs.jquery.com/Core/each">jQuery#each</a> method.
     * @param {Function} callback A function that is called for each match on the {@link jQuery.rdf} object. Within the function, <code>this</code> is set to the object representing the variable bindings. The function can take up to three parameters:
     * <dl>
     *   <dt>i</dt><dd>The index of the match amongst the other matches.</dd>
     *   <dt>bindings</dt><dd>An object representing the variable bindings for the match, the same as <code>this</code>.</dd>
     *   <dt>triples</dt><dd>An array of {@link jQuery.rdf.triple}s associated with the particular match.</dd>
     * </dl>
     * @returns {jQuery.rdf} The {@link jQuery.rdf} object.
     * @see jQuery.rdf#map
     * @example
     * var rdf = $('html').rdf()
     *   .where('?photo dc:creator ?creator')
     *   .where('?creator foaf:img ?photo')
     *   .each(function () {
     *     photos.push(this.photo.value);
     *   });
     */
    each: function (callback) {
      $.each(this.matches, function (i, match) {
        callback.call(match.bindings, i, match.bindings, match.triples);
      });
      return this;
    },

    /**
     * Iterates over the matches held by the {@link jQuery.rdf} object and creates a new {@link jQuery} object that holds the result of applying the passed function to each one. This mirrors the <a href="http://docs.jquery.com/Traversing/map">jQuery#map</a> method.
     * @param {Function} callback A function that is called for each match on the {@link jQuery.rdf} object. Within the function, <code>this</code> is set to the object representing the variable bindings. The function can take up to three parameters and should return some kind of value:
     * <dl>
     *   <dt>i</dt><dd>The index of the match amongst the other matches.</dd>
     *   <dt>bindings</dt><dd>An object representing the variable bindings for the match, the same as <code>this</code>.</dd>
     *   <dt>triples</dt><dd>An array of {@link jQuery.rdf.triple}s associated with the particular match.</dd>
     * </dl>
     * @returns {jQuery} A jQuery object holding the results of the function for each of the matches on the original {@link jQuery.rdf} object.
     * @example
     * var photos = $('html').rdf()
     *   .where('?photo dc:creator ?creator')
     *   .where('?creator foaf:img ?photo')
     *   .map(function () {
     *     return this.photo.value;
     *   });
     */
    map: function (callback) {
      return $($.map(this.matches, function (match, i) {
        // in the callback, "this" is the bindings, and the arguments are swapped from $.map()
        return callback.call(match.bindings, i, match.bindings, match.triples);
      }));
    },

    /**
     * Returns a {@link jQuery} object that wraps this {@link jQuery.rdf} object.
     * @returns {jQuery}
     */
    jquery: function () {
      return $(this);
    }
  };

  $.rdf.fn.init.prototype = $.rdf.fn;

  $.rdf.gleaners = [];
  $.rdf.parsers = {};

  /**
   * Dumps the triples passed as the first argument into a format that can be shown to the user or sent to a server.
   * @param {jQuery.rdf.triple[]} triples An array (or {@link jQuery} object) of {@link jQuery.rdf.triple}s.
   * @param {Object} [options] Options that control the format of the dump.
   * @param {String} [options.format='application/json'] The mime type of the format of the dump. The supported formats are:
   * <table>
   *   <tr><th>mime type</th><th>description</th></tr>
   *   <tr>
   *     <td><code>application/json</code></td>
   *     <td>An <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> object</td>
   *   </tr>
   *   <tr>
   *     <td><code>application/rdf+xml</code></td>
   *     <td>An DOMDocument node holding XML in <a href="http://www.w3.org/TR/rdf-syntax-grammar/">RDF/XML syntax</a></td>
   *   </tr>
   *   <tr>
   *     <td><code>text/turtle</code></td>
   *     <td>A String holding a representation of the RDF in <a href="http://www.w3.org/TeamSubmission/turtle/">Turtle syntax</a></td>
   *   </tr>
   * </table>
   * @param {Object} [options.namespaces={}] A set of namespace bindings used when mapping resource URIs to CURIEs or QNames (particularly in a RDF/XML serialisation).
   * @param {boolean} [options.serialize=false] If true, rather than creating an Object, the function will return a string which is ready to display or send to a server.
   * @param {boolean} [options.indent=false] If true, the serialised (RDF/XML) output has indentation added to it to make it more readable.
   * @returns {Object|String} The alternative representation of the triples.
   */
  $.rdf.dump = function (triples, options) {
    var opts = $.extend({}, $.rdf.dump.defaults, options || {}),
      format = opts.format,
      serialize = opts.serialize,
      dump, parser, parsers;
    parser = $.rdf.parsers[format];
    if (parser === undefined) {
      parsers = [];
      for (p in $.rdf.parsers) {
        parsers.push(p);
      }
      throw "Unrecognised dump format: " + format + ". Expected one of " + parsers.join(", ");
    }
    dump = parser.dump(triples, opts);
    return serialize ? parser.serialize(dump) : dump;
  };

  $.rdf.dump.defaults = {
    format: 'application/json',
    serialize: false,
    indent: false,
    namespaces: {}
  }

  /**
   * Gleans RDF triples from the nodes held by the {@link jQuery} object, puts them into a {@link jQuery.rdf.databank} and returns a {@link jQuery.rdf} object that allows you to query and otherwise manipulate them. The mechanism for gleaning RDF triples from the web page depends on the rdfQuery modules that have been included. The core version of rdfQuery doesn't support any gleaners; other versions support a RDFa gleaner, and there are some modules available for common microformats.
   * @methodOf jQuery#
   * @name jQuery#rdf
   * @param {Function} [callback] A callback function that is called every time a triple is gleaned from the page. Within the function, <code>this</code> is set to the triple that has been located. The function can take up to two parameters:
   * <dl>
   *   <dt>node</dt><dd>The node on which the triple has been found; should be the same as <code>this.source</code>.</dd>
   *   <dt>triple</dt><dd>The triple that's been found; the same as <code>this</code>.</dd>
   * </dl>
   * The callback should return the triple or triples that should be added to the databank. This enables you to filter, extend or modify the contents of the databank itself, should you wish to.
   * @returns {jQuery.rdf} An empty query over the triples stored within the page.
   * @example $('#content').rdf().databank.dump();
   */
  $.fn.rdf = function (callback) {
    var triples = [],
      callback = callback || function () { return this; };
    if ($(this)[0] && $(this)[0].nodeType === 9) {
      return $(this).children('*').rdf(callback);
    } else if ($(this).length > 0) {
      triples = $(this).map(function (i, elem) {
        return $.map($.rdf.gleaners, function (g) {
          return g.gleaner.call($(elem), { callback: callback });
        });
      });
      return $.rdf({ triples: triples, namespaces: $(this).xmlns() });
    } else {
      return $.rdf();
    }
  };

  $.extend($.expr[':'], {

    about: function (a, i, m) {
      var j = $(a),
        resource = m[3] ? j.safeCurie(m[3]) : null,
        isAbout = false;
      $.each($.rdf.gleaners, function (i, g) {
        isAbout |= g.gleaner.call(j, { about: resource });
      });
      return isAbout;
    },

    type: function (a, i, m) {
      var j = $(a),
        type = m[3] ? j.curie(m[3]) : null,
        isType = false;
      $.each($.rdf.gleaners, function (i, g) {
          isType |= g.gleaner.call(j, {  type: type });
      });
      return isType;
    },

	itemid: function (a, i, m) {
      var j = $(a),
        resource = m[3] ? j.safeCurie(m[3]) : null,
        isItemid = false;
      $.each($.rdf.gleaners, function (i, g) {
        isItemid |= g.gleaner.call(j, { itemid: resource });
      });
      return isItemid;
    },
	
	itemtype: function (a, i, m) {
      var j = $(a),
        type = m[3] ? j.curie(m[3]) : null,
        isType = false;
      $.each($.rdf.gleaners, function (i, g) {
          isType |= g.gleaner.call(j, {  itemtype: type });
      });
      return isType;
    }
  });

  /**
   * <p>Creates a new jQuery.rdf.databank object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, but manipulate them through a {@link jQuery.rdf} object.</p>
   * @class Represents a triplestore, holding a bunch of {@link jQuery.rdf.triple}s.
   * @param {(String|jQuery.rdf.triple)[]} [triples=[]] An array of triples to store in the databank.
   * @param {Object} [options] Initialisation of the databank.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings used when interpreting the CURIEs in strings representing triples. Rather than passing this in when you construct the {@link jQuery.rdf.databank} instance, you will usually want to use the {@link jQuery.rdf.databank#prefix} method.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the strings representing triples.
   * @returns {jQuery.rdf.databank} The newly-created databank.
   * @see jQuery.rdf
   */
  $.rdf.databank = function (triples, options) {
    return new $.rdf.databank.fn.init(triples, options);
  };

  $.rdf.databank.fn = $.rdf.databank.prototype = {
    init: function (triples, options) {
      var i;
      triples = triples || [];
      options = options || {};
      this.id = databankID();
      databanks[this.id] = this;
      if (options.union === undefined) {
        this.queries = {};
        this.tripleStore = [];
        this.subjectIndex = {};
        this.propertyIndex = {};
        this.objectIndex = {};
        this.baseURI = options.base || $.uri.base();
        this.namespaces = $.extend({}, options.namespaces || {});
        for (i = 0; i < triples.length; i += 1) {
          this.add(triples[i]);
        }
      } else {
        this.union = options.union;
      }
      return this;
    },
    
    /**
     * Sets or returns the base URI of the {@link jQuery.rdf.databank}.
     * @param {String|jQuery.uri} [base]
     * @returns A {@link jQuery.uri} if no base URI is specified, otherwise returns this {@link jQuery.rdf.databank} object.
     * @see jQuery.rdf#base
     */
    base: function (base) {
      if (this.union === undefined) {
        if (base === undefined) {
          return this.baseURI;
        } else {
          this.baseURI = base;
          return this;
        }
      } else if (base === undefined) {
        return this.union[0].base();
      } else {
        $.each(this.union, function (i, databank) {
          databank.base(base);
        });
        return this;
      }
    },

    /**
     * Sets or returns a namespace binding on the {@link jQuery.rdf.databank}.
     * @param {String} [prefix]
     * @param {String} [namespace]
     * @returns {Object|jQuery.uri|jQuery.rdf} If no prefix or namespace is specified, returns an object providing all namespace bindings on the {@link jQuery.rdf#databank}. If a prefix is specified without a namespace, returns the {@link jQuery.uri} associated with that prefix. Otherwise returns this {@link jQuery.rdf} object after setting the namespace binding.
     * @see jQuery.rdf#prefix
     */
    prefix: function (prefix, uri) {
      var namespaces = {};
      if (this.union === undefined) {
        if (prefix === undefined) {
          return this.namespaces;
        } else if (uri === undefined) {
          return this.namespaces[prefix];
        } else {
          this.namespaces[prefix] = uri;
          return this;
        }
      } else if (uri === undefined) {
        $.each(this.union, function (i, databank) {
          $.extend(namespaces, databank.prefix());
        });
        if (prefix === undefined) {
          return namespaces;
        } else {
          return namespaces[prefix];
        }
      } else {
        $.each(this.union, function (i, databank) {
          databank.prefix(prefix, uri);
        });
        return this;
      }
    },

    /**
     * Adds a triple to the {@link jQuery.rdf.databank} or another {@link jQuery.rdf.databank} object to create a union.
     * @param {String|jQuery.rdf.triple|jQuery.rdf.databank} triple The triple or {@link jQuery.rdf.databank} object to be added to this one. If the triple is a {@link jQuery.rdf.databank} object, the two databanks are unioned together. If the triple is a string, it's parsed as a {@link jQuery.rdf.triple}.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret CURIEs within the triple. Defaults to the namespace bindings defined on the {@link jQuery.rdf.databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the triple. Defaults to the base URI defined on the {@link jQuery.rdf.databank}.
     * @param {Integer} [options.depth] The number of links to traverse to gather more information about the subject, property and object of the triple.
     * @returns {jQuery.rdf.databank} This {@link jQuery.rdf.databank} object.
     * @see jQuery.rdf#add
     */
    add: function (triple, options) {
      var base = (options && options.base) || this.base(),
        namespaces = $.extend({}, this.prefix(), (options && options.namespaces) || {}),
        depth = (options && options.depth) || $.rdf.databank.defaults.depth,
        proxy = (options && options.proxy) || $.rdf.databank.defaults.proxy,
        databank;
      if (triple === this) {
        return this;
      } else if (triple.subjectIndex !== undefined) {
        // merging two databanks
        if (this.union === undefined) {
          databank = $.rdf.databank(undefined, { union: [this, triple] });
          return databank;
        } else {
          this.union.push(triple);
          return this;
        }
      } else {
        if (typeof triple === 'string') {
          triple = $.rdf.triple(triple, { namespaces: namespaces, base: base, source: triple });
        }
        if (this.union === undefined) {
          if (this.subjectIndex[triple.subject] === undefined) {
            this.subjectIndex[triple.subject] = [];
            if (depth > 0 && triple.subject.type === 'uri') {
              this.load(triple.subject.value, { depth: depth - 1, proxy: proxy });
            }
          }
          if (this.propertyIndex[triple.property] === undefined) {
            this.propertyIndex[triple.property] = [];
            if (depth > 0) {
              this.load(triple.property.value, { depth: depth - 1, proxy: proxy });
            }
          }
          if ($.inArray(triple, this.subjectIndex[triple.subject]) === -1) {
            this.tripleStore.push(triple);
            this.subjectIndex[triple.subject].push(triple);
            this.propertyIndex[triple.property].push(triple);
            if (triple.object.type === 'uri' || triple.object.type === 'bnode') {
              if (this.objectIndex[triple.object] === undefined) {
                this.objectIndex[triple.object] = [];
                if (depth > 0 && triple.object.type === 'uri') {
                  this.load(triple.object.value, { depth: depth - 1, proxy: proxy });
                }
              }
              this.objectIndex[triple.object].push(triple);
            }
            addToDatabankQueries(this, triple);
          }
        } else {
          $.each(this.union, function (i, databank) {
            databank.add(triple);
          });
        }
        return this;
      }
    },

    /**
     * Removes a triple from the {@link jQuery.rdf.databank}.
     * @param {String|jQuery.rdf.triple} triple The triple to be removed.
     * @param {Object} [options]
     * @param {Object} [options.namespaces] An object representing a set of namespace bindings used to interpret any CURIEs within the triple. Defaults to the namespace bindings defined on the {@link jQuery.rdf.databank}.
     * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the triple. Defaults to the base URI defined on the {@link jQuery.rdf.databank}.
     * @returns {jQuery.rdf.databank} The {@link jQuery.rdf.databank} object itself.
     * @see jQuery.rdf#remove
     */
    remove: function (triple, options) {
      var base = (options && options.base) || this.base(),
        namespaces = $.extend({}, this.prefix(), (options && options.namespaces) || {}),
        striples, ptriples, otriples,
        databank;
      if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: namespaces, base: base, source: triple });
      }
      this.tripleStore.splice($.inArray(triple, this.tripleStore), 1);
      striples = this.subjectIndex[triple.subject];
      if (striples !== undefined) {
        striples.splice($.inArray(triple, striples), 1);
      }
      ptriples = this.propertyIndex[triple.property];
      if (ptriples !== undefined) {
        ptriples.splice($.inArray(triple, ptriples), 1);
      }
      if (triple.object.type === 'uri' || triple.object.type === 'bnode') {
        otriples = this.objectIndex[triple.object];
        if (otriples !== undefined) {
          otriples.splice($.inArray(triple, otriples), 1);
        }
      }
      removeFromDatabankQueries(this, triple);
      return this;
    },

    /**
     * Creates a new databank containing all the triples in this {@link jQuery.rdf.databank} except those in the {@link jQuery.rdf.databank} passed as the argument.
     * @param {jQuery.rdf.databank} data The other {@link jQuery.rdf.databank}
     * @returns {jQuery.rdf.databank} A new {@link jQuery.rdf.databank} containing the triples in this {@link jQuery.rdf.databank} except for those in the data parameter.
     * @example
     * var old = $('html').rdf().databank;
     * ...some processing occurs...
     * var new = $('html').rdf().databank;
     * var added = new.except(old);
     * var removed = old.except(new);
     */
    except: function (data) {
      var store = data.subjectIndex,
        diff = [];
      $.each(this.subjectIndex, function (s, ts) {
        var ots = store[s];
        if (ots === undefined) {
          diff = diff.concat(ts);
        } else {
          $.each(ts, function (i, t) {
            if ($.inArray(t, ots) === -1) {
              diff.push(t);
            }
          });
        }
      });
      return $.rdf.databank(diff);
    },

    /**
     * Provides a {@link jQuery} object containing the triples held in this {@link jQuery.rdf.databank}.
     * @returns {jQuery} A {@link jQuery} object containing {@link jQuery.rdf.triple} objects.
     */
    triples: function () {
      var s, triples = [];
      if (this.union === undefined) {
        triples = this.tripleStore;
      } else {
        $.each(this.union, function (i, databank) {
          triples = triples.concat(databank.triples().get());
        });
        triples = $.unique(triples);
      }
      return $(triples);
    },

    /**
     * Tells you how many triples the databank contains.
     * @returns {Integer} The number of triples in the {@link jQuery.rdf.databank}.
     * @example $('html').rdf().databank.size();
     */
    size: function () {
      return this.triples().length;
    },

    /**
     * Provides <a href="http://n2.talis.com/wiki/Bounded_Descriptions_in_RDF#Simple_Concise_Bounded_Description">simple concise bounded descriptions</a> of the resources that are passed in the argument. This mirrors the <a href="http://www.w3.org/TR/rdf-sparql-query/#describe">DESCRIBE</a> form in SPARQL.
     * @param {(String|jQuery.rdf.resource)[]} resources An array that can contain strings, {@link jQuery.rdf.resource}s or a mixture of the two.
     * @returns {jQuery} A {@link jQuery} object holding the {@link jQuery.rdf.triple}s that describe the listed resources.
     * @see jQuery.rdf#describe
     */
    describe: function (resources) {
      var i, r, t, rhash = {}, triples = [];
      while (resources.length > 0) {
        r = resources.pop();
        if (rhash[r] === undefined) {
          if (r.value === undefined) {
            r = $.rdf.resource(r);
          }
          if (this.subjectIndex[r] !== undefined) {
            for (i = 0; i < this.subjectIndex[r].length; i += 1) {
              t = this.subjectIndex[r][i];
              triples.push(t);
              if (t.object.type === 'bnode') {
                resources.push(t.object);
              }
            }
          }
          if (this.objectIndex[r] !== undefined) {
            for (i = 0; i < this.objectIndex[r].length; i += 1) {
              t = this.objectIndex[r][i];
              triples.push(t);
              if (t.subject.type === 'bnode') {
                resources.push(t.subject);
              }
            }
          }
          rhash[r] = true;
        }
      }
      return $.grep(triples,function(v,k) {
                 return $.inArray(v,triples) === k;
             }).reverse();
    },

    /**
     * Dumps the triples in the databank into a format that can be shown to the user or sent to a server.
     * @param {Object} [options] Options that control the formatting of the triples. See {@link jQuery.rdf.dump} for details.
     * @returns {Object|Node|String}
     * @see jQuery.rdf.dump
     */
    dump: function (options) {
      options = $.extend({ namespaces: this.namespaces, base: this.base }, options || {});
      return $.rdf.dump(this.triples(), options);
    },

    /**
     * Loads some data into the databank.
     * @param {Node|Object|String} data If the data is a string and starts with 'http://' then it's taken to be a URI and data is loaded from that URI via the proxy specified in the options. If it doesn't start with 'http://' then it's taken to be a serialized version of some format capable of representing RDF, parsed and interpreted. If the data is a node, it's interpreted to be an <a href="http://www.w3.org/TR/rdf-syntax-grammar/">RDF/XML syntax</a> document and will be parsed as such. Otherwise, it's taken to be a <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> object.
     * @param {Object} opts Options governing the loading of the data.
     * @param {String} [opts.format] The mime type of the format the data is in, particularly useful if you're supplying the data as a string. If unspecified, the data will be sniffed to see if it might be HTML, RDF/XML, RDF/JSON or Turtle.
     * @param {boolean} [opts.async=true] When loading data from a URI, this determines whether it will be done synchronously or asynchronously.
     * @param {Function} [opts.success] When loading data from a URI, a function that will be called after the data is successfully loaded.
     * @param {Function} [opts.error] When loading data from a URI, a function that will be called if there's an error when accessing the URI.
     * @param {String} [opts.proxy='http://www.jenitennison.com/rdfquery/proxy.php'] The URI for a server-side proxy through which the data can be accessed. This does not have to be hosted on the same server as this Javascript, the HTML page or the remote data. The proxy must accept id, url and depth parameters and respond with some Javascript that will invoke the {@link jQuery.rdf.databank.load} function. <a href="http://code.google.com/p/rdfquery/source/browse/#svn/trunk/proxies">Example proxies</a> that do the right thing are available. If you are intending to use this facility a lot, please do not use the default proxy.
     * @param {integer} [opts.depth=0] Triggers recursive loading of located resources, to the depth specified. This is useful for automatically populating a databank with linked data.
     * @returns {jQuery.rdf.databank} The {@link jQuery.rdf.databank} itself.
     * @see jQuery.rdf#load
     */
    load: function (data, opts) {
      var i, triples, url, script, parser, docElem,
        format = (opts && opts.format),
        async = (opts && opts.async) || $.rdf.databank.defaults.async,
        success = (opts && opts.success) || $.rdf.databank.defaults.success,
        error = (opts && opts.error) || $.rdf.databank.defaults.error,
        proxy = (opts && opts.proxy) || $.rdf.databank.defaults.proxy,
        depth = (opts && opts.depth) || $.rdf.databank.defaults.depth;
      url = (typeof data === 'string' && data.substring(1, 7) === 'http://') ? $.uri(data) : data;
      if (url.scheme) {
        if (!queue(this, url, { success: success, error: error })) {
          script = '<script type="text/javascript" src="' + proxy + '?id=' + this.id + '&amp;depth=' + depth + '&amp;url=' + encodeURIComponent(url.resolve('').toString()) + '"></script>';
          if (async) {
            setTimeout("$('head').append('" + script + "')", 0);
          } else {
            $('head').append(script);
          }
        }
        return this;
      } else {
        if (format === undefined) {
          if (typeof data === 'string') {
            if (data.substring(0, 1) === '{') {
              format = 'application/json';
            } else if (data.substring(0, 14) === '<!DOCTYPE html' || data.substring(0, 5) === '<html') {
              format = 'application/xhtml+xml';
            } else if (data.substring(0, 5) === '<?xml' || data.substring(0, 8) === '<rdf:RDF') {
              format = 'application/rdf+xml';
            } else {
              format = 'text/turtle';
            }
          } else if (data.documentElement || data.ownerDocument) {
            docElem = data.documentElement ? data.documentElement : data.ownerDocument.documentElement;
            if (docElem.nodeName === 'html') {
              format = 'application/xhtml+xml';
            } else {
              format = 'application/rdf+xml';
            }
          } else {
            format = 'application/json';
          }
        }
        parser = $.rdf.parsers[format];
        if (typeof data === 'string') {
          data = parser.parse(data);
        }
        triples = parser.triples(data);
        for (i = 0; i < triples.length; i += 1) {
          this.add(triples[i], opts);
        }
        return this;
      }
    },

    /**
     * Provides a string representation of the databank which simply specifies how many triples it contains.
     * @returns {String}
     */
    toString: function () {
      return '[Databank with ' + this.size() + ' triples]';
    }
  };

  $.rdf.databank.fn.init.prototype = $.rdf.databank.fn;
  
  $.rdf.databank.defaults = {
    parse: false,
    async: true,
    success: null,
    error: null,
    depth: 0,
    proxy: 'http://www.jenitennison.com/rdfquery/proxy.php'
  };
  
  $.rdf.databank.load = function (id, url, doc, opts) {
    if (doc !== undefined) {
      databanks[id].load(doc, opts);
    }
    dequeue(databanks[id], url, (doc === undefined) ? 'error' : 'success', opts);
  };

  /**
   * <p>Creates a new jQuery.rdf.pattern object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, since they are automatically created from strings where necessary, such as by {@link jQuery.rdf#where}.</p>
   * @class Represents a pattern that may or may not match a given {@link jQuery.rdf.triple}.
   * @param {String|jQuery.rdf.resource|jQuery.rdf.blank} subject The subject pattern, or a single string that defines the entire pattern. If the subject is specified as a string, it can be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>), a blank node (<code>_:<var>id</var></code>) or a variable placeholder (<code>?<var>name</var></code>).
   * @param {String|jQuery.rdf.resource} [property] The property pattern. If the property is specified as a string, it can be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>) or a variable placeholder (<code>?<var>name</var></code>).
   * @param {String|jQuery.rdf.resource|jQuery.rdf.blank|jQuery.rdf.literal} [value] The value pattern. If the property is specified as a string, it can be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>), a blank node (<code>_:<var>id</var></code>), a literal (<code>"<var>value</var>"</code>) or a variable placeholder (<code>?<var>name</var></code>).
   * @param {Object} [options] Initialisation of the pattern.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings used when interpreting the CURIEs in the subject, property and object.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the subject, property and object.
   * @param {boolean} [options.optional]
   * @returns {jQuery.rdf.pattern} The newly-created pattern.
   * @throws {String} Errors if any of the strings are not in a recognised format.
   * @example pattern = $.rdf.pattern('?person', $.rdf.type, 'foaf:Person', { namespaces: { foaf: "http://xmlns.com/foaf/0.1/" }});
   * @example 
   * pattern = $.rdf.pattern('?person a foaf:Person', { 
   *   namespaces: { foaf: "http://xmlns.com/foaf/0.1/" }, 
   *   optional: true 
   * });
   * @see jQuery.rdf#where
   * @see jQuery.rdf.resource
   * @see jQuery.rdf.blank
   * @see jQuery.rdf.literal
   */
  $.rdf.pattern = function (subject, property, object, options) {
    var pattern, m, optional;
    // using a two-argument version; first argument is a Turtle statement string
    if (object === undefined) {
      options = property || {};
      m = $.trim(subject).match(tripleRegex);
      if (m.length === 3 || (m.length === 4 && m[3] === '.')) {
        subject = m[0];
        property = m[1];
        object = m[2];
      } else {
        throw "Bad Pattern: Couldn't parse string " + subject;
      }
      optional = (options.optional === undefined) ? $.rdf.pattern.defaults.optional : options.optional;
    }
    if (memPattern[subject] && 
        memPattern[subject][property] && 
        memPattern[subject][property][object] && 
        memPattern[subject][property][object][optional]) {
      return memPattern[subject][property][object][optional];
    }
    pattern = new $.rdf.pattern.fn.init(subject, property, object, options);
    if (memPattern[pattern.subject] &&
        memPattern[pattern.subject][pattern.property] &&
        memPattern[pattern.subject][pattern.property][pattern.object] &&
        memPattern[pattern.subject][pattern.property][pattern.object][pattern.optional]) {
      return memPattern[pattern.subject][pattern.property][pattern.object][pattern.optional];
    } else {
      if (memPattern[pattern.subject] === undefined) {
        memPattern[pattern.subject] = {};
      }
      if (memPattern[pattern.subject][pattern.property] === undefined) {
        memPattern[pattern.subject][pattern.property] = {};
      }
      if (memPattern[pattern.subject][pattern.property][pattern.object] === undefined) {
        memPattern[pattern.subject][pattern.property][pattern.object] = {};
      }
      memPattern[pattern.subject][pattern.property][pattern.object][pattern.optional] = pattern;
      return pattern;
    }
  };

  $.rdf.pattern.fn = $.rdf.pattern.prototype = {
    init: function (s, p, o, options) {
      var opts = $.extend({}, $.rdf.pattern.defaults, options);
      /**
       * The placeholder for the subject of triples matching against this pattern.
       * @type String|jQuery.rdf.resource|jQuery.rdf.blank
       */
      this.subject = s.toString().substring(0, 1) === '?' ? s : subject(s, opts);
      /**
       * The placeholder for the property of triples matching against this pattern.
       * @type String|jQuery.rdf.resource
       */
      this.property = p.toString().substring(0, 1) === '?' ? p : property(p, opts);
      /**
       * The placeholder for the object of triples matching against this pattern.
       * @type String|jQuery.rdf.resource|jQuery.rdf.blank|jQuery.rdf.literal
       */
      this.object = o.toString().substring(0, 1) === '?' ? o : object(o, opts);
      /**
       * Whether the pattern should only optionally match against the triple
       * @type boolean
       */
      this.optional = opts.optional;
      return this;
    },

    /**
     * Creates a new {@link jQuery.rdf.pattern} with any variable placeholders within this one's subject, property or object filled in with values from the bindings passed as the argument.
     * @param {Object} bindings An object holding the variable bindings to be used to replace any placeholders in the pattern. These bindings are of the type held by the {@link jQuery.rdf} object.
     * @returns {jQuery.rdf.pattern} A new {@link jQuery.rdf.pattern} object.
     * @example
     * pattern = $.rdf.pattern('?thing a ?class');
     * // pattern2 matches all triples that indicate the classes of this page. 
     * pattern2 = pattern.fill({ thing: $.rdf.resource('<>') });
     */
    fill: function (bindings) {
      var s = this.subject,
        p = this.property,
        o = this.object;
      if (typeof s === 'string' && bindings[s.substring(1)]) {
        s = bindings[s.substring(1)];
      }
      if (typeof p === 'string' && bindings[p.substring(1)]) {
        p = bindings[p.substring(1)];
      }
      if (typeof o === 'string' && bindings[o.substring(1)]) {
        o = bindings[o.substring(1)];
      }
      return $.rdf.pattern(s, p, o, { optional: this.optional });
    },

    /**
     * Creates a new Object holding variable bindings by matching the passed triple against this pattern.
     * @param {jQuery.rdf.triple} triple A {@link jQuery.rdf.triple} for this pattern to match against.
     * @returns {null|Object} An object containing the bindings of variables (as specified in this pattern) to values (as specified in the triple), or <code>null</code> if the triple doesn't match the pattern.
     * pattern = $.rdf.pattern('?thing a ?class');
     * bindings = pattern.exec($.rdf.triple('<> a foaf:Person', { namespaces: ns }));
     * thing = bindings.thing; // the resource for this page
     * class = bindings.class; // a resource for foaf:Person
     */
    exec: function (triple) {
      var binding = {};
      binding = testResource(triple.subject, this.subject, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.property, this.property, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.object, this.object, binding);
      return binding;
    },

    /**
     * Tests whether this pattern has any variable placeholders in it or not.
     * @returns {boolean} True if the pattern doesn't contain any variable placeholders.
     * @example
     * $.rdf.pattern('?thing a ?class').isFixed(); // false
     * $.rdf.pattern('<> a foaf:Person', { namespaces: ns }).isFixed(); // true
     */
    isFixed: function () {
      return typeof this.subject !== 'string' &&
        typeof this.property !== 'string' &&
        typeof this.object !== 'string';
    },

    /**
     * Creates a new triple based on the bindings passed to the pattern, if possible.
     * @param {Object} bindings An object holding the variable bindings to be used to replace any placeholders in the pattern. These bindings are of the type held by the {@link jQuery.rdf} object.
     * @returns {null|jQuery.rdf.triple} A new {@link jQuery.rdf.triple} object, or null if not all the variable placeholders in the pattern are specified in the bindings. The {@link jQuery.rdf.triple#source} of the generated triple is set to the string value of this pattern.
     * @example
     * pattern = $.rdf.pattern('?thing a ?class');
     * // triple is a new triple '<> a foaf:Person'
     * triple = pattern.triple({ 
     *   thing: $.rdf.resource('<>'),
     *   class: $.rdf.resource('foaf:Person', { namespaces: ns }) 
     * });
     */
    triple: function (bindings) {
      var t = this;
      if (!this.isFixed()) {
        t = this.fill(bindings);
      }
      if (t.isFixed()) {
        return $.rdf.triple(t.subject, t.property, t.object, { source: this.toString() });
      } else {
        return null;
      }
    },

    /**
     * Returns a string representation of the pattern by concatenating the subject, property and object.
     * @returns {String}
     */
    toString: function () {
      return this.subject + ' ' + this.property + ' ' + this.object;
    }
  };

  $.rdf.pattern.fn.init.prototype = $.rdf.pattern.fn;

  $.rdf.pattern.defaults = {
    base: $.uri.base(),
    namespaces: {},
    optional: false
  };

  /**
   * <p>Creates a new jQuery.rdf.triple object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, since they are automatically created from strings where necessary, such as by {@link jQuery.rdf#add}.</p>
   * @class Represents an RDF triple.
   * @param {String|jQuery.rdf.resource|jQuery.rdf.blank} subject The subject of the triple, or a single string that defines the entire triple. If the subject is specified as a string, it can be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>) or a blank node (<code>_:<var>id</var></code>).
   * @param {String|jQuery.rdf.resource} [property] The property pattern. If the property is specified as a string, it must be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>).
   * @param {String|jQuery.rdf.resource|jQuery.rdf.blank|jQuery.rdf.literal} [value] The value pattern. If the property is specified as a string, it can be a fixed resource (<code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>), a blank node (<code>_:<var>id</var></code>), or a literal (<code>"<var>value</var>"</code>).
   * @param {Object} [options] Initialisation of the triple.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings used when interpreting the CURIEs in the subject, property and object.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the subject, property and object.
   * @returns {jQuery.rdf.triple} The newly-created triple.
   * @throws {String} Errors if any of the strings are not in a recognised format.
   * @example pattern = $.rdf.triple('<>', $.rdf.type, 'foaf:Person', { namespaces: { foaf: "http://xmlns.com/foaf/0.1/" }});
   * @example 
   * pattern = $.rdf.triple('<> a foaf:Person', { 
   *   namespaces: { foaf: "http://xmlns.com/foaf/0.1/" }
   * });
   * @see jQuery.rdf#add
   * @see jQuery.rdf.resource
   * @see jQuery.rdf.blank
   * @see jQuery.rdf.literal
   */
  $.rdf.triple = function (subject, property, object, options) {
    var triple, graph, m;
    // using a two-argument version; first argument is a Turtle statement string
    if (object === undefined) {
      options = property;
      m = $.trim(subject).match(tripleRegex);
      if (m.length === 3 || (m.length === 4 && m[3] === '.')) {
        subject = m[0];
        property = m[1];
        object = m[2];
      } else {
        throw "Bad Triple: Couldn't parse string " + subject;
      }
    }
    graph = (options && options.graph) || '';
    if (memTriple[graph] &&
        memTriple[graph][subject] &&
        memTriple[graph][subject][property] &&
        memTriple[graph][subject][property][object]) {
      return memTriple[graph][subject][property][object];
    }
    triple = new $.rdf.triple.fn.init(subject, property, object, options);
    graph = triple.graph || '';
    if (memTriple[graph] &&
        memTriple[graph][triple.subject] &&
        memTriple[graph][triple.subject][triple.property] &&
        memTriple[graph][triple.subject][triple.property][triple.object]) {
      return memTriple[graph][triple.subject][triple.property][triple.object];
    } else {
      if (memTriple[graph] === undefined) {
        memTriple[graph] = {};
      }
      if (memTriple[graph][triple.subject] === undefined) {
        memTriple[graph][triple.subject] = {};
      }
      if (memTriple[graph][triple.subject][triple.property] === undefined) {
        memTriple[graph][triple.subject][triple.property] = {};
      }
      memTriple[graph][triple.subject][triple.property][triple.object] = triple;
      return triple;
    }
  };

  $.rdf.triple.fn = $.rdf.triple.prototype = {
    init: function (s, p, o, options) {
      var opts;
      opts = $.extend({}, $.rdf.triple.defaults, options);
      /**
       * The subject of the triple.
       * @type jQuery.rdf.resource|jQuery.rdf.blank
       */
      this.subject = subject(s, opts);
      /**
       * The property of the triple.
       * @type jQuery.rdf.resource
       */
      this.property = property(p, opts);
      /**
       * The object of the triple.
       * @type jQuery.rdf.resource|jQuery.rdf.blank|jQuery.rdf.literal
       */
      this.object = object(o, opts);
      /**
       * (Experimental) The named graph the triple belongs to.
       * @type jQuery.rdf.resource|jQuery.rdf.blank
       */
      this.graph = opts.graph === undefined ? undefined : subject(opts.graph, opts);
      /**
       * The source of the triple, which might be a node within the page (if the RDF is generated from the page) or a string holding the pattern that generated the triple.
       */
      this.source = opts.source;
      return this;
    },

    /**
     * Always returns true for triples.
     * @see jQuery.rdf.pattern#isFixed
     */
    isFixed: function () {
      return true;
    },

    /**
     * Always returns this triple.
     * @see jQuery.rdf.pattern#triple
     */
    triple: function (bindings) {
      return this;
    },

    /**
     * Returns a <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> representation of this triple.
     * @returns {Object}
     */
    dump: function () {
      var e = {},
        s = this.subject.value.toString(),
        p = this.property.value.toString();
      e[s] = {};
      e[s][p] = this.object.dump();
      return e;
    },

    /**
     * Returns a string representing this triple in Turtle format.
     * @returns {String}
     */
    toString: function () {
      return this.subject + ' ' + this.property + ' ' + this.object + ' .';
    }
  };

  $.rdf.triple.fn.init.prototype = $.rdf.triple.fn;

  $.rdf.triple.defaults = {
    base: $.uri.base(),
    source: [document],
    namespaces: {}
  };

  /**
   * <p>Creates a new jQuery.rdf.resource object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, since they are automatically created from strings where necessary, such as by {@link jQuery.rdf#add}.</p>
   * @class Represents an RDF resource.
   * @param {String|jQuery.uri} value The value of the resource. If it's a string it must be in the format <code>&lt;<var>uri</var>&gt;</code> or <code><var>curie</var></code>.
   * @param {Object} [options] Initialisation of the resource.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings used when interpreting the CURIE specifying the resource.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the URI specifying the resource.
   * @returns {jQuery.rdf.resource} The newly-created resource.
   * @throws {String} Errors if the string is not in a recognised format.
   * @example thisPage = $.rdf.resource('<>');
   * @example foaf.Person = $.rdf.resource('foaf:Person', { namespaces: ns });
   * @see jQuery.rdf.pattern
   * @see jQuery.rdf.triple
   * @see jQuery.rdf.blank
   * @see jQuery.rdf.literal
   */
  $.rdf.resource = function (value, options) {
    var resource;
    if (memResource[value]) {
      return memResource[value];
    }
    resource = new $.rdf.resource.fn.init(value, options);
    if (memResource[resource]) {
      return memResource[resource];
    } else {
      memResource[resource] = resource;
      return resource;
    }
  };

  $.rdf.resource.fn = $.rdf.resource.prototype = {
    /**
     * Always fixed to 'uri' for resources.
     * @type String
     */
    type: 'uri',
    /**
     * The URI for the resource.
     * @type jQuery.rdf.uri
     */
    value: undefined,

    init: function (value, options) {
      var m, prefix, uri, opts;
      if (typeof value === 'string') {
        m = uriRegex.exec(value);
        opts = $.extend({}, $.rdf.resource.defaults, options);
        if (m !== null) {
          this.value = $.uri.resolve(m[1].replace(/\\>/g, '>'), opts.base);
        } else if (value.substring(0, 1) === ':') {
          uri = opts.namespaces[''];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for default namespace in " + value;
          } else {
            this.value = $.uri.resolve(uri + value.substring(1));
          }
        } else if (value.substring(value.length - 1) === ':') {
          prefix = value.substring(0, value.length - 1);
          uri = opts.namespaces[prefix];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for prefix " + prefix + " in " + value;
          } else {
            this.value = $.uri.resolve(uri);
          }
        } else {
          try {
            this.value = $.curie(value, { namespaces: opts.namespaces });
          } catch (e) {
            throw "Malformed Resource: Bad format for resource " + e;
          }
        }
      } else {
        this.value = value;
      }
      return this;
    }, // end init

    /**
     * Returns a <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> representation of this triple.
     * @returns {Object}
     */
    dump: function () {
      return {
        type: 'uri',
        value: this.value.toString()
      };
    },

    /**
     * Returns a string representing this resource in Turtle format.
     * @returns {String}
     */
    toString: function () {
      return '<' + this.value + '>';
    }
  };

  $.rdf.resource.fn.init.prototype = $.rdf.resource.fn;

  $.rdf.resource.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  /**
   * A {@link jQuery.rdf.resource} for rdf:type
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.type = $.rdf.resource('<' + rdfNs + 'type>');
  /**
   * A {@link jQuery.rdf.resource} for rdfs:label
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.label = $.rdf.resource('<' + rdfsNs + 'label>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:first
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.first = $.rdf.resource('<' + rdfNs + 'first>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:rest
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.rest = $.rdf.resource('<' + rdfNs + 'rest>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:nil
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.nil = $.rdf.resource('<' + rdfNs + 'nil>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:subject
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.subject = $.rdf.resource('<' + rdfNs + 'subject>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:property
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.property = $.rdf.resource('<' + rdfNs + 'property>');
  /**
   * A {@link jQuery.rdf.resource} for rdf:object
   * @constant
   * @type jQuery.rdf.resource
   */
  $.rdf.object = $.rdf.resource('<' + rdfNs + 'object>');

  /**
   * <p>Creates a new jQuery.rdf.blank object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, since they are automatically created from strings where necessary, such as by {@link jQuery.rdf#add}.</p>
   * @class Represents an RDF blank node.
   * @param {String} value A representation of the blank node in the format <code>_:<var>id</var></code> or <code>[]</code> (which automatically creates a new blank node with a unique ID).
   * @returns {jQuery.rdf.blank} The newly-created blank node.
   * @throws {String} Errors if the string is not in a recognised format.
   * @example newBlank = $.rdf.blank('[]');
   * @example identifiedBlank = $.rdf.blank('_:fred');
   * @see jQuery.rdf.pattern
   * @see jQuery.rdf.triple
   * @see jQuery.rdf.resource
   * @see jQuery.rdf.literal
   */
  $.rdf.blank = function (value) {
    var blank;
    if (memBlank[value]) {
      return memBlank[value];
    }
    blank = new $.rdf.blank.fn.init(value);
    if (memBlank[blank]) {
      return memBlank[blank];
    } else {
      memBlank[blank] = blank;
      return blank;
    }
  };

  $.rdf.blank.fn = $.rdf.blank.prototype = {
    /**
     * Always fixed to 'bnode' for blank nodes.
     * @type String
     */
    type: 'bnode',
    /**
     * The value of the blank node in the format <code>_:<var>id</var></code>
     * @type String
     */
    value: undefined,
    /**
     * The id of the blank node.
     * @type String
     */
    id: undefined,

    init: function (value) {
      if (value === '[]') {
        this.id = blankNodeID();
        this.value = '_:' + this.id;
      } else if (value.substring(0, 2) === '_:') {
        this.id = value.substring(2);
        this.value = value;
      } else {
        throw "Malformed Blank Node: " + value + " is not a legal format for a blank node";
      }
      return this;
    },

    /**
     * Returns a <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> representation of this blank node.
     * @returns {Object}
     */
    dump: function () {
      return {
        type: 'bnode',
        value: this.value
      };
    },

    /**
     * Returns the value this blank node.
     * @returns {String}
     */
    toString: function () {
      return this.value;
    }
  };

  $.rdf.blank.fn.init.prototype = $.rdf.blank.fn;

  /**
   * <p>Creates a new jQuery.rdf.literal object. This should be invoked as a method rather than constructed using new; indeed you will not usually want to generate these objects directly, since they are automatically created from strings where necessary, such as by {@link jQuery.rdf#add}.</p>
   * @class Represents an RDF literal.
   * @param {String|boolean|Number} value Either the value of the literal or a string representation of it. If the datatype or lang options are specified, the value is taken as given. Otherwise, if it's a Javascript boolean or numeric value, it is interpreted as a value with a xsd:boolean or xsd:double datatype. In all other cases it's interpreted as a literal as defined in <a href="http://www.w3.org/TeamSubmission/turtle/#literal">Turtle syntax</a>.
   * @param {Object} [options] Initialisation options for the literal.
   * @param {String} [options.datatype] The datatype for the literal. This should be a safe CURIE; in other words, it can be in the format <code><var>uri</var></code> or <code>[<var>curie</var>]</code>. Must not be specified if options.lang is also specified.
   * @param {String} [options.lang] The language for the literal. Must not be specified if options.datatype is also specified.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings used when interpreting a CURIE in the datatype.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret a relative URI in the datatype.
   * @returns {jQuery.rdf.literal} The newly-created literal.
   * @throws {String} Errors if the string is not in a recognised format or if both options.datatype and options.lang are specified.
   * @example trueLiteral = $.rdf.literal(true);
   * @example numericLiteral = $.rdf.literal(5);
   * @example dateLiteral = $.rdf.literal('"2009-07-13"^^xsd:date', { namespaces: ns });
   * @see jQuery.rdf.pattern
   * @see jQuery.rdf.triple
   * @see jQuery.rdf.resource
   * @see jQuery.rdf.blank
   */
  $.rdf.literal = function (value, options) {
    var literal;
    if (memLiteral[value]) {
      return memLiteral[value];
    }
    literal = new $.rdf.literal.fn.init(value, options);
    if (memLiteral[literal]) {
      return memLiteral[literal];
    } else {
      memLiteral[literal] = literal;
      return literal;
    }
  };

  $.rdf.literal.fn = $.rdf.literal.prototype = {
    /**
     * Always fixed to 'literal' for literals.
     * @type String
     */
    type: 'literal',
    /**
     * The value of the literal as a string.
     * @type String
     */
    value: undefined,
    /**
     * The language of the literal, if it has one; otherwise undefined.
     * @type String
     */
    lang: undefined,
    /**
     * The datatype of the literal, if it has one; otherwise undefined.
     * @type jQuery.uri
     */
    datatype: undefined,

    init: function (value, options) {
      var
        m, datatype,
        opts = $.extend({}, $.rdf.literal.defaults, options);
      datatype = $.safeCurie(opts.datatype, { namespaces: opts.namespaces });
      if (opts.lang !== undefined && opts.datatype !== undefined && datatype.toString() !== (rdfNs + 'XMLLiteral')) {
        throw "Malformed Literal: Cannot define both a language and a datatype for a literal (" + value + ")";
      }
      if (opts.datatype !== undefined) {
        datatype = $.safeCurie(opts.datatype, { namespaces: opts.namespaces });
        $.extend(this, $.typedValue(value.toString(), datatype));
        if (datatype.toString() === rdfNs + 'XMLLiteral') {
          this.lang = opts.lang;
        }
      } else if (opts.lang !== undefined) {
        this.value = value.toString();
        this.lang = opts.lang;
      } else if (typeof value === 'boolean') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'boolean'));
      } else if (typeof value === 'number') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'double'));
      } else if (value === 'true' || value === 'false') {
        $.extend(this, $.typedValue(value, xsdNs + 'boolean'));
      } else if ($.typedValue.valid(value, xsdNs + 'integer')) {
        $.extend(this, $.typedValue(value, xsdNs + 'integer'));
      } else if ($.typedValue.valid(value, xsdNs + 'decimal')) {
        $.extend(this, $.typedValue(value, xsdNs + 'decimal'));
      } else if ($.typedValue.valid(value, xsdNs + 'double') &&
                 !/^\s*([\-\+]?INF|NaN)\s*$/.test(value)) {  // INF, -INF and NaN aren't valid literals in Turtle
        $.extend(this, $.typedValue(value, xsdNs + 'double'));
      } else {
        m = literalRegex.exec(value);
        if (m !== null) {
          this.value = (m[2] || m[4]).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
          if (m[9]) {
            datatype = $.rdf.resource(m[9], opts);
            $.extend(this, $.typedValue(this.value, datatype.value));
          } else if (m[7]) {
            this.lang = m[7];
          }
        } else {
          throw "Malformed Literal: Couldn't recognise the value " + value;
        }
      }
      return this;
    }, // end init

    /**
     * Returns a <a href="http://n2.talis.com/wiki/RDF_JSON_Specification">RDF/JSON</a> representation of this blank node.
     * @returns {Object}
     */
    dump: function () {
      var e = {
        type: 'literal',
        value: this.value.toString()
      };
      if (this.lang !== undefined) {
        e.lang = this.lang;
      } else if (this.datatype !== undefined) {
        e.datatype = this.datatype.toString();
      }
      return e;
    },
    
    /**
     * Returns a string representing this resource in <a href="http://www.w3.org/TeamSubmission/turtle/#literal">Turtle format</a>.
     * @returns {String}
     */
    toString: function () {
      var val = '"' + this.value + '"';
      if (this.lang !== undefined) {
        val += '@' + this.lang;
      } else if (this.datatype !== undefined) {
        val += '^^<' + this.datatype + '>';
      }
      return val;
    }
  };

  $.rdf.literal.fn.init.prototype = $.rdf.literal.fn;

  $.rdf.literal.defaults = {
    base: $.uri.base(),
    namespaces: {},
    datatype: undefined,
    lang: undefined
  };

})(jQuery);
/*
 * jQuery RDF @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 *  jquery.rdf.js
 *  jquery.json.js
 */
/**
 * @fileOverview jQuery RDF/JSON parser
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 */
/**
 * @exports $ as jQuery
 */
/**
 * @ignore
 */
(function ($) {

  $.rdf.parsers['application/json'] = {
    parse: $.secureEvalJSON,
    serialize: $.toJSON,
    triples: function (data) {
      var s, subject, p, property, o, object, i, opts, triples = [];
      for (s in data) {
        subject = (s.substring(0, 2) === '_:') ? $.rdf.blank(s) : $.rdf.resource('<' + s + '>');
        for (p in data[s]) {
          property = $.rdf.resource('<' + p + '>');
          for (i = 0; i < data[s][p].length; i += 1) {
            o = data[s][p][i];
            if (o.type === 'uri') {
              object = $.rdf.resource('<' + o.value + '>');
            } else if (o.type === 'bnode') {
              object = $.rdf.blank(o.value);
            } else {
              // o.type === 'literal'
              if (o.datatype !== undefined) {
                object = $.rdf.literal(o.value, { datatype: o.datatype });
              } else {
                opts = {};
                if (o.lang !== undefined) {
                  opts.lang = o.lang;
                }
                object = $.rdf.literal('"' + o.value + '"', opts);
              }
            }
            triples.push($.rdf.triple(subject, property, object));
          }
        }
      }
      return triples;
    },
    dump: function (triples) {
      var e = {},
        i, t, s, p;
      for (i = 0; i < triples.length; i += 1) {
        t = triples[i];
        s = t.subject.value.toString();
        p = t.property.value.toString();
        if (e[s] === undefined) {
          e[s] = {};
        }
        if (e[s][p] === undefined) {
          e[s][p] = [];
        }
        e[s][p].push(t.object.dump());
      }
      return e;
    }
  };

})(jQuery);
/*
 * jQuery RDF @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 *  jquery.rdf.js
 *  jquery.rdf.json.js
 *  jquery.rdf.xml.js
 */
/**
 * @fileOverview jQuery RDF/XML parser
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 */
/**
 * @exports $ as jQuery
 */
/**
 * @ignore
 */
(function ($) {
  var
    rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  
    addAttribute = function (parent, namespace, name, value) {
      var doc = parent.ownerDocument,
        a;
      if (namespace !== undefined && namespace !== null) {
        if (doc.createAttributeNS) {
          a = doc.createAttributeNS(namespace, name);
          a.nodeValue = value;
          parent.attributes.setNamedItemNS(a);
        } else {
          a = doc.createNode(2, name, namespace);
          a.nodeValue = value;
          parent.attributes.setNamedItem(a);
        }
      } else {
        a = doc.createAttribute(name);
        a.nodeValue = value;
        parent.attributes.setNamedItem(a);
      }
      return parent;
    },

    createXmlnsAtt = function (parent, namespace, prefix) {
      if (namespace === 'http://www.w3.org/XML/1998/namespace' || namespace === 'http://www.w3.org/2000/xmlns/') {
      } else if (prefix) {
        addAttribute(parent, 'http://www.w3.org/2000/xmlns/', 'xmlns:' + prefix, namespace);
      } else {
        addAttribute(parent, undefined, 'xmlns', namespace);
      }
      return parent;
    },

    createDocument = function (namespace, name) {
      var doc, xmlns = '', prefix, addAttribute = false;
      if (namespace !== undefined && namespace !== null) {
        if (/:/.test(name)) {
          prefix = /([^:]+):/.exec(name)[1];
        }
        addAttribute = true;
      }
      if (document.implementation &&
          document.implementation.createDocument) {
        doc = document.implementation.createDocument(namespace, name, null);
        if (addAttribute) {
          createXmlnsAtt(doc.documentElement, namespace, prefix);
        }
        return doc;
      } else {
        doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
        if (prefix === undefined) {
          xmlns = ' xmlns="' + namespace + '"';
        } else {
          xmlns = ' xmlns:' + prefix + '="' + namespace + '"';
        }
        doc.loadXML('<' + name + xmlns + '/>');
        return doc;
      }
    },

    appendElement = function (parent, namespace, name, indent) {
      var doc = parent.ownerDocument,
        e;
      if (namespace !== undefined && namespace !== null) {
        e = doc.createElementNS ? doc.createElementNS(namespace, name) : doc.createNode(1, name, namespace);
      } else {
        e = doc.createElement(name);
      }
      if (indent !== -1) {
        appendText(parent, '\n');
        if (indent === 0) {
          appendText(parent, '\n');
        } else {
          appendText(parent, '  ');
        }
      }
      parent.appendChild(e);
      return e;
    },

    appendText = function (parent, text) {
      var doc = parent.ownerDocument,
        t;
      t = doc.createTextNode(text);
      parent.appendChild(t);
      return parent;
    },

    appendXML = function (parent, xml) {
      var parser, doc, i, child;
      try {
        doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = "false";
        doc.loadXML('<temp>' + xml + '</temp>');
      } catch(e) {
        parser = new DOMParser();
        doc = parser.parseFromString('<temp>' + xml + '</temp>', 'text/xml');
      }
      for (i = 0; i < doc.documentElement.childNodes.length; i += 1) {
        parent.appendChild(doc.documentElement.childNodes[i].cloneNode(true));
      }
      return parent;
    },

    createRdfXml = function (triples, options) {
      var doc = createDocument(rdfNs, 'rdf:RDF'),
        dump = $.rdf.parsers['application/json'].dump(triples),
        namespaces = options.namespaces || {},
        indent = options.indent || false,
        n, s, se, p, pe, i, v,
        m, local, ns, prefix;
      for (n in namespaces) {
        createXmlnsAtt(doc.documentElement, namespaces[n], n);
      }
      for (s in dump) {
        if (dump[s][$.rdf.type.value] !== undefined) {
          m = /(.+[#\/])([^#\/]+)/.exec(dump[s][$.rdf.type.value][0].value);
          ns = m[1];
          local = m[2];
          for (n in namespaces) {
            if (namespaces[n].toString() === ns) {
              prefix = n;
              break;
            }
          }
          se = appendElement(doc.documentElement, ns, prefix + ':' + local, indent ? 0 : -1);
        } else {
          se = appendElement(doc.documentElement, rdfNs, 'rdf:Description', indent ? 0 : -1);
        }
        if (/^_:/.test(s)) {
          addAttribute(se, rdfNs, 'rdf:nodeID', s.substring(2));
        } else {
          addAttribute(se, rdfNs, 'rdf:about', s);
        }
        for (p in dump[s]) {
          if (p !== $.rdf.type.value.toString() || dump[s][p].length > 1) {
            m = /(.+[#\/])([^#\/]+)/.exec(p);
            ns = m[1];
            local = m[2];
            for (n in namespaces) {
              if (namespaces[n].toString() === ns) {
                prefix = n;
                break;
              }
            }
            for (i = (p === $.rdf.type.value.toString() ? 1 : 0); i < dump[s][p].length; i += 1) {
              v = dump[s][p][i];
              pe = appendElement(se, ns, prefix + ':' + local, indent ? 1 : -1);
              if (v.type === 'uri') {
                addAttribute(pe, rdfNs, 'rdf:resource', v.value);
              } else if (v.type === 'literal') {
                if (v.datatype !== undefined) {
                  if (v.datatype === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral') {
                    addAttribute(pe, rdfNs, 'rdf:parseType', 'Literal');
                    if (indent) {
                      appendText(pe, '\n    ');
                    }
                    appendXML(pe, v.value);
                    if (indent) {
                      appendText(pe, '\n  ');
                    }
                  } else {
                    addAttribute(pe, rdfNs, 'rdf:datatype', v.datatype);
                    appendText(pe, v.value);
                  }
                } else if (v.lang !== undefined) {
                  addAttribute(pe, 'http://www.w3.org/XML/1998/namespace', 'xml:lang', v.lang);
                  appendText(pe, v.value);
                } else {
                  appendText(pe, v.value);
                }
              } else {
                // blank node
                addAttribute(pe, rdfNs, 'rdf:nodeID', v.value.substring(2));
              }
            }
            if (indent) {
              appendText(se, '\n');
            }
          }
        }
      }
      if (indent) {
        appendText(doc.documentElement, '\n\n');
      }
      return doc;
    },

    getDefaultNamespacePrefix = function (namespaceUri) {
      switch (namespaceUri) {
        case 'http://www.w3.org/1999/02/22-rdf-syntax-ns':
          return 'rdf';
        case 'http://www.w3.org/XML/1998/namespace':
          return 'xml';
        case 'http://www.w3.org/2000/xmlns/':
          return 'xmlns';
        default:
          throw ('No default prefix mapped for namespace ' + namespaceUri);
      }
    },

    hasAttributeNS  = function(elem, namespace, name){
      var basename;
      if (elem.hasAttributeNS) {
        return elem.hasAttributeNS(namespace, name);
      } else {
        try {
          basename = /:/.test(name) ? /:(.+)$/.exec(name)[1] : name;
          return elem.attributes.getQualifiedItem(basename, namespace) !== null;
        } catch (e) {
          return elem.getAttribute(getDefaultNamespacePrefix(namespace) + ':' + name) !== null;
        }
      }
    },

    getAttributeNS = function(elem, namespace, name){
      var basename;
      if (elem.getAttributeNS) {
        return elem.getAttributeNS(namespace, name);
      } else {
        try {
          basename = /:/.test(name) ? /:(.+)$/.exec(name)[1] : name;
          return elem.attributes.getQualifiedItem(basename, namespace).nodeValue;
        } catch (e) {
          return elem.getAttribute(getDefaultNamespacePrefix(namespace) + ':' + name);
        }
      }
    },

    getLocalName = function(elem){
      return elem.localName || elem.baseName;
    },

    parseRdfXmlSubject = function (elem, base) {
      var s, subject;
      if (hasAttributeNS(elem, rdfNs, 'about')) {
        s = getAttributeNS(elem, rdfNs, 'about');
        subject = $.rdf.resource('<' + s + '>', { base: base });
      } else if (hasAttributeNS(elem, rdfNs, 'ID')) {
        s = getAttributeNS(elem, rdfNs, 'ID');
        subject = $.rdf.resource('<#' + s + '>', { base: base });
      } else if (hasAttributeNS(elem, rdfNs, 'nodeID')) {
        s = getAttributeNS(elem, rdfNs, 'nodeID');
        subject = $.rdf.blank('_:' + s);
      } else {
        subject = $.rdf.blank('[]');
      }
      return subject;
    },

    parseRdfXmlDescription = function (elem, isDescription, base, lang) {
      var subject, p, property, o, object, reified, lang, i, j, li = 1,
        collection1, collection2, collectionItem, collectionItems = [],
        parseType, serializer, literalOpts = {}, oTriples, triples = [];
      lang = getAttributeNS(elem, 'http://www.w3.org/XML/1998/namespace', 'lang') || lang;
      base = getAttributeNS(elem, 'http://www.w3.org/XML/1998/namespace', 'base') || base;
      if (lang !== null && lang !== undefined && lang !== '') {
        literalOpts = { lang: lang };
      }
      subject = parseRdfXmlSubject(elem, base);
      if (isDescription && (elem.namespaceURI !== rdfNs || getLocalName(elem) !== 'Description')) {
        property = $.rdf.type;
        object = $.rdf.resource('<' + elem.namespaceURI + getLocalName(elem) + '>');
        triples.push($.rdf.triple(subject, property, object));
      }
      for (i = 0; i < elem.attributes.length; i += 1) {
        p = elem.attributes.item(i);
        if (p.namespaceURI !== undefined &&
            p.namespaceURI !== 'http://www.w3.org/2000/xmlns/' &&
            p.namespaceURI !== 'http://www.w3.org/XML/1998/namespace' &&
            p.prefix !== 'xmlns' &&
            p.prefix !== 'xml') {
          if (p.namespaceURI !== rdfNs) {
            property = $.rdf.resource('<' + p.namespaceURI + getLocalName(p) + '>');
            object = $.rdf.literal(literalOpts.lang ? p.nodeValue : '"' + p.nodeValue + '"', literalOpts);
            triples.push($.rdf.triple(subject, property, object));
          } else if (getLocalName(p) === 'type') {
            property = $.rdf.type;
            object = $.rdf.resource('<' + p.nodeValue + '>', { base: base });
            triples.push($.rdf.triple(subject, property, object));
          }
        }
      }
      for (i = 0; i < elem.childNodes.length; i += 1) {
        p = elem.childNodes[i];
        if (p.nodeType === 1) {
          if (p.namespaceURI === rdfNs && getLocalName(p) === 'li') {
            property = $.rdf.resource('<' + rdfNs + '_' + li + '>');
            li += 1;
          } else {
            property = $.rdf.resource('<' + p.namespaceURI + getLocalName(p) + '>');
          }
          lang = getAttributeNS(p, 'http://www.w3.org/XML/1998/namespace', 'lang') || lang;
          if (lang !== null && lang !== undefined && lang !== '') {
            literalOpts = { lang: lang };
          }
          if (hasAttributeNS(p, rdfNs, 'resource')) {
            o = getAttributeNS(p, rdfNs, 'resource');
            object = $.rdf.resource('<' + o + '>', { base: base });
          } else if (hasAttributeNS(p, rdfNs, 'nodeID')) {
            o = getAttributeNS(p, rdfNs, 'nodeID');
            object = $.rdf.blank('_:' + o);
          } else if (hasAttributeNS(p, rdfNs, 'parseType')) {
            parseType = getAttributeNS(p, rdfNs, 'parseType');
            if (parseType === 'Literal') {
              try {
                serializer = new XMLSerializer();
                o = serializer.serializeToString(p.getElementsByTagName('*')[0]);
              } catch (e) {
                o = "";
                for (j = 0; j < p.childNodes.length; j += 1) {
                  o += p.childNodes[j].xml;
                }
              }
              object = $.rdf.literal(o, { datatype: rdfNs + 'XMLLiteral' });
            } else if (parseType === 'Resource') {
              oTriples = parseRdfXmlDescription(p, false, base, lang);
              if (oTriples.length > 0) {
                object = oTriples[oTriples.length - 1].subject;
                triples = triples.concat(oTriples);
              } else {
                object = $.rdf.blank('[]');
              }
            } else if (parseType === 'Collection') {
              if (p.getElementsByTagName('*').length > 0) {
                for (j = 0; j < p.childNodes.length; j += 1) {
                  o = p.childNodes[j];
                  if (o.nodeType === 1) {
                    collectionItems.push(o);
                  }
                }
                collection1 = $.rdf.blank('[]');
                object = collection1;
                for (j = 0; j < collectionItems.length; j += 1) {
                  o = collectionItems[j];
                  oTriples = parseRdfXmlDescription(o, true, base, lang);
                  if (oTriples.length > 0) {
                    collectionItem = oTriples[oTriples.length - 1].subject;
                    triples = triples.concat(oTriples);
                  } else {
                    collectionItem = parseRdfXmlSubject(o);
                  }
                  triples.push($.rdf.triple(collection1, $.rdf.first, collectionItem));
                  if (j === collectionItems.length - 1) {
                    triples.push($.rdf.triple(collection1, $.rdf.rest, $.rdf.nil));
                  } else {
                    collection2 = $.rdf.blank('[]');
                    triples.push($.rdf.triple(collection1, $.rdf.rest, collection2));
                    collection1 = collection2;
                  }
                }
              } else {
                object = $.rdf.nil;
              }
            }
          } else if (hasAttributeNS(p, rdfNs, 'datatype')) {
            o = p.childNodes[0].nodeValue;
            object = $.rdf.literal(o, { datatype: getAttributeNS(p, rdfNs, 'datatype') });
          } else if (p.getElementsByTagName('*').length > 0) {
            for (j = 0; j < p.childNodes.length; j += 1) {
              o = p.childNodes[j];
              if (o.nodeType === 1) {
                oTriples = parseRdfXmlDescription(o, true, base, lang);
                if (oTriples.length > 0) {
                  object = oTriples[oTriples.length - 1].subject;
                  triples = triples.concat(oTriples);
                } else {
                  object = parseRdfXmlSubject(o);
                }
              }
            }
          } else if (p.childNodes.length > 0) {
            o = p.childNodes[0].nodeValue;
            object = $.rdf.literal(literalOpts.lang ? o : '"' + o + '"', literalOpts);
          } else {
            oTriples = parseRdfXmlDescription(p, false, base, lang);
            if (oTriples.length > 0) {
              object = oTriples[oTriples.length - 1].subject;
              triples = triples.concat(oTriples);
            } else {
              object = $.rdf.blank('[]');
            }
          }
          triples.push($.rdf.triple(subject, property, object));
          if (hasAttributeNS(p, rdfNs, 'ID')) {
            reified = $.rdf.resource('<#' + getAttributeNS(p, rdfNs, 'ID') + '>', { base: base });
            triples.push($.rdf.triple(reified, $.rdf.subject, subject));
            triples.push($.rdf.triple(reified, $.rdf.property, property));
            triples.push($.rdf.triple(reified, $.rdf.object, object));
          }
        }
      }
      return triples;
    },

    parseRdfXml = function (doc) {
      var i, base, lang, d, triples = [];
      if (doc.documentElement.namespaceURI === rdfNs && getLocalName(doc.documentElement) === 'RDF') {
        lang = getAttributeNS(doc.documentElement, 'http://www.w3.org/XML/1998/namespace', 'lang');
        base = getAttributeNS(doc.documentElement, 'http://www.w3.org/XML/1998/namespace', 'base') || $.uri.base();
        triples = $.map(doc.documentElement.childNodes, function (d) {
          if (d.nodeType === 1) {
            return parseRdfXmlDescription(d, true, base, lang);
          } else {
            return null;
          }
        });
        /*
        for (i = 0; i < doc.documentElement.childNodes.length; i += 1) {
          d = doc.documentElement.childNodes[i];
          if (d.nodeType === 1) {
            triples = triples.concat(parseRdfXmlDescription(d, true, base, lang));
          }
        }
        */
      } else {
        triples = parseRdfXmlDescription(doc.documentElement, true);
      }
      return triples;
    };

  $.rdf.parsers['application/rdf+xml'] = {
    parse: function (data) {
      var doc;
      try {
        doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
        doc.loadXML(data);
      } catch(e) {
        var parser = new DOMParser();
        doc = parser.parseFromString(data, 'text/xml');
      }
      return doc;
    },
    serialize: function (data) {
      if (data.xml) {
        return data.xml.replace(/\s+$/,'');
      } else {
        serializer = new XMLSerializer();
        return serializer.serializeToString(data);
      }
    },
    triples: parseRdfXml,
    dump: createRdfXml
  };

})(jQuery);
/*
 * jQuery RDFa @VERSION
 *
 * Copyright (c) 2008,2009 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/**
 * @fileOverview jQuery RDFa processing
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 * @requires jquery.uri.js
 * @requires jquery.xmlns.js
 * @requires jquery.curie.js
 * @requires jquery.datatype.js
 * @requires jquery.rdf.js
 */
(function ($) {

  var
    ns = {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      xml: 'http://www.w3.org/XML/1998/namespace',
      xmlns: 'http://www.w3.org/2000/xmlns/'
    },

    rdfXMLLiteral = ns.rdf + 'XMLLiteral',

    rdfaCurieDefaults = $.fn.curie.defaults,
    relReserved = [
      'alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright',
      'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
      'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up'
    ],

    attRegex = /\s([^ =]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^ >]+))/g,
    
    ncNameChar = '[-A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF\.0-9\u00B7\u0300-\u036F\u203F-\u2040]',
    ncNameStartChar = '[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4-\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7-\u04C8\u04CB-\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8-\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5-\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B36-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60-\u0D61\u0E01-\u0E2E\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EAE\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102-\u1103\u1105-\u1107\u1109\u110B-\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154-\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D-\u116E\u1172-\u1173\u1175\u119E\u11A8\u11AB\u11AE-\u11AF\u11B7-\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A-\u212B\u212E\u2180-\u2182\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\uAC00-\uD7A3\u4E00-\u9FA5\u3007\u3021-\u3029_]',
    ncNameRegex = new RegExp('^' + ncNameStartChar + ncNameChar + '*$'),

    docResource = $.rdf.resource('<>'),

    parseEntities = function (string) {
      var result = "", m, entity;
      if (!/&/.test(string)) {
         return string;
      }
      while (string.length > 0) {
        m = /([^&]*)(&([^;]+);)(.*)/g.exec(string);
        if (m === null) {
          result += string;
          break;
        }
        result += m[1];
        entity = m[3];
        string = m[4];
        if (entity.charAt(0) === '#') {
          if (entity.charAt(1) === 'x') {
              result += String.fromCharCode(parseInt(entity.substring(2), 16));
          } else {
              result += String.fromCharCode(parseInt(entity.substring(1), 10));
          }
        } else {
          switch(entity) {
            case 'amp':
              result += '&';
              break;
            case 'nbsp':
              result += String.fromCharCode(160);
              break;
            case 'quot':
              result += '"';
              break;
            case 'apos':
              result += "'";
              break;
            default:
              result += '&' + entity + ';';
          }
        }
      }
      return result;
    },

    getAttributes = function (elem) {
      var i, e, a, tag, name, value, attMap, prefix,
        atts = {},
        nsMap = {};
      e = elem[0];
      nsMap[':length'] = 0;
      if (e.attributes && e.attributes.getNamedItemNS) {
        attMap = e.attributes;
        for (i = 0; i < attMap.length; i += 1) {
          a = attMap[i];
          if (/^xmlns(:(.+))?$/.test(a.nodeName) && a.nodeValue !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(a.nodeValue);
              nsMap[':length'] += 1;
            }
//          } else if (/rel|rev|lang|xml:lang/.test(a.nodeName)) {
//            atts[a.nodeName] = a.nodeValue === '' ? undefined : a.nodeValue;
          } else if (/rel|rev|lang|xml:lang|about|href|src|resource|property|typeof|content|datatype/.test(a.nodeName)) {
            atts[a.nodeName] = a.nodeValue === null ? undefined : a.nodeValue;
          }
        }
      } else {
        tag = /<[^>]+>/.exec(e.outerHTML);
        a = attRegex.exec(tag);
        while (a !== null) {
          name = a[1];
          value = a[2] || a[3] || a[4];
          if (/^xmlns/.test(name) && name !== 'xmlns:' && value !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(name)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(value);
              nsMap[':length'] += 1;
            }
          } else if (/about|href|src|resource|property|typeof|content|datatype|rel|rev|lang|xml:lang/.test(name)) {
            atts[name] = parseEntities(value);
          }
          a = attRegex.exec(tag);
        }
        attRegex.lastIndex = 0;
      }
      return { atts: atts, namespaces: nsMap };
    },

    getAttribute = function (elem, attr) {
      var val = elem[0].getAttribute(attr);
//      if (attr === 'rev' || attr === 'rel' || attr === 'lang' || attr === 'xml:lang') {
//        val = val === '' ? undefined : val;
//      }
      return val === null ? undefined : val;
    },

    resourceFromUri = function (uri) {
      return $.rdf.resource(uri);
    },

    resourceFromCurie = function (curie, elem, noblanks, options) {
      if (curie.substring(0, 2) === '_:') {
        if (noblanks) {
          return undefined;
        }
        return $.rdf.blank(curie);
      } else {
        try {
          return resourceFromUri($.curie(curie, options));
        } catch (e) {
          return undefined;
        }
      }
    },

    resourceFromSafeCurie = function (safeCurie, elem, options) {
      var m = /^\[(.*)\]$/.exec(safeCurie),
        base = options.base || elem.base();
      return m ? resourceFromCurie(m[1], elem, false, options) : resourceFromUri($.uri(safeCurie, base));
    },

    resourcesFromCuries = function (curies, elem, noblanks, options) {
      var i, resource, resources = [];
      curies = curies && curies.split ? curies.split(/[ \t\n\r\x0C]+/g) : [];
      for (i = 0; i < curies.length; i += 1) {
        if (curies[i] !== '') {
          resource = resourceFromCurie(curies[i], elem, noblanks, options);
          if (resource !== undefined) {
            resources.push(resource);
          }
        }
      }
      return resources;
    },

    removeCurie = function (curies, resource, options) {
      var i, r, newCuries = [];
      resource = resource.type === 'uri' ? resource : $.rdf.resource(resource, options);
      curies = curies && curies.split ? curies.split(/\s+/) : [];
      for (i = 0; i < curies.length; i += 1) {
        if (curies[i] !== '') {
          r = resourceFromCurie(curies[i], null, false, options);
          if (r !== resource) {
            newCuries.push(curies[i]);
          }
        }
      }
      return newCuries.reverse().join(' ');
    },

    getObjectResource = function (elem, context, relation) {
      var r, resource, atts, curieOptions;
      context = context || {};
      atts = context.atts || getAttributes(elem).atts;
      r = relation === undefined ? atts.rel !== undefined || atts.rev !== undefined : relation;
      resource = atts.resource;
      resource = resource === undefined ? atts.href : resource;
      if (resource === undefined) {
        resource = r ? $.rdf.blank('[]') : resource;
      } else {
        curieOptions = context.curieOptions || $.extend({}, rdfaCurieDefaults, { namespaces: elem.xmlns() });
        resource = resourceFromSafeCurie(resource, elem, curieOptions);
      }
      return resource;
    },

    getSubject = function (elem, context, relation) {
      var r, atts, curieOptions, subject, skip = false;
      context = context || {};
      atts = context.atts || getAttributes(elem).atts;
      curieOptions = context.curieOptions || $.extend({}, rdfaCurieDefaults, { namespaces: elem.xmlns(), base: elem.base() });
      r = relation === undefined ? atts.rel !== undefined || atts.rev !== undefined : relation;
      if (atts.about !== undefined) {
        subject = resourceFromSafeCurie(atts.about, elem, curieOptions);
      }
      if (subject === undefined && atts.src !== undefined) {
        subject = resourceFromSafeCurie(atts.src, elem, curieOptions);
      }
      if (!r && subject === undefined && atts.resource !== undefined) {
        subject = resourceFromSafeCurie(atts.resource, elem, curieOptions);
      }
      if (!r && subject === undefined && atts.href !== undefined) {
        subject = resourceFromSafeCurie(atts.href, elem, curieOptions);
      }
      if (subject === undefined) {
        if (/^(head|body)$/i.test(elem[0].nodeName)) {
          subject = docResource;
        } else if (atts['typeof'] !== undefined) {
          subject = $.rdf.blank('[]');
        } else if (elem[0].parentNode.nodeType === 1) {
          subject = context.object || getObjectResource(elem.parent()) || getSubject(elem.parent()).subject;
          skip = !r && atts.property === undefined;
        } else {
          subject = docResource;
        }
      }
      return { subject: subject, skip: skip };
    },

    getLang = function (elem, context) {
      var lang;
      context = context || {};
      if (context.atts) {
        lang = context.atts.lang;
        lang = lang || context.atts['xml:lang'];
      } else {
        lang = elem[0].getAttribute('lang');
        try {
          lang = (lang === null || lang === '') ? elem[0].getAttribute('xml:lang') : lang;
        } catch (e) {
        }
        lang = (lang === null || lang === '') ? undefined : lang;
      }
      if (lang === undefined) {
        if (context.lang) {
          lang = context.lang;
        } else {
          if (elem[0].parentNode.nodeType === 1) {
            lang = getLang(elem.parent());
          }
        }
      }
      return lang;
    },

    entity = function (c) {
      switch (c) {
      case '<':
        return '&lt;';
      case '"':
        return '&quot;';
      case '&':
        return '&amp;';
      }
    },

    serialize = function (elem, ignoreNs) {
      var i, string = '', atts, a, name, ns, tag;
      elem.contents().each(function () {
        var j = $(this),
          e = j[0];
        if (e.nodeType === 1) { // tests whether the node is an element
          name = e.nodeName.toLowerCase();
          string += '<' + name;
          if (e.outerHTML) {
            tag = /<[^>]+>/.exec(e.outerHTML);
            a = attRegex.exec(tag);
            while (a !== null) {
              if (!/^jQuery/.test(a[1])) {
                string += ' ' + a[1] + '=';
                string += a[2] ? a[3] : '"' + a[1] + '"';
              }
              a = attRegex.exec(tag);
            }
            attRegex.lastIndex = 0;
          } else {
            atts = e.attributes;
            for (i = 0; i < atts.length; i += 1) {
              a = atts.item(i);
              string += ' ' + a.nodeName + '="';
              string += a.nodeValue.replace(/[<"&]/g, entity);
              string += '"';
            }
          }
          if (!ignoreNs) {
            ns = j.xmlns('');
            if (ns !== undefined && j.attr('xmlns') === undefined) {
              string += ' xmlns="' + ns + '"';
            }
          }
          string += '>';
          string += serialize(j, true);
          string += '</' + name + '>';
        } else if (e.nodeType === 8) { // tests whether the node is a comment
          string += '<!--';
          string += e.nodeValue;
          string += '-->';
        } else {
          string += e.nodeValue;
        }
      });
      return string;
    },

    rdfa = function (context) {
      var i, subject, resource, lang, datatype, content, text,
        types, object, triple, parent,
        properties, rels, revs,
        forward, backward,
        triples = [],
        callback, relCurieOptions,
        attsAndNs, atts, namespaces, ns,
        children = this.children();
      context = context || {};
      forward = context.forward || [];
      backward = context.backward || [];
      callback = context.callback || function () { return this; };
      attsAndNs = getAttributes(this);
      atts = attsAndNs.atts;
      context.atts = atts;
      namespaces = context.namespaces || this.xmlns();
      if (attsAndNs.namespaces[':length'] > 0) {
        namespaces = $.extend({}, namespaces);
        for (ns in attsAndNs.namespaces) {
          if (ns !== ':length') {
            namespaces[ns] = attsAndNs.namespaces[ns];
          }
        }
      }
      context.curieOptions = $.extend({}, rdfaCurieDefaults, { reserved: [], namespaces: namespaces, base: this.base() });
      relCurieOptions = $.extend({}, context.curieOptions, { reserved: relReserved });
      subject = getSubject(this, context);
      lang = getLang(this, context);
      if (subject.skip) {
        rels = context.forward;
        revs = context.backward;
        subject = context.subject;
        resource = context.object;
      } else {
        subject = subject.subject;
        if (forward.length > 0 || backward.length > 0) {
          parent = context.subject || getSubject(this.parent()).subject;
          for (i = 0; i < forward.length; i += 1) {
            triple = $.rdf.triple(parent, forward[i], subject, { source: this[0] });
            triple = callback.call(triple, this.get(0), triple);
            if (triple !== undefined && triple !== null) {
              triples = triples.concat(triple);
            }
          }
          for (i = 0; i < backward.length; i += 1) {
            triple = $.rdf.triple(subject, backward[i], parent, { source: this[0] });
            triple = callback.call(triple, this.get(0), triple);
            if (triple !== undefined && triple !== null) {
              triples = triples.concat(triple);
            }
          }
        }
        resource = getObjectResource(this, context);
        types = resourcesFromCuries(atts['typeof'], this, false, context.curieOptions);
        for (i = 0; i < types.length; i += 1) {
          triple = $.rdf.triple(subject, $.rdf.type, types[i], { source: this[0] });
          triple = callback.call(triple, this.get(0), triple);
          if (triple !== undefined && triple !== null) {
            triples = triples.concat(triple);
          }
        }
        properties = resourcesFromCuries(atts.property, this, true, context.curieOptions);
        if (properties.length > 0) {
          datatype = atts.datatype;
          content = atts.content;
          text = this.text().replace(/"/g, '\\"');
          if (datatype !== undefined && datatype !== '') {
            datatype = $.curie(datatype, context.curieOptions);
            if (datatype.toString() === rdfXMLLiteral) {
              object = $.rdf.literal(serialize(this), { datatype: rdfXMLLiteral });
            } else if (content !== undefined) {
              object = $.rdf.literal(content, { datatype: datatype });
            } else {
              object = $.rdf.literal(text, { datatype: datatype });
            }
          } else if (content !== undefined) {
            if (lang === undefined) {
              object = $.rdf.literal('"' + content + '"');
            } else {
              object = $.rdf.literal(content, { lang: lang });
            }
          } else if (children.length === 0 ||
                     datatype === '') {
            lang = getLang(this, context);
            if (lang === undefined) {
              object = $.rdf.literal('"' + text + '"');
            } else {
              object = $.rdf.literal(text, { lang: lang });
            }
          } else {
            object = $.rdf.literal(serialize(this), { datatype: rdfXMLLiteral });
          }
          for (i = 0; i < properties.length; i += 1) {
            triple = $.rdf.triple(subject, properties[i], object, { source: this[0] });
            triple = callback.call(triple, this.get(0), triple);
            if (triple !== undefined && triple !== null) {
              triples = triples.concat(triple);
            }
          }
        }
        rels = resourcesFromCuries(atts.rel, this, true, relCurieOptions);
        revs = resourcesFromCuries(atts.rev, this, true, relCurieOptions);
        if (atts.resource !== undefined || atts.href !== undefined) {
          // make the triples immediately
          if (rels !== undefined) {
            for (i = 0; i < rels.length; i += 1) {
              triple = $.rdf.triple(subject, rels[i], resource, { source: this[0] });
              triple = callback.call(triple, this.get(0), triple);
              if (triple !== undefined && triple !== null) {
                triples = triples.concat(triple);
              }
            }
          }
          rels = [];
          if (revs !== undefined) {
            for (i = 0; i < revs.length; i += 1) {
              triple = $.rdf.triple(resource, revs[i], subject, { source: this[0] });
              triple = callback.call(triple, this.get(0), triple);
              if (triple !== undefined && triple !== null) {
                triples = triples.concat(triple);
              }
            }
          }
          revs = [];
        }
      }
      children.each(function () {
        triples = triples.concat(rdfa.call($(this), { forward: rels, backward: revs, subject: subject, object: resource || subject, lang: lang, namespaces: namespaces, callback: callback }));
      });
      return triples;
    },

    gleaner = function (options) {
      var type, atts;
      if (options && options.about !== undefined) {
        atts = getAttributes(this).atts;
        if (options.about === null) {
          return atts.property !== undefined ||
                 atts.rel !== undefined ||
                 atts.rev !== undefined ||
                 atts['typeof'] !== undefined;
        } else {
          return getSubject(this, {atts: atts}).subject.value === options.about;
        }
      } else if (options && options.type !== undefined) {
        type = getAttribute(this, 'typeof');
        if (type !== undefined) {
          return options.type === null ? true : this.curie(type) === options.type;
        }
        return false;
      } else {
        return rdfa.call(this, options);
      }
    },

    nsCounter = 1,

    createCurieAttr = function (elem, attr, uri) {
      var m, curie, value;
      try {
        curie = elem.createCurie(uri);
      } catch (e) {
        if (uri.toString() === rdfXMLLiteral) {
          elem.attr('xmlns:rdf', ns.rdf);
          curie = 'rdf:XMLLiteral';
        } else {
          m = /^(.+[\/#])([^#]+)$/.exec(uri);
          elem.attr('xmlns:ns' + nsCounter, m[1]);
          curie = 'ns' + nsCounter + ':' + m[2];
          nsCounter += 1;
        }
      }
      value = getAttribute(elem, attr);
      if (value !== undefined) {
        if ($.inArray(curie, value.split(/\s+/)) === -1) {
          elem.attr(attr, value + ' ' + curie);
        }
      } else {
        elem.attr(attr, curie);
      }
    },

    createResourceAttr = function (elem, attr, resource) {
      var ref;
      if (resource.type === 'bnode') {
        ref = '[_:' + resource.id + ']';
      } else {
        ref = $(elem).base().relative(resource.value);
      }
      elem.attr(attr, ref);
    },

    createSubjectAttr = function (elem, subject) {
      var s = getSubject(elem).subject;
      if (subject !== s) {
        createResourceAttr(elem, 'about', subject);
      }
      elem.removeData('rdfa.subject');
    },

    createObjectAttr = function (elem, object) {
      var o = getObjectResource(elem);
      if (object !== o) {
        createResourceAttr(elem, 'resource', object);
      }
      elem.removeData('rdfa.objectResource');
    },

    resetLang = function (elem, lang) {
      elem.wrapInner('<span></span>')
        .children('span')
        .attr('lang', lang);
      return elem;
    },

    addRDFa = function (triple) {
	
      var hasContent, hasRelation, hasRDFa, overridableObject, span,
        subject, sameSubject,
        object, sameObject,
        lang, content,
        i, atts,
        ns = this.xmlns();
      span = this;
      atts = getAttributes(this).atts;
      if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: ns, base: this.base() });
      } else if (triple.rdfquery) {
        addRDFa.call(this, triple.sources().get(0));
        return this;
      } else if (triple.length) {
        for (i = 0; i < triple.length; i += 1) {
          addRDFa.call(this, triple[i]);
        }
        return this;
      }
      hasRelation = atts.rel !== undefined || atts.rev !== undefined;
      hasRDFa = hasRelation || atts.property !== undefined || atts['typeof'] !== undefined;
      if (triple.object.type !== 'literal') {
        subject = getSubject(this, {atts: atts}, true).subject;
        object = getObjectResource(this, {atts: atts}, true);
        overridableObject = !hasRDFa && atts.resource === undefined;
        sameSubject = subject === triple.subject;
        sameObject = object === triple.object;
        if (triple.property === $.rdf.type) {
          if (sameSubject) {
            createCurieAttr(this, 'typeof', triple.object.value);
          } else if (hasRDFa) {
            span = this.wrapInner('<span />').children('span');
            createCurieAttr(span, 'typeof', triple.object.value);
            if (object !== triple.subject) {
              createSubjectAttr(span, triple.subject);
            }
          } else {
            createCurieAttr(this, 'typeof', triple.object.value);
            createSubjectAttr(this, triple.subject);
          }
        } else if (sameSubject) {
          // use a rel
          if (sameObject) {
            createCurieAttr(this, 'rel', triple.property.value);
          } else if (overridableObject || !hasRDFa) {
            createCurieAttr(this, 'rel', triple.property.value);
            createObjectAttr(this, triple.object);
          } else {
            span = this.wrap('<span />').parent();
            createCurieAttr(span, 'rev', triple.property.value);
            createSubjectAttr(span, triple.object);
          }
        } else if (subject === triple.object) {
          if (object === triple.subject) {
            // use a rev
            createCurieAttr(this, 'rev', triple.property.value);
          } else if (overridableObject || !hasRDFa) {
            createCurieAttr(this, 'rev', triple.property.value);
            createObjectAttr(this, triple.subject);
          } else {
            // wrap in a span with a rel
            span = this.wrap('<span />').parent();
            createCurieAttr(span, 'rel', triple.property.value);
            createSubjectAttr(span, triple.subject);
          }
        } else if (sameObject) {
          if (hasRDFa) {
            // use a rev on a nested span
            span = this.wrapInner('<span />').children('span');
            createCurieAttr(span, 'rev', triple.property.value);
            createObjectAttr(span, triple.subject);
            span = span.wrapInner('<span />').children('span');
            createSubjectAttr(span, triple.object);
            span = this;
          } else {
            createSubjectAttr(this, triple.subject);
            createCurieAttr(this, 'rel', triple.property.value);
          }
        } else if (object === triple.subject) {
          if (hasRDFa) {
            // wrap the contents in a span and use a rel
            span = this.wrapInner('<span />').children('span');
            createCurieAttr(span, 'rel', this.property.value);
            createObjectAttr(span, triple.object);
            span = span.wrapInner('<span />').children('span');
            createSubjectAttr(span, object);
            span = this;
          } else {
            // use a rev on this element
            createSubjectAttr(this, triple.object);
            createCurieAttr(this, 'rev', triple.property.value);
          }
        } else if (hasRDFa) {
          span = this.wrapInner('<span />').children('span');
          createCurieAttr(span, 'rel', triple.property.value);
          createSubjectAttr(span, triple.subject);
          createObjectAttr(span, triple.object);
          if (span.children('*').length > 0) {
            span = this.wrapInner('<span />').children('span');
            createSubjectAttr(span, subject);
          }
          span = this;
        } else {
          createCurieAttr(span, 'rel', triple.property.value);
          createSubjectAttr(this, triple.subject);
          createObjectAttr(this, triple.object);
          if (this.children('*').length > 0) {
            span = this.wrapInner('<span />').children('span');
            createSubjectAttr(span, subject);
            span = this;
          }
        }
      } else {
        subject = getSubject(this, {atts: atts}).subject;
        object = getObjectResource(this, {atts: atts});
        sameSubject = subject === triple.subject;
        hasContent = this.text() !== triple.object.value;
        if (atts.property !== undefined) {
          content = atts.content;
          sameObject = content !== undefined ? content === triple.object.value : !hasContent;
          if (sameSubject && sameObject) {
            createCurieAttr(this, 'property', triple.property.value);
          } else {
            span = this.wrapInner('<span />').children('span');
            return addRDFa.call(span, triple);
          }
        } else {
          if (object === triple.subject) {
            span = this.wrapInner('<span />').children('span');
            return addRDFa.call(span, triple);
          }
          createCurieAttr(this, 'property', triple.property.value);
          createSubjectAttr(this, triple.subject);
          if (hasContent) {
            if (triple.object.datatype && triple.object.datatype.toString() === rdfXMLLiteral) {
              this.html(triple.object.value);
            } else {
              this.attr('content', triple.object.value);
            }
          }
          lang = getLang(this);
          if (triple.object.lang) {
            if (lang !== triple.object.lang) {
              this.attr('lang', triple.object.lang);
              if (hasContent) {
                resetLang(this, lang);
              }
            }
          } else if (triple.object.datatype) {
            createCurieAttr(this, 'datatype', triple.object.datatype);
          } else {
            // the empty datatype ensures that any child elements that might be added won't mess up this triple
            if (!hasContent) {
              this.attr('datatype', '');
            }
            // the empty lang ensures that a language won't be assigned to the literal
            if (lang !== undefined) {
              this.attr('lang', '');
              if (hasContent) {
                resetLang(this, lang);
              }
            }
          }
        }
      }
      this.parents().andSelf().trigger("rdfChange");
      return span;
    },

    removeRDFa = function (what) {
      var span, atts, property, rel, rev, type,
        ns = this.xmlns();
      atts = getAttributes(this).atts;
      if (what.length) {
        for (i = 0; i < what.length; i += 1) {
          removeRDFa.call(this, what[i]);
        }
        return this;
      }
      hasRelation = atts.rel !== undefined || atts.rev !== undefined;
      hasRDFa = hasRelation || atts.property !== undefined || atts['typeof'] !== undefined;
      if (hasRDFa) {
        if (what.property !== undefined) {
          if (atts.property !== undefined) {
            property = removeCurie(atts.property, what.property, { namespaces: ns });
            if (property === '') {
              this.removeAttr('property');
            } else {
              this.attr('property', property);
            }
          }
          if (atts.rel !== undefined) {
            rel = removeCurie(atts.rel, what.property, { namespaces: ns });
            if (rel === '') {
              this.removeAttr('rel');
            } else {
              this.attr('rel', rel);
            }
          }
          if (atts.rev !== undefined) {
            rev = removeCurie(atts.rev, what.property, { namespaces: ns });
            if (rev === '') {
              this.removeAttr('rev');
            } else {
              this.attr('rev', rev);
            }
          }
        }
        if (what.type !== undefined) {
          if (atts['typeof'] !== undefined) {
            type = removeCurie(atts['typeof'], what.type, { namespaces: ns });
            if (type === '') {
              this.removeAttr('typeof');
            } else {
              this.attr('typeof', type);
            }
          }
        }
        if (atts.property === this.attr('property') && atts.rel === this.attr('rel') && atts.rev === this.attr('rev') && atts['typeof'] === this.attr('typeof')) {
          return removeRDFa.call(this.parent(), what);
        }
      }
      this.parents().andSelf().trigger("rdfChange");
      return this;
    };

  /**
   * Creates a {@link jQuery.rdf} object containing the RDF triples parsed from the RDFa found in the current jQuery selection or adds the specified triple as RDFa markup on each member of the current jQuery selection. To create an {@link jQuery.rdf} object, you will usually want to use {@link jQuery#rdf} instead, as this may perform other useful processing (such as of microformats used within the page).
   * @methodOf jQuery#
   * @name jQuery#rdfa
   * @param {jQuery.rdf.triple} [triple] The RDF triple to be added to each item in the jQuery selection.
   * @returns {jQuery.rdf}
   * @example
   * // Extract RDFa markup from all span elements contained inside #main
   * rdf = $('#main > span').rdfa();
   * @example
   * // Add RDFa markup to a particular element
   *  var span = $('#main > p > span');
   *  span.rdfa('&lt;> dc:date "2008-10-19"^^xsd:date .');
   */
  $.fn.rdfa = function (triple) {
    if (triple === undefined) {
      var triples = $.map($(this), function (elem) {
        return rdfa.call($(elem));
      });
      return $.rdf({ triples: triples });
    } else {
      $(this).each(function () {
        addRDFa.call($(this), triple);
      });
      return this;
    }
  };

  /**
   * Removes the specified RDFa markup from each of the items in the current jQuery selection. The input parameter can be either an object or an array of objects. The objects can either have a <code>type</code> property, in which case the specified type is removed from the RDFa provided on the selected elements, or a <code>property</code> property, in which case the specified property is removed from the RDFa provided on the selected elements.
   * @methodOf jQuery#
   * @name jQuery#removeRdfa
   * @param {Object|Object[]} triple The RDFa markup items to be removed
   * from the items in the jQuery selection.
   * @returns {jQuery} The original jQuery object.
   * @example 
   * // To remove a property resource or relation from an element 
   * $('#main > p > a').removeRdfa({ property: "dc:creator" });
   * @example
   * // To remove a type from an element
   * $('#main >p > a').removeRdfa({ type: "foaf:Person" });
   * @example
   * // To remove multiple triples from an element
   * $('#main > p > a').removeRdfa([{ property: "foaf:depicts" }, { property: "dc:creator" }]);
   */
  $.fn.removeRdfa = function (triple) {
    $(this).each(function () {
      removeRDFa.call($(this), triple);
    });
    return this;
  };

  $.rdf.gleaners.push({
      name: "rdfa",
      gleaner: gleaner
  });

})(jQuery);
/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/**
* @requires jquery.rdf.js
*/
(function($){
  //var $ = jQuery;

  $.microdata = {};

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-time-string
  function validTimeStringLength(s) {
    var m = /^(\d\d):(\d\d)(:(\d\d)(\.\d+)?)?/.exec(s);
    if (m && m[1]<=23 && m[2]<=59 && (!m[4] || m[4]<=59))
      return m[0].length;
    return 0;
  }

  function isValidTimeString(s) {
    return s && validTimeStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#number-of-days-in-month-month-of-year-year
  function daysInMonth(year, month) {
    if (month==1 || month==3 || month==5 || month==7 ||
        month==8 || month==10 || month==12) {
      return 31;
    } else if (month==4 || month==6 || month==9 || month==11) {
      return 30;
    } else if (month == 2 && (year%400==0 || (year%4==0 && year%100!=0))) {
      return 29;
    } else {
      return 28;
    }
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-date-string
  function validDateStringLength(s) {
    var m = /^(\d{4,})-(\d\d)-(\d\d)/.exec(s);
    if (m && m[1]>=1 && m[2]>=1 && m[2]<=12 && m[3]>=1 && m[3]<=daysInMonth(m[1],m[2]))
      return m[0].length;
    return 0;
  }

  function isValidDateString(s) {
    return s && validDateStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-global-date-and-time-string
  function isValidGlobalDateAndTimeString(s) {
    var skip = validDateStringLength(s);
    if (skip && s[skip] == 'T') {
      s = s.substr(skip+1);
      skip = validTimeStringLength(s);
      if (skip) {
        s = s.substr(skip);
        if (s == 'Z')
          return true;
        var m = /^[+-](\d\d):(\d\d)$/.exec(s);
        if (m && m[1]<=23 && m[2]<=59)
          return true;
      }
    }
    return false;
  }

  $.microdata.isValidGlobalDateAndTimeString = isValidGlobalDateAndTimeString;
  $.microdata.isValidDateString = isValidDateString;

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }
	
  function getItems(types) {
    var doc = this[0];
    if (doc.getItems)
      return $(types ? doc.getItems(types) : doc.getItems());
    var selector = $.map(splitTokens(types), function(t) {
      return '[itemtype~="'+t.replace(/"/g, '\\"')+'"]';
    }).join(',') || '*';
    // filter results to only match top-level items.
    // because [attr] selector doesn't work in IE we have to
    // filter the elements. http://dev.jquery.com/ticket/5637
    return $(selector, this).filter(function() {
      return (this.getAttribute('itemscope') != null &&
              this.getAttribute('itemprop') == null);
    });
  }

  // find the furthest ancestor (usually Document)
  function ancestor(node) {
    while (node.parentNode)
      node = node.parentNode;
    return node;
  }

  function resolve(elm, attr) {
    // in order to handle <base> and attributes which aren't properly
    // reflected as URLs, insert a temporary <img> element just before
    // elm and resolve using its src attribute. the <img> element must
    // be created using the parent document due IE security policy.
	var url = elm.getAttribute(attr);
    if (!url)
      return $.rdf.resource($.uri(''));
	else if(url.substring(0,2)=='_:')
	  return $.rdf.blank(url);	
	else {		
    var a = ancestor(elm);
    var p = elm.parentNode;
    var img = (a.createElement ? a : document).createElement('img');
    img.setAttribute('src', url);
    if (p)
      p.insertBefore(img, elm);
    url = img.src;
    if (p)
      p.removeChild(img);
    return $.rdf.resource($.uri(url));}
  }

  function getSubject(elm){
	if(elm.attr("itemid") || $(elm)===$("body")){
		return resolve(elm[0],"itemid");
	}
	else{
		if(elm.attr("id")){
			var ref = $('[itemref*="'+elm.attr("id")+'"]');
			if(ref.length!=0){
				return getSubject(ref[0]);
			}
			else{
				var p = elm.parent();
				return getSubject(parent);
			}
		}
		else{
			var p = elm.parent();
			return getSubject($(p));
		}
	}
  }
  
  function tokenList(attr) {
    return function() {
      return $(splitTokens(this.attr(attr)));
    };
  }

  function itemValue() {
    var elm = this[0];
    if (this.attr('itemprop') === undefined)
      return null;
    if (this.itemScope()) {
      return elm; // or a new jQuery object?
    }
    switch (elm.tagName.toUpperCase()) {
    case 'META':
      return this.attr('content') || '';
    case 'AUDIO':
    case 'EMBED':
    case 'IFRAME':
    case 'IMG':
    case 'SOURCE':
    case 'TRACK':
    case 'VIDEO':
      return resolve(elm, 'src');
    case 'A':
    case 'AREA':
    case 'LINK':
      return resolve(elm, 'href');
    case 'OBJECT':
      return resolve(elm, 'data');
    case 'TIME':
      var datetime = this.attr('datetime');
      if (!(datetime === undefined))
        return datetime;
    default:
      return this.text();
    }
  }

  	function parseEntities(string) {
      var result = "", m, entity;
      if (!/&/.test(string)) {
         return string;
      }
      while (string.length > 0) {
        m = /([^&]*)(&([^;]+);)(.*)/g.exec(string);
        if (m === null) {
          result += string;
          break;
        }
        result += m[1];
        entity = m[3];
        string = m[4];
        if (entity.charAt(0) === '#') {
          if (entity.charAt(1) === 'x') {
              result += String.fromCharCode(parseInt(entity.substring(2), 16));
          } else {
              result += String.fromCharCode(parseInt(entity.substring(1), 10));
          }
        } else {
          switch(entity) {
            case 'amp':
              result += '&';
              break;
            case 'nbsp':
              result += String.fromCharCode(160);
              break;
            case 'quot':
              result += '"';
              break;
            case 'apos':
              result += "'";
              break;
            default:
              result += '&' + entity + ';';
          }
        }
      }
      return result;
    }

    function getAttributes(elem) {
      var i, e, a, tag, name, value, attMap, prefix,
        atts = {},
        nsMap = {};
      e = elem[0];
      nsMap[':length'] = 0;
      if (e.attributes && e.attributes.getNamedItemNS) {
        attMap = e.attributes;
        for (i = 0; i < attMap.length; i += 1) {
          a = attMap[i];
          if (/^xmlns(:(.+))?$/.test(a.nodeName) && a.nodeValue !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(a.nodeValue);
              nsMap[':length'] += 1;
            }
          } else if (/lang|xml:lang|itemid|href|src|itemprop|itemtype|content|datetime/.test(a.nodeName)) {
            atts[a.nodeName] = a.nodeValue === null ? undefined : a.nodeValue;
          }
        }
      } else {
        tag = /<[^>]+>/.exec(e.outerHTML);
        a = attRegex.exec(tag);
        while (a !== null) {
          name = a[1];
          value = a[2] || a[3] || a[4];
          if (/^xmlns/.test(name) && name !== 'xmlns:' && value !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(name)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(value);
              nsMap[':length'] += 1;
            }
          } else if (/lang|xml:lang|itemid|href|src|imemprop|itemtype|content|datetime/.test(name)) {
            atts[name] = parseEntities(value);
          }
          a = attRegex.exec(tag);
        }
        attRegex.lastIndex = 0;
      }
      return { atts: atts, namespaces: nsMap };
    }
	
    function gleaner(options) {
      var type, atts;
      if (options && options.itemid !== undefined) {
        atts = getAttributes(this).atts;
        if (options.itemid === null) {
          return atts.itemprop !== undefined ||
                 atts['itemtype'] !== undefined;
        } else {
          return getSubject(this).value === options.itemid;
        }
      } else if (options && options.itemtype !== undefined) {
        type = this.attr('itemtype');
        if (type !== undefined) {
          return options.itemtype === null ? true : $.uri(type) === options.itemtype;
        }
        return false;
      } else {
        //return rdfa.call(this, options);
      }
    }	
  
  function properties(name) {
    // Find all elements that add properties to the item, optionally
    // filtered by a property name. Look in the subtrees rooted at the
    // item itself and any itemref'd elements. An item can never have
    // itself as a property, but circular reference is possible.

    var props = [];

    function crawl(root) {
      var toTraverse = [root];

      function traverse(node) {
        for (var i = 0; i < toTraverse.length; i++) {
          if (toTraverse[i] == node)
            toTraverse.splice(i--, 1);
        }
        var $node = $(node);
        if (node != root) {
          var $names = $node.itemProp();
          if ($names.length) {
            if (!name || $.inArray(name, $names.toArray()) != -1)
              props.push(node);
          }
          if ($node.itemScope())
            return;
        }
        $node.children().each(function() {
          traverse(this);
        });
      }

      var context = ancestor(root);
      $(root).itemRef().each(function(i, id) {
        var $ref = $('#'+id, context);
        if ($ref.length)
          toTraverse.push($ref[0]);
      });
      $.unique(toTraverse);

      while (toTraverse.length) {
        traverse(toTraverse[0]);
      }
    }

    if (this.itemScope())
      crawl(this[0]);

    // properties are already sorted in tree order
    return $(props);
  }

  // feature detection to use native support where available
  var t = $('<div itemscope itemtype="type" itemid="id" itemprop="prop" itemref="ref">')[0];

  $.fn.extend({
    items: getItems,
    itemScope: t.itemScope ? function() {
      return this[0].itemScope;
    } : function () {
      return this.attr('itemscope') != undefined;
    },
    itemType: t.itemType ? function() {
      return this[0].itemType;
    } : function () {
      return this.attr('itemtype') || '';
    },
    itemId: t.itemId ? function() {
      return this[0].itemId;
    } : function () {
      return resolve(this[0], 'itemid');
    },
    itemProp: t.itemProp && t.itemProp.length ? function() {
      return $(this[0].itemProp);
    } : tokenList('itemprop'),
    itemRef: t.itemRef && t.itemRef.length ? function() {
      return $(this[0].itemRef);
    } : tokenList('itemref'),
    itemValue: t.itemValue ? function() {
      return this[0].itemValue;
    } : itemValue,
    properties: t.properties && t.properties.namedItem ? function(name) {
      return $(name ? this[0].properties.namedItem(name) : this[0].properties);
    } : properties
  });
  
  $.rdf.gleaners.push({
      name: "microdata",
      gleaner: gleaner
  });
})(jQuery);
/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */

// http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#rdf
(function() {
  var $ = jQuery;

  // a small set of prefixes used by the microdata spec.
  // additional prefixes can be added externally, e.g.:
  //
  // jQuery.extend(jQuery.microdata.rdf.prefix, {
  //   'foo': 'http://example.com/foo#'
  // });
  $.microdata.rdf = {};
  $.microdata.rdf.prefix = {
    'xhv': 'http://www.w3.org/1999/xhtml/vocab#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'owl': 'http://www.w3.org/2002/07/owl#',
    'cc': 'http://creativecommons.org/ns#',
    'dc': 'http://purl.org/dc/terms/'
  };

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }

  function URI(uri) {
    if (uri)
      this.uri = uri; // URI node
    else
      this.uri = '_:n'+URI.prototype.blanks++; // blank node
  }
  URI.prototype.isBlank = function() {
    return this.uri.substr(0, 2) == '_:';
  };
  URI.prototype.equals = function(other) {
    return other instanceof URI && this.uri == other.uri;
  };
  
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#absolute-url
  function isAbsoluteURL(url) {
    // FIXME: not really!
    return url.substr(0, 7) == 'http://';
  }

  function getLang($elem) {
    for (; $elem[0].getAttribute; $elem = $elem.parent()) {
      if ($elem.attr('lang'))
        return $elem.attr('lang');
    }
    return undefined;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#fragment-escaped
  function fragmentEscape(s) {
    return s.replace(/[\"\#\%\<\>\[\\\]\^\{\|\}]/g, function(c) {
      return '%'+c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  
  function createCurieAttr(elem, attr, uri) {
      var m, curie, value;
      try {
        curie = elem.createCurie(uri);
      } catch (e) {
        if (uri.toString() === rdfXMLLiteral) {
          elem.attr('xmlns:rdf', ns.rdf);
          curie = 'rdf:XMLLiteral';
        } else {
          m = /^(.+[\/#])([^#]+)$/.exec(uri);
          elem.attr('xmlns:ns' + nsCounter, m[1]);
          curie = 'ns' + nsCounter + ':' + m[2];
          nsCounter += 1;
        }
      }
      value = getAttribute(elem, attr);
      if (value !== undefined) {
        if ($.inArray(curie, value.split(/\s+/)) === -1) {
          elem.attr(attr, value + ' ' + curie);
        }
      } else {
        elem.attr(attr, curie);
      }
    }

	function	createResourceAttr(elem, attr, resource) {
      var ref;
      if (resource.type === 'bnode') {
        ref = '[_:' + resource.id + ']';
      } else {
        ref = $(elem).base().relative(resource.value);
      }
      elem.attr(attr, ref);
    }
	

	
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#extracting-rdf
  function extractDocumentTriples(triples) {
    var $title = $('title').first();
    if ($title.length == 1)
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri('http://purl.org/dc/terms/title'),
                              $rdf.literal($title.text(), getLang($title))));

    $('a[rel][href],area[rel][href],link[rel][href]').each(function(i, elm) {
      var $elm = $(elm);
      var tokens = {};
      $.each(splitTokens($elm.attr('rel')), function(i, t) {
        t = t.toLowerCase();
        if (tokens[t])
          tokens[t]++;
        else
          tokens[t] = 1;
      });
      if (tokens.up && tokens.up > 1)
        delete tokens.up;
      if (tokens.alternate && tokens.stylesheet) {
        delete tokens.alternate;
        delete tokens.stylesheet;
        tokens['ALTERNATE-STYLESHEET'] = 1;
      }
      for (t in tokens) {
        var predicate;
        if (t.indexOf(':') == -1)
          predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(t);
        else if (isAbsoluteURL(t))
          predicate = t;
        else
          continue;
        // FIXME: resolve href
        triples.push($.rdf.triple($.uri(document.location.href),
                                $.uri(predicate),
                                $.uri(elm.href)));
      }
    });

    $('meta[name][content]').each(function(i, meta) {
      var $meta = $(meta);
      var name = $meta.attr('name');
      var predicate;
      if (name.indexOf(':') == -1)
        predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(name.toLowerCase());
      else if (isAbsoluteURL(name))
        predicate = name;
      else
        return;
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri(predicate),
                              $.rdf.literal($meta.attr('content'), getLang($meta))));
    });

    $('blockquote[cite],q[cite]').each(function(i, elm) {
      // FIXME: resolve cite attribute
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri('http://purl.org/dc/terms/source'),
                              $.uri($(elm).attr('cite'))));
    });

    // list of {item: ..., subject: ...} objects
    var memory = [];
    $(document).items().each(function(i, item) {
      var t = $.rdf.triple($.uri(document.location.href),
                         $.uri('http://www.w3.org/1999/xhtml/microdata#item'),
                         generateItemTriples(triples, item, memory));
      triples.push(t);
    });
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#generate-the-triples-for-an-item
  function generateItemTriples(triples, item, memory, fallbackType) {
    var $item = $(item);
    var subject;
    $.each(memory, function(i, e) {
      if (e.item == item) {
        subject = e.subject;
        return false;
      }
    });
    if (subject)
      return subject;
	subject = $item.itemId();
    memory.push({item: item, subject: subject});
    var type = '';
    if (isAbsoluteURL($item.itemType())) {
      type = $item.itemType();
      triples.push($.rdf.triple(subject,
                              $.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')),
                              $.rdf.resource($.uri(type))));
      if (type.indexOf('#') == -1)
        type += '#';
      if (type.indexOf(':') < type.indexOf('#'))
        type += ':';
    }
    if (!type && fallbackType)
      type = fallbackType;
    $item.properties().each(function(i, prop) {
      var $prop = $(prop);
      $prop.itemProp().each(function(i, name) {
        var value;
		if ($prop.itemScope()) {
          value = generateItemTriples(triples, prop, memory, type);
        } else if (/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(prop.tagName.toUpperCase())) {
          value = $prop.itemValue();
        } else {
          value = $.rdf.literal('"'+$prop.itemValue()+'"');
        }
        var predicate;
        if (isAbsoluteURL(name)) {
          predicate = name;
        } else if (name.indexOf(':') == -1) {
          predicate = 'http://www.w3.org/1999/xhtml/microdata#'+fragmentEscape(type+name);
        }
        triples.push($.rdf.triple(subject, $.rdf.resource($.uri(predicate)), value));
      });
    });
    return subject;
  }

  function getTurtle(triples) {
    var used = [];

    function format(term) {
      if (term instanceof Triple) {
        return format(term.s)+' '+format(term.p)+' '+format(term.o)+' .';
      } else if (term instanceof URI) {
        // blank nodes
        if (term.isBlank())
          return term.uri;
        // prefixed notation
        for (name in $.microdata.rdf.prefix) {
          var uri = $.microdata.rdf.prefix[name];
          if (term.uri.substr(0, uri.length) == uri) {
            if ($.inArray(name, used) == -1)
              used.push(name);
            return name+':'+term.uri.substr(uri.length);
          }
        }
        // plain URIs
        return '<'+term.uri+'>';
      } else if (term instanceof Literal) {
        return '"'+term.string.replace(/([\\"])/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n')+'"'+
          (term.lang ? ('@'+term.lang) : '');
      }
    }

    var body = '';
    while (triples.length) {
      var subject = triples[0].s;
      var batch = [];
      // extract all triples that share same subject into batch
      triples = $.grep(triples, function (t) {
        if (subject.equals(t.s)) {
          batch.push(t);
          return false;
        }
        // leave for the next round
        return true;
      });

      // print batch with same subject
      if (batch.length == 1) {
        // single-line output
        body += format(batch[0])+'\n';
      } else {
        // subject on first line, predicate-objects follow indented
        body += format(batch[0].s)+'\n';
        $.each(batch, function(i, t) {
          body += '  '+format(t.p)+' '+format(t.o)+' '+((i+1<batch.length)?';':'.')+'\n';
        });
      }
    }

    var head = '';
    $.each(used, function(i, name) {
        head += '@prefix '+name+': <'+$.microdata.rdf.prefix[name]+'> .\n';
    });
    return head+'\n'+body;
  }

  $.microdata.triples = function(selector, options) {
    options = $.extend({owl:false}, options);
    URI.prototype.blanks = 0;
    var triples = [];
    if (selector) {
      var memory = [];
      $(selector).each(function(i, item) {
			generateItemTriples(triples, item, memory);
      });
    } else {
      extractDocumentTriples(triples);
    }

    if (options.owl) {
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Awork'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/2002/07/owl#sameAs')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Atitle'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://purl.org/dc/terms/title')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Aauthor'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://creativecommons.org/ns#attributionName')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Alicense'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/1999/xhtml/vocab#license')));
    }

    return triples;
  };
  
  function addItemscope(selector){
	if(!selector.itemScope()){
		selector.attr("itemscope","");
		return true;
	}
	else{
		throw 'Failed to add "itemscope". Element already has "itemscope" attribute';
		return false;
	}
  }
  
  function addItemtype(selector,type){
	if(!selector.itemType()&&selector.itemScope()){
		createResourceAttr(selector, "itemtype", type);
		return true;
	}
	else{
		if(selector.itemType())
			{throw 'Failed to add "itemtype". Element already has "itemtype" attribute';}
		if(!selector.itemScope())
			{throw 'Failed to add "itemtype". Element must have "itemscope" attribute';}	
		return false;
	}
  }
  
  function addItemid(selector,id){
	if(!selector.attr("itemid") && selector.itemScope()){
		if(id!=$.uri("") && id!=$.rdf.resource("<>"))
			createResourceAttr(selector, "itemid", id);
		return true;
	}
	else{
		if(selector.attr("itemid")){
			if(id==selector.attr("itemid")){
				return true;
			}
			else{
				throw 'Failed to add "itemid". Element already has "itemid" attribute';
			}
		}
		if(!selector.itemScope()){
			throw 'Failed to add "itemid". Element must have "itemscope" attribute';
			return false;
		}	
	}
  }
  
  function addProperty(selector,name){
	createResourceAttr(selector,"itemprop",name);
  }
  
  $.microdata.addMicrodata = function(selector,triple){
	ns = $(selector).xmlns();
	if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: ns, base: $(selector).base() });
      } else if (triple.rdfquery) {
        addMicrodata.call($(selector), triple.sources().get(0));
        return $(selector);
      } else if (triple.length) {
        for (i = 0; i < triple.length; i += 1) {
          addMicrodata.call($(selector), triple[i]);
        }
        return $(selector);
      }

	var subject = triple.subject;
	var object = triple.object;
	var property = triple.property;

	var d = Date.parse(object);
	var hasMicrodata = selector.itemScope()||selector.attr('itemid')||selector.itemType()||selector.attr('itemprop')||selector.attr('itemref');
	var typedItem = property===$.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
	var fits;
	if(selector){
		if(!hasMicrodata){
			if(!(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO|META|TIME$/.test(selector[0].tagName.toUpperCase()))){
				fits = selector.text() == object.value || typedItem;
				if(fits){
					addItemscope(selector);
					addItemid(selector, subject);
					if(typedItem){
						addItemtype(selector, object);
					}
					else{
						selector.wrapInner('<span class="microdata"/>');
						createResourceAttr($(selector.children('.microdata')[0]), "itemprop", property);			
					}
				}
				else{
					throw "Failed to add microdata. Triple's object doesn't fit into the element.";
				}
			}
			else{
				selector.attr("itemprop","");
				fits = typedItem || selector.itemValue() == object.value || selector.itemValue().value == object.value;
				if(fits){
					createResourceAttr(selector, "itemprop", property);
					if(selector.attr("id")){
						selector.wrapInner('<span itemscope itemref="'+selector.attr("id")+'" class="microdata"/>');
					}
					else{
						var id = URI();
						selector.attr("id",subject.toString());
						selector.attr("class","microdata");
						selector.wrapInner('<span itemscope itemref="'+subject.toString()+'" class="microdata"/>');
					}
					addItemid($(selector.children('.microdata')[0]), subject);
					if(typedItem){
						addItemtype($(selector.children('.microdata')[0]), object);
					}
				}
				else{
					selector.removeAttr("itemprop");
					throw "Failed to add microdata. Triple's object doesn't fit into the element.";
				}	
			}
		}
		else{
			fits = typedItem && (selector.itemScope()&& subject == selector.itemId());
			if(fits){ //add type to item
				if(typedItem){
					addItemtype(selector, object);
				}	
			}
			fits = selector.itemScope()&& subject == selector.itemId() && object.value == selector.text();
			if(fits){ //add new property to item
				selector.wrapInner('<span class="microdata"/>');
				createResourceAttr($(selector.children('.microdata')[0]), "itemprop", property);
			}
		}
	}	
	selector.trigger("rdfChange");	
  };
  
    $.microdata.removeMicrodata = function(selector,triple){
		if(!triple){
			selector.removeAttr("itemscope");
			selector.removeAttr("itemid");
			selector.removeAttr("itemtype");
			if(selector.hasClass("microdata")&& !selector.attr("id")){
				selector.removeAttr("id");
			}
			selector.removeAttr("itemprop");
			if(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(selector[0].tagName.toUpperCase())){
				selector.removeAttr("itemprop");
			}
			else{
				selector.children().each(function(){
					if($(this).hasClass("microdata")){
						var inner = $(this).html();
						var parent = $(this).parent();
						var toremove = $(this); 
						toremove.remove();
						$(parent).append(inner);
					}
				});
				selector.children().each(function(){
					$.microdata.removeMicrodata($(this));
				});
			}
		}
		else{
			ns = $(selector).xmlns();
			if (typeof triple === 'string') {
				triple = $.rdf.triple(triple, { namespaces: ns, base: $(selector).base() });
			} else if (triple.rdfquery) {
				$.microdata.removeMicrodata.call($(selector), triple.sources().get(0));
				return $(selector);
			} else if (triple.length) {
				for (i = 0; i < triple.length; i += 1) {
					$.microdata.removeMicrodata.call($(selector), triple[i]);
				}
				return $(selector);
			}

			var subject = triple.subject;
			var object = triple.object;
			var property = triple.property;
			if(!(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO|META|TIME$/.test(selector[0].tagName.toUpperCase()))){
				var typedItem = property===$.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
				var fits = selector.text() == object.value || typedItem;
				fits = fits && subject == selector.itemId();
				var propChild = $('span[itemprop*="'+property.value.toString()+'"]');//??? add check that found elements are children of selector
				if(propChild.length!=0 && !typedItem){
					fits = true;}
				else{
					if(!typedItem){
						fits = false;
					}
				}
				if(fits){
					selector.removeAttr("itemscope");
					selector.removeAttr("itemid");
					if(typedItem){
						selector.removeAttr("itemtype");
					}
					else{
						if(propChild.hasClass("microdata")){
							var inner = propChild.html();
							var parent = propChild.parent();
							var toremove = $(this); 
							toremove.remove();
							parent.append(inner);
						}					
						else{
							propChild.removeAttr("itemprop");
						}
					}
				}
				else{
					throw "Failed to remove microdata. Triple's object doesn't fit into the element.";
				}
			}	
		} 
		selector.trigger("rdfChange");	
	};
	
})();
/*
 * jQuery RDF Rules @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 *  jquery.rdf.js
 */
/**
 * @fileOverview jQuery RDF Rules
 * @author <a href="mailto:jeni@jenitennison.com">Jeni Tennison</a>
 * @copyright (c) 2008,2009 Jeni Tennison
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 */
/**
 * @exports $ as jQuery
 */
/**
 * @ignore
 */
(function ($) {

  var
    blankNodeNum = 1;

  /**
   * <p>Creates a new jQuery.rdf.ruleset object. This should be invoked as a method rather than constructed using new.</p>
   * @class A jQuery.rdf.ruleset object represents a set of {@link jQuery.rdf.rule}s that can be run over a databank.
   * @param {jQuery.rdf.rule[]} [rules=[]] An array of rules with which the ruleset is initialised.
   * @param {Object} [options] Initialisation options for the ruleset.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings which are stored and used whenever a CURIE is used within a rule.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the rules.
   * @returns {jQuery.rdf.ruleset}
   * @example rules = jQuery.rdf.ruleset();
   * @see jQuery.rdf.rule
   */
  $.rdf.ruleset = function (rules, options) {
    return new $.rdf.ruleset.fn.init(rules, options);
  };

  $.rdf.ruleset.fn = $.rdf.ruleset.prototype = {
    init: function (rules, options) {
      var i,
        opts = $.extend({}, $.rdf.ruleset.defaults, options);
      rules = rules || [];
      this.baseURI = opts.base;
      this.namespaces = $.extend({}, opts.namespaces);
      this.rules = [];
      for (i = 0; i < rules.length; i += 1) {
        this.add.apply(this, rules[i]);
      }
      return this;
    },
    
    /**
     * Sets or returns the base URI of the {@link jQuery.rdf.ruleset}.
     * @param {String|jQuery.uri} [base]
     * @returns A {@link jQuery.uri} if no base URI is specified, otherwise returns this {@link jQuery.rdf.ruleset} object.
     * @example 
     * rules = $.rdf.ruleset()
     *   .base('http://www.example.org/');
     */
    base: function (uri) {
      if (uri === undefined) {
        return this.baseURI;
      } else {
        this.baseURI = uri;
        return this;
      }
    },
    
    /**
     * Sets or returns a namespace binding on the {@link jQuery.rdf.ruleset}.
     * @param {String} [prefix]
     * @param {String} [namespace]
     * @returns {Object|jQuery.uri|jQuery.rdf} If no prefix or namespace is specified, returns an object providing all namespace bindings on the {@link jQuery.rdf.ruleset}. If a prefix is specified without a namespace, returns the {@link jQuery.uri} associated with that prefix. Otherwise returns this {@link jQuery.rdf} object after setting the namespace binding.
     */
    prefix: function (prefix, uri) {
      if (prefix === undefined) {
        return this.namespaces;
      } else if (uri === undefined) {
        return this.namespaces[prefix];
      } else {
        this.namespaces[prefix] = uri;
        return this;
      }
    },
    
    /**
     * Returns the number of rules in this ruleset.
     * @returns {Integer}
     */
    size: function () {
      return this.rules.length;
    },
    
    /**
     * Adds a rule or set of rules to this ruleset.
     * @param {String|Array|Function|jQuery.rdf.pattern|jQuery.rdf.rule|jQuery.rdf.ruleset} lhs A {@link jQuery.rdf.rule} will be added directly. If a {@link jQuery.rdf.ruleset} is provided then all its rules will be added to this one. Otherwise, specifies the left hand side of the rule to be added, as in {@link jQuery.rdf.rule}.
     * @param {String|Function|jQuery.rdf.pattern} rhs The right hand side of the rule to be added.
     * @returns {jQuery.rdf.ruleset} Returns this {@link jQuery.rdf.ruleset}
     * @see jQuery.rdf.rule
     * @example
     * rules = $.rdf.ruleset()
     *   .prefix('foaf', ns.foaf)
     *   .add('?person a foaf:Person', '?person a foaf:Agent');
     */
    add: function (lhs, rhs) {
      var rule;
      if (rhs === undefined && lhs.rules) {
        this.rules = this.rules.concat(lhs.rules);
      } else {
        if (rhs === undefined && lhs.lhs) {
          rule = lhs;
        } else {
          rule = $.rdf.rule(lhs, rhs, { namespaces: this.prefix(), base: this.base() });
        }
        if ($.inArray(rule, this.rules) === -1) {
          this.rules.push(rule);
        }
      }
      return this;
    },
    
    /**
     * Runs the rules held in this ruleset on the data passed as the first argument.
     * @param {jQuery.rdf.databank} data A databank containing data to be reasoned over and added to.
     * @param {Object} [options]
     * @param {Integer} [options.limit=50] The rules in this ruleset are generally run over the {@link jQuery.rdf.databank} until it stops growing. In some situations, notably when creating blank nodes, this can lead to an infinite loop. The limit option indicates the maximum number of times the ruleset will be run before halting.
     * @returns {jQuery.rdf.ruleset} Returns this ruleset.
     * @example
     * rules = $.rdf.ruleset()
     *   .prefix('foaf', ns.foaf)
     *   .add('?person a foaf:Person', '?person a foaf:Agent')
     *   .run(data);
     * @see jQuery.rdf#reason
     * @see jQuery.rdf.databank#reason
     */
    run: function (data, options) {
      var i, r, ntriples,
        opts = $.extend({ limit: 50 }, options),
        limit = opts.limit;
      do {
        ntriples = data.size();
        for (i = 0; i < this.rules.length; i += 1) {
          r = this.rules[i];
          r.run(data);
        }
        limit -= 1;
      } while (data.size() > ntriples && limit > 0);
      return this;
    }
  };
  
  $.rdf.ruleset.fn.init.prototype = $.rdf.ruleset.fn;
  
  $.rdf.ruleset.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

/* Rules */

  /**
   * <p>Creates a new jQuery.rdf.rule object. This should be invoked as a method rather than constructed using new.</p>
   * @class A jQuery.rdf.rule object represents a rule that can be run over a {@link jQuery.rdf.databank}.
   * @param {Object[]} lhs The left-hand side of the rule. This can be an array containing multiple conditions, or a single condition on its own. Each condition is one of:
   * <ul>
   *   <li>A {@link jQuery.rdf.pattern} or a string which is interpreted as a {@link jQuery.rdf.pattern}, which is used to match triples as with the {@link jQuery.rdf#where} method.</li>
   *   <li>A function which must return true for the rule to be satisfied. The arguments for the function are as described in the documentation for {@link jQuery.rdf#filter}.</li>
   *   <li>An array of two items: a variable name and either a regular expression or a value that it matches against (as used in the two arguments to {@link jQuery.rdf#filter}).</li>
   * </ul>
   * @param {Function|String[]} rhs The right-hand side of the rule. This can be an array of strings which are interpreted as patterns and used to create new triples when the rule is fired. If the patterns contain references to blank nodes, new blank nodes are created each time the rule is fired. Alternatively, it can be a function which is executed when the rule is fired. The function needs to have the same signature as that used for {@link jQuery.rdf#map}.
   * @param {Object} [options] Initialisation options for the rules.
   * @param {Object} [options.namespaces] An object representing a set of namespace bindings which are stored and used whenever a CURIE is used within the left or right-hand sides of the rule.
   * @param {String|jQuery.uri} [options.base] The base URI used to interpret any relative URIs used within the rule.
   * @returns {jQuery.rdf.rule}
   * @example $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns });
   * @example
   * var rule = $.rdf.rule(
   *   ['?person a vcard:VCard',
   *    '?person vcard:fn ?name'],
   *   ['?person a foaf:Person',
   *    '?person foaf:name ?name'],
   *   { namespaces: ns }
   * );
   * @example
   * var rule = $.rdf.rule(
   *   ['?person a foaf:Person',
   *    '?person foaf:firstName ?fn'],
   *   ['?person a vcard:VCard',
   *    '?person vcard:n _:name',
   *    '_:name a vcard:Name', 
   *    '_:name vcard:given-name ?fn'],
   *   { namespaces: ns }
   * );
   * @example
   * var rule = $.rdf.rule(
   *   ['?person foaf:name ?name', 
   *    ['name', /^J.+/]], 
   *  function () { name = this.name }, 
   *  { namespaces: ns });
   * @see jQuery.rdf.rule
   */
  $.rdf.rule = function (lhs, rhs, options) {
    return new $.rdf.rule.fn.init(lhs, rhs, options);
  };

  $.rdf.rule.fn = $.rdf.rule.prototype = {
    init: function (lhs, rhs, options) {
      var opts = $.extend({}, $.rdf.rule.defaults, options),
        lhsWildcards = [], rhsBlanks = false;
      if (typeof lhs === 'string') {
        lhs = [lhs];
      }
      if (typeof rhs === 'string') {
        rhs = [rhs];
      }
      this.lhs = $.map(lhs, function (p) {
        if ($.isArray(p)) {
          return [p];
        } else if ($.isFunction(p)) {
          return p;
        } else {
          p = $.rdf.pattern(p, opts);
          if (typeof p.subject === 'string') {
            lhsWildcards.push(p.subject);
          }
          if (typeof p.property === 'string') {
            lhsWildcards.push(p.property);
          }
          if (typeof p.object === 'string') {
            lhsWildcards.push(p.object);
          }
          return p;
        }
      });
      lhsWildcards = $.unique(lhsWildcards);
      if ($.isFunction(rhs)) {
        this.rhs = rhs;
      } else {
        this.rhs = $.map(rhs, function (p) {
          p = $.rdf.pattern(p, opts);
          if ((typeof p.subject === 'string' && $.inArray(p.subject, lhsWildcards) === -1) ||
              (typeof p.property === 'string' && $.inArray(p.property, lhsWildcards) === -1) ||
              (typeof p.object === 'string' && $.inArray(p.object, lhsWildcards) === -1)) {
            throw "Bad Rule: Right-hand side of the rule contains a reference to an unbound wildcard";
          } else if (p.subject.type === 'bnode' || p.property.type === 'bnode' || p.object.type === 'bnode') {
            rhsBlanks = true;
          }
          return p;
        });
      }
      this.rhsBlanks = rhsBlanks;
      this.cache = {};
      return this;
    },
    
    /**
     * Runs the rule on the data passed as the first argument.
     * @param {jQuery.rdf.databank} data A databank containing data to be reasoned over and added to.
     * @param {Object} [options]
     * @param {Integer} [options.limit=50] The rule isArray generally run over the {@link jQuery.rdf.databank} until it stops growing. In some situations, notably when creating blank nodes, this can lead to an infinite loop. The limit option indicates the maximum number of times the rule will be run before halting.
     * @returns {jQuery.rdf.rule} Returns this rule.
     * @example
     * $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns })
     *   .run(data);
     * @see jQuery.rdf.ruleset#run
     * @see jQuery.rdf#reason
     * @see jQuery.rdf.databank#reason
     */
    run: function (data, options) {
      var query = $.rdf({ databank: data }), 
        condition,
        opts = $.extend({ limit: 50 }, options), limit = opts.limit,
        ntriples,
        i, j, pattern, s, p, o, q,
        blanks = this.rhsBlanks,
        cache, sources, triples, add;
      if (this.cache[data.id] === undefined) {
        this.cache[data.id] = {};
      }
      for (i = 0; i < this.lhs.length; i += 1) {
        condition = this.lhs[i];
        if ($.isArray(condition)) {
          query = query.filter.apply(query, condition);
        } else if ($.isFunction(condition)) {
          query = query.filter.call(query, condition);
        } else {
          query = query.where(this.lhs[i]);
        }
      }
      do {
        ntriples = query.length;
        sources = query.sources();
        for (i = 0; i < ntriples; i += 1) {
          triples = sources[i];
          add = true;
          cache = this.cache[data.id];
          for (j = 0; j < triples.length; j += 1) {
            if (cache[triples[j]] === undefined) {
              cache[triples[j]] = {};
            } else if (j === triples.length - 1) {
              add = false;
            }
            cache = cache[triples[j]];
          }
          if (add) {
            q = query.eq(i);
            if (blanks) {
              for (j = 0; j < this.rhs.length; j += 1) {
                pattern = this.rhs[j];
                s = pattern.subject;
                p = pattern.property;
                o = pattern.object;
                if (s.type === 'bnode') {
                  s = $.rdf.blank('' + s + blankNodeNum);
                }
                if (p.type === 'bnode') {
                  p = $.rdf.blank('' + p + blankNodeNum);
                }
                if (o.type === 'bnode') {
                  o = $.rdf.blank('' + o + blankNodeNum);
                }
                pattern = $.rdf.pattern(s, p, o);
                q.add(pattern);
              }
              blankNodeNum += 1;
            } else if ($.isFunction(this.rhs)) {
              var results = q.map(this.rhs);
              for (var t = 0; t < results.length; t++) {
                  if ((results[t]) instanceof $.rdf.triple) {
                      query.add(results[t]);
                  }                  
              }
            } else {
              for (j = 0; j < this.rhs.length; j += 1) {
                q.add(this.rhs[j]);
              }
            }
          }
        }
        limit -= 1;
      } while (query.length > ntriples && limit > 0);
      return this;
    }
  };

  $.rdf.rule.fn.init.prototype = $.rdf.rule.fn;

  $.rdf.rule.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  $.extend($.rdf.databank.fn, {
    /**
     * @methodOf jQuery.rdf.databank#
     * @name jQuery.rdf.databank#reason
     * @description Reasons over this databank using the {@link jQuery.rdf.rule} or {@link jQuery.rdf.ruleset} given as the first argument.
     * @param {jQuery.rdf.rule|jQuery.rdf.ruleset} rules The rules to run over the databank.
     * @param {Object} [options]
     * @param {Integer} [options.limit=50] The rules in this ruleset are generally run over the {@link jQuery.rdf.databank} until it stops growing. In some situations, notably when creating blank nodes, this can lead to an infinite loop. The limit option indicates the maximum number of times the ruleset will be run before halting.
     * @returns {jQuery.rdf.databank} The original {@link jQuery.rdf.databank}, although it may now contain more triples.
     * @see jQuery.rdf.ruleset#run
     * @see jQuery.rdf.rule#run
     */
    reason: function (rule, options) {
      rule.run(this, options);
      return this;
    }
  });
  
  $.extend($.rdf.fn, {
    /**
     * @methodOf jQuery.rdf#
     * @name jQuery.rdf#reason
     * @description Reasons over the {@link jQuery.rdf#databank} associated with this {@link jQuery.rdf} object using the {@link jQuery.rdf.rule} or {@link jQuery.rdf.ruleset} given as the first argument.
     * @param {jQuery.rdf.rule|jQuery.rdf.ruleset} rules The rules to run over the databank.
     * @param {Object} [options]
     * @param {Integer} [options.limit=50] The rules in this ruleset are generally run over the {@link jQuery.rdf.databank} until it stops growing. In some situations, notably when creating blank nodes, this can lead to an infinite loop. The limit option indicates the maximum number of times the ruleset will be run before halting.
     * @returns {jQuery.rdf} The original {@link jQuery.rdf} object, although it may now contain more matches because of the new triples added to its underlying databank.
     * @see jQuery.rdf.ruleset#run
     * @see jQuery.rdf.rule#run
     */
    reason: function (rule, options) {
      rule.run(this.databank, options);
      return this;
    }
  });

})(jQuery);
