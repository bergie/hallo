#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloheadings',
    options:
      editable: null
      toolbar: null
      uuid: ''
      headers: [1, 2, 3]

    populateToolbar: (toolbar) ->
      buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"

      buttonize = (formatAs) =>
        buttonElement = jQuery '<span></span>'
        buttonElement.hallobutton
          uuid: @options.uuid
          editable: @options.editable
          label: formatAs
          text: formatAs
          cssClass: @options.buttonCssClass

        buttonElement.on 'click', =>
          @options.editable.execute 'formatBlock', formatAs

        @element.on 'keyup paste change mouseup', ->
          currentFormat = document.queryCommandValue 'formatBlock'
          buttonElement.hallobutton 'checked', currentFormat.toLowerCase() is formatAs.toLowerCase()

        buttonset.append buttonElement

      buttonize 'P'
      buttonize 'H' + size for size in @options.headers

      buttonset.hallobuttonset()
      toolbar.append buttonset
)(jQuery)
