#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget "IKS.halloformat",
    options:
      editable: null
      uuid: ''
      formattings:
        bold: true
        italic: true
        strikeThrough: false
        underline: false
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      widget = this
      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"

      buttonize = (format) =>
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: format
          editable: @options.editable
          command: format
          uuid: @options.uuid
          cssClass: @options.buttonCssClass
        buttonset.append buttonHolder

      for format, enabled of @options.formattings
        continue unless enabled
        buttonize format

      buttonset.hallobuttonset()
      toolbar.append buttonset
)(jQuery)
