#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            uuid: ""
            formattings: 
                bold: true
                italic: true
                strikeThrough: false
                underline: false
            shortcuts:
                bold: 66
                italic: 73
                strikeThrough: false
                underline: 85
            buttonCssClass: null

        populateToolbar: (toolbar) ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            addFormat = (format) =>
                buttonHolder = jQuery '<span></span>'
                buttonHolder.hallobutton
                  label: format
                  editable: @options.editable
                  command: format
                  uuid: @options.uuid
                  cssClass: @options.buttonCssClass
                buttonset.append buttonHolder

                @options.editable.element.keydown (e)=>
                    if e.metaKey && @options.shortcuts[format] == e.which
                        e.preventDefault()
                        @options.editable.execute(format)

            addFormat format for format, enabled of @options.formattings when enabled

            buttonset.hallobuttonset()
            toolbar.append buttonset
)(jQuery)
