#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolinebreak",
        options:
            editable: null
            toolbar: null
            uuid: ""

        _create: ->
            @options.toolbar.append jQuery("<br />")

        _init: ->

)(jQuery)