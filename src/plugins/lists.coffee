#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
    jQuery.widget "IKS.hallolists",
        options:
            editable: null
            toolbar: null
            uuid: ''
            lists: 
                ordered: false
                unordered: true
            buttonCssClass: null

        _create: ->
            buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"
            buttonize = (type, label) =>
                buttonElement = jQuery '<span></span>'
                buttonElement.hallobutton
                  uuid: @options.uuid
                  editable: @options.editable
                  label: label
                  command: "insert#{type}List"
                  icon: 'icon-list'
                  cssClass: @options.buttonCssClass
                buttonset.append buttonElement

            buttonize "Ordered", "OL" if @options.lists.ordered
            buttonize "Unordered", "UL" if @options.lists.unordered

            buttonset.buttonset()
            @options.toolbar.append buttonset

        _init: ->

)(jQuery)
