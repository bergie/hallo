#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        options:
            editable: null
            toolbar: null
            uuid: ""
            formattings: 
                bold: true
                italic: true
                strikeThrough: false
                underline: false
            buttonCssClass: null

        _create: ->
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
            buttonize format for format, enabled of @options.formattings when enabled

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)
