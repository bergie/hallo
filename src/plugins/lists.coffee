#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolists",
        options:
            editable: null
            toolbar: null
            uuid: ''
            defaultFormats: [
                (command: "Ordered", label: "Ordered list", icon: "ol")
                (command: "Unordered", label: "Unordered list", icon: "ul")
            ]
            formats: null
            lists:
                ordered: true
                unordered: true
            buttonCssClass: null

        populateToolbar: (toolbar) ->
            buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"
            buttonize = (format) =>

                buttonElement = jQuery '<span></span>'
                buttonElement.hallobutton
                  uuid: @options.uuid
                  editable: @options.editable
                  label: format.label
                  command: "insert#{format.command}List"
                  icon: "icon-list-#{format.icon}"
                  cssClass: @options.buttonCssClass
                buttonset.append buttonElement

            formats = if @options.formats != null then @options.formats else @options.defaultFormats
            buttonize(format) for format in formats

            buttonset.hallobuttonset()
            toolbar.append buttonset

)(jQuery)
