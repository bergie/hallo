#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolists",
        options:
            editable: null
            toolbar: null
            uuid: ""

        _create: ->
            widget = this
            buttonset = jQuery "<span></span>"
            buttonize = (type, label) =>
                id = "#{@options.uuid}-#{type}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\" class=\"#{type}_button\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-command", "insert" + type + "List"
                button.bind "change", (event) ->
                    cmd = jQuery(this).attr "hallo-command"
                    widget.options.editable.execute cmd

            buttonize "Ordered", "OL"
            buttonize "Unordered", "UL"

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)