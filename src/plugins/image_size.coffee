#    Plugin to work with images inside the editable for Hallo
#    (c) 2013 Christian Grobmeier, http://www.grobmeier.de
#    This plugin may be freely distributed under the MIT license
#
#    Depends on: hallo-image-select
((jQuery) ->
  jQuery.widget "IKS.hallo-image-size",
    options:
      editable: null
      toolbar: null
      uuid: '',
      resizeStep : 10

    populateToolbar: (toolbar) ->
      widget = this

      buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"

      buttonize = (label, icon) =>
        buttonElement = jQuery '<span></span>'
        buttonElement.hallobutton
          uuid: @options.uuid
          editable: @options.editable
          label: label
          command: null
          icon: icon
          cssClass: @options.buttonCssClass
        buttonset.append buttonElement
        return buttonElement

      resizeStep = @options.resizeStep
      sizeButton = (alignment, icon, resize) ->
        button = buttonize alignment, icon
        button.on "click", =>
          image = widget.options.editable.selectedImage

          if resize is 100
           image.css('width', 'auto')
           image.css('height', 'auto')
          else
            width = image.width()
            height = image.height()
            faktor = (resize / 100)
            image.width ( width * faktor )
            image.height ( height * faktor )

      sizeButton "Smaller", "icon-resize-small", (100 - resizeStep)
      sizeButton "Original", "icon-fullscreen", 100
      sizeButton "Bigger", "icon-resize-full", (100 + resizeStep)

      buttonset.hallobuttonset()
      toolbar.append buttonset

      jQuery(document).on "halloselected", =>
        selection = jQuery(widget.options.editable.getSelection().startContainer)
        elements = selection.find "img"
        if elements.length
          buttonset.show()
        else
          buttonset.hide()
)(jQuery)