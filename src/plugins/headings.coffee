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

    populateToolbar: (toolbar) ->
      widget = this
      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      id = "#{@options.uuid}-paragraph"
      label = "P"
      markup = "<input id=\"#{id}\" type=\"radio\"
        name=\"#{widget.options.uuid}-headings\"/>
        <label for=\"#{id}\" class=\"p_button\">#{label}</label>"
      buttonset.append jQuery(markup).button()
      button = jQuery "##{id}", buttonset
      button.attr "hallo-command", "formatBlock"
      button.bind "change", (event) ->
        cmd = jQuery(this).attr "hallo-command"
        widget.options.editable.execute cmd, "P"

      buttonize = (headerSize) =>
        label = "H" + headerSize
        id = "#{@options.uuid}-#{headerSize}"
        buttonMarkup = "<input id=\"#{id}\" type=\"radio\"
          name=\"#{widget.options.uuid}-headings\"/>
          <label for=\"#{id}\" class=\"h#{headerSize}_button\">#{label}</label>"
        buttonset.append jQuery(buttonMarkup).button()
        button = jQuery "##{id}", buttonset
        button.attr "hallo-size", "H"+headerSize
        button.bind "change", (event) ->
          size = jQuery(this).attr "hallo-size"
          widget.options.editable.execute "formatBlock", size

      buttonize header for header in @options.headers

      buttonset.buttonset()

      @element.bind "keyup paste change mouseup", (event) ->
        try
          format = document.queryCommandValue("formatBlock").toUpperCase()
        catch e
          format = ''

        if format is "P"
          selectedButton = jQuery("##{widget.options.uuid}-paragraph")
        else if matches = format.match(/\d/)
          formatNumber = matches[0]
          selectedButton = jQuery("##{widget.options.uuid}-#{formatNumber}")

        labelParent = jQuery(buttonset)
        labelParent.children("input").attr "checked", false
        labelParent.children("label").removeClass "ui-state-clicked"
        labelParent.children("input").button("widget").button "refresh"

        if selectedButton
          selectedButton.attr "checked", true
          selectedButton.next("label").addClass "ui-state-clicked"
          selectedButton.button "refresh"

       toolbar.append buttonset
)(jQuery)
