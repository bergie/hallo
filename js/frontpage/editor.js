jQuery(document).ready(function() {
  jQuery('.editable').hallo({
    plugins: {
      'halloformat': {},
      'halloblock': {},
      'hallojustify': {},
      'hallolists': {},
      'halloreundo': {}
    }
  });
});
