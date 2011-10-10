(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallolinebreak", {
      options: {
        editable: null,
        toolbar: null,
        uuid: ""
      },
      _create: function() {
        return this.options.toolbar.append(jQuery("<br />"));
      },
      _init: function() {}
    });
  })(jQuery);
}).call(this);
