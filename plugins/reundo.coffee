#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloreundo",
        options:
            editable: null
            toolbar: null
            uuid: ""

        _create: ->
            widget = this
            buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
            buttonize = (cmd, label) =>
                id = "#{@options.uuid}-#{cmd}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", cmd
                button.bind "change", (event) ->
                    cmd = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute cmd

            buttonize "undo", "Undo"
            buttonize "redo", "Redo"

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)