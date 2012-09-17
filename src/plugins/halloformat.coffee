#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            uuid: ""
            defaultFormats: [
                (command: "bold", label: "Bold")
                (command: "italic", label: "Italic")
                (command: "strikeThrough", label: "Strike through")
                (command: "underline", label: "Underline")
            ]
            formats: null
            buttonCssClass: null

        populateToolbar: (toolbar) ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (format) =>
                buttonHolder = jQuery '<span></span>'
                buttonHolder.hallobutton
                  label: format.label
                  editable: @options.editable
                  command: format.command
                  uuid: @options.uuid
                  cssClass: @options.buttonCssClass
                  icon: "icon-#{format.command.toLowerCase()}"
                buttonset.append buttonHolder
            formats = if @options.formats != null then @options.formats else @options.defaultFormats
            buttonize(format) for format in formats

            buttonset.hallobuttonset()
            toolbar.append buttonset
)(jQuery)
