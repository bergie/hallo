#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget "IKS.halloheadings",
    options:
      editable: null
      uuid: ''
      formatBlocks: ["p", "h1", "h2", "h3"]
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      widget = this
      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      ie = navigator.appName is 'Microsoft Internet Explorer'
      command = (if ie then "FormatBlock" else "formatBlock")

      buttonize = (format) =>
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: format
          editable: @options.editable
          command: command
          commandValue: (if ie then "<#{format}>" else format)
          uuid: @options.uuid
          cssClass: @options.buttonCssClass
          queryState: (event) ->
            try
              value = document.queryCommandValue command
              if ie
                map = { p: "normal" }
                for val in [1,2,3,4,5,6]
                  map["h#{val}"] = val
                compared = value.match(new RegExp(map[format],"i"))
              else
                compared = value.match(new RegExp(format,"i"))

              result = if compared then true else false
              buttonHolder.hallobutton('checked', result)
            catch e
              return
        buttonHolder.find('button .ui-button-text').text(format.toUpperCase())
        buttonset.append buttonHolder

      for format in @options.formatBlocks
        buttonize format
      
      buttonset.hallobuttonset()
      toolbar.append buttonset
)(jQuery)
