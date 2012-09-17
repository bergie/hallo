#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallojustify",
        options:
            editable: null
            toolbar: null
            uuid: ''
            buttonCssClass: null
            defaultFormats: [
                (command: "Left", label: "Left")
                (command: "Center", label: "Center")
                (command: "Right", label: "Right")
                (command: "Full", label: "Block", icon: "justify")
            ]
            formats: null

        populateToolbar: (toolbar) ->
            buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"
            buttonize = (format) =>
                buttonElement = jQuery '<span></span>'
                iconName= if format.icon then format.icon else format.command.toLowerCase()
                buttonElement.hallobutton
                  uuid: @options.uuid
                  editable: @options.editable
                  label: format.label
                  command: "justify#{format.command}"
                  icon: "icon-align-#{iconName}"
                  cssClass: @options.buttonCssClass
                buttonset.append buttonElement 
            formats = if @options.formats != null then @options.formats else @options.defaultFormats
            buttonize(format) for format in formats

            buttonset.hallobuttonset()
            toolbar.append buttonset
        _init: ->

)(jQuery)
