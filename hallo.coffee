#    Hallo - a rich text editing jQuery UI widget
#    (c) 2011 Henri Bergius, IKS Consortium
#    Hallo may be freely distributed under the MIT license
((jQuery) ->
    # Hallo provides a jQuery UI widget `hallo`. Usage:
    #
    #     jQuery('p').hallo();
    #
    # Getting out of the editing state:
    #
    #     jQuery('p').hallo({editable: false});
    jQuery.widget "IKS.hallo",
        options:
            editable: true

        # Called once for each element
        _create: ->

        # Called per each invokation
        _init: ->
            @element.attr "contentEditable", @options.editable
)(jQuery)