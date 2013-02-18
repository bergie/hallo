jQuery(document).ready(function() {
  // Enable Hallo editor
  jQuery('.editable').hallo({
    plugins: {
      'halloformat': {},
      'halloheadings': {},
      'hallolists': {},
      'halloreundo': {}
    },
    toolbar: 'halloToolbarFixed'
  });

  var markdownize = function(content) {
    var html = content.split("\n").map($.trim).filter(function(line) { 
      return line != "";
    }).join("\n");
    return toMarkdown(html);
  };

  var converter = new Showdown.converter();
  var htmlize = function(content) {
    return converter.makeHtml(content);
  };

  // Method that converts the HTML contents to Markdown
  var showSource = function(content) {
    var markdown = markdownize(content);
    if (jQuery('#source').get(0).value == markdown) {
      return;
    }
    jQuery('#source').get(0).value = markdown;
  };


  var updateHtml = function(content) {
    if (markdownize(jQuery('.editable').html()) == content) {
      return;
    }
    var html = htmlize(content);
    jQuery('.editable').html(html); 
  };

  // Update Markdown every time content is modified
  jQuery('.editable').bind('hallomodified', function(event, data) {
    showSource(data.content);
  });
  jQuery('#source').bind('keyup', function() {
    updateHtml(this.value);
  });
  showSource(jQuery('.editable').html());
}); 
