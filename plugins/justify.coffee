#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallojustify",
        options:
            editable: null
            toolbar: null
            uuid: ""

        _create: ->
            widget = this
            buttonset = jQuery "<span id=\"#{@options.uuid}-" + widget.widgetName + "\"></span>"
            buttonize = (alignment) =>
                id = "#{@options.uuid}-#{alignment}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\">#{alignment}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", "justify" + alignment
                button.bind "change", (event) ->
                    cmd = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute cmd

            buttonize "Left"
            buttonize "Center"
            buttonize "Right"

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)