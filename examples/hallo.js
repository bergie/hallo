(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo", {
      options: {
        editable: true
      },
      _create: function() {},
      _init: function() {
        return this.element.attr("contentEditable", this.options.editable);
      }
    });
  })(jQuery);
}).call(this);
