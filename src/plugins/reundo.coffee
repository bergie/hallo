#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget "IKS.halloreundo",
    options:
      editable: null
      toolbar: null
      uuid: ''
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"
      buttonize = (cmd, label) =>
        buttonElement = jQuery '<span></span>'
        buttonElement.hallobutton
          uuid: @options.uuid
          editable: @options.editable
          label: label
          icon: if cmd is 'undo' then 'icon-undo' else 'icon-repeat'
          command: cmd
          queryState: false
          cssClass: @options.buttonCssClass
        buttonset.append buttonElement
      buttonize "undo", "Undo"
      buttonize "redo", "Redo"

      buttonset.hallobuttonset()
      toolbar.append buttonset
)(jQuery)
