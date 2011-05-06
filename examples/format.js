(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  (function(jQuery) {
    return jQuery.widget("IKS.halloformat", {
      bold: null,
      options: {
        editable: null,
        toolbar: null
      },
      _create: function() {
        this.bold = jQuery("<button>Bold</button>").button();
        this.bold.click(__bind(function() {
          return this.options.editable.execute("bold");
        }, this));
        return this.options.toolbar.append(this.bold);
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
