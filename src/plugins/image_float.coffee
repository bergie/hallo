#    Plugin to work with images inside the editable for Hallo
#    (c) 2013 Christian Grobmeier, http://www.grobmeier.de
#    This plugin may be freely distributed under the MIT license
#
#    Depends on: hallo-image-select
((jQuery) ->
  jQuery.widget "IKS.hallo-image-float",
    options:
      editable: null
      toolbar: null
      uuid: ''
      floatLeftClass: 'hallo-float-left'
      floatRightClass: 'hallo-float-right'

    populateToolbar: (toolbar) ->
      widget = this

      @buttons = []
      @buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"

      buttonize = (alignment, icon) =>
        buttonElement = jQuery '<span></span>'
        buttonElement.hallobutton
          uuid: @options.uuid
          editable: @options.editable
          label: alignment
          command: null
          icon: icon
          cssClass: @options.buttonCssClass
        @buttonset.append buttonElement
        return buttonElement

      floatButton = (alignment, icon, addClasses, removeClasses, toolbarButtons) ->
        button = buttonize alignment, icon
        button.alignment = alignment
        button.on "click", ->
          image = widget.options.editable.selectedImage
          image.removeClass(rcl) for rcl in removeClasses
          image.addClass(acl) for acl in addClasses
          btn.find("button").removeClass('ui-state-active') for btn in toolbarButtons
          jQuery(@).find("button").addClass('ui-state-active')

      @buttons.push floatButton "Left", "icon-arrow-left", [@options.floatLeftClass], [@options.floatRightClass], @buttons
      @buttons.push floatButton "Eraser", "icon-eraser", [], [@options.floatRightClass, @options.floatLeftClass], @buttons
      @buttons.push floatButton "Right", "icon-arrow-right", [@options.floatRightClass], [@options.floatLeftClass], @buttons

      @buttonset.hallobuttonset()
      toolbar.append @buttonset

      jQuery(document).on "halloselected", =>
        activate()
        if elements.length
          @buttonset.show()
        else
          @buttonset.hide()

      activate = () =>
        element = @options.editable.selectedImage

        if (element.hasClass(@options.floatLeftClass))
          alignment = "Left"
        else if (element.hasClass(@options.floatRightClass))
          alignment = "Right"
        else
          alignment = "Eraser"

        toggle = (button, alignment) ->
          button.find("button").removeClass('ui-state-active')
          if button.alignment is alignment
            button.find("button").addClass('ui-state-active')
        toggle(btn, alignment) for btn in @buttons
)(jQuery)