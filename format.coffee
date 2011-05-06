#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.halloformat",
        bold: null

        options:
            editable: null
            toolbar: null

        _create: ->
            @bold = jQuery("<button>Bold</button>").button()
            @bold.click =>
                @options.editable.execute "bold"
            @options.toolbar.append @bold

        _init: ->

)(jQuery)