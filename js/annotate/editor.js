jQuery(document).ready(function() {
  // Instantiate VIE and configure Stanbol service
  var vie = new VIE;
  vie.use(new vie.StanbolService({
    proxyDisabled: true,
    url: 'http://dev.iks-project.eu:8081'
  }));

  // Instantiate Hallo Editor
  jQuery('.editable').hallo({
    plugins: {
      'halloformat': {},
      'halloblock': {},
      'hallojustify': {},
      'hallolists': {},
      'halloannotate': {
        vie: vie
      }
    },
    showAlways: true
  });
});
