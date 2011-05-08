#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloheadings",
        options:
            editable: null
            toolbar: null
            uuid: ""
            headers: [1,2,3]

        _create: ->
            widget = this
            buttonset = jQuery "<span></span>"
            buttonize = (headerSize) =>
                label = "H" + headerSize
                id = "#{@options.uuid}-#{headerSize}"
                buttonset.append jQuery("<input id=\"#{id}\" type=\"checkbox\" /><label for=\"#{id}\">#{label}</label>").button()
                button = jQuery "##{id}", buttonset
                button.attr "hallo-size", "H"+headerSize
                button.bind "change", (event) ->
                    size = jQuery(this).attr "hallo-size"
                    widget.options.editable.execute "heading", size

            buttonize header for header in @options.headers

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)