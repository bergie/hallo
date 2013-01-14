#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget "IKS.hallolink",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 540
        height: 95
        title: "Enter Link"
        buttonTitle: "Insert"
        buttonUpdateTitle: "Update"
        modal: true
        resizable: false
        draggable: false
        dialogClass: 'hallolink-dialog'
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      widget = this

      dialogId = "#{@options.uuid}-dialog"
      butTitle = @options.dialogOpts.buttonTitle
      butUpdateTitle = @options.dialogOpts.buttonUpdateTitle
      dialog = jQuery "<div id=\"#{dialogId}\">
        <form action=\"#\" method=\"post\" class=\"linkForm\">
          <input class=\"url\" type=\"text\" name=\"url\"
            value=\"#{@options.defaultUrl}\" />
          <input type=\"submit\" id=\"addlinkButton\" value=\"#{butTitle}\"/>
        </form></div>"
      urlInput = jQuery('input[name=url]', dialog).focus (e)->
        this.select()

      isEmptyLink = (link) ->
        return true if (new RegExp(/^\s*$/)).test link
        return true if link is widget.options.defaultUrl
        false

      dialogSubmitCb = (event) ->
        event.preventDefault()

        link = urlInput.val()
        widget.options.editable.restoreSelection(widget.lastSelection)
        if isEmptyLink link
          # link is empty, remove it. Make sure the link is selected
          selectionStart = widget.lastSelection.startContainer
          if widget.lastSelection.collapsed
            widget.lastSelection.setStartBefore selectionStart
            widget.lastSelection.setEndAfter selectionStart
            window.getSelection().addRange(widget.lastSelection)
          document.execCommand "unlink", null, ""
        else
          # link does not have ://, add http:// as default protocol
          if !(/:\/\//.test link) && !(/^mailto:/.test link)
            link = 'http://' + link
          if widget.lastSelection.startContainer.parentNode.href is undefined
            document.execCommand "createLink", null, link
          else
            widget.lastSelection.startContainer.parentNode.href = link
        widget.options.editable.element.trigger('change')
        widget.options.editable.removeAllSelections()
        dialog.dialog('close')
        return false

      dialog.find("input[type=submit]").click dialogSubmitCb

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'Link'
          icon: 'icon-link'
          editable: @options.editable
          command: null
          queryState: false
          uuid: @options.uuid
          cssClass: @options.buttonCssClass
        buttonset.append buttonHolder
        button = buttonHolder
        button.on "click", (event) ->
          # we need to save the current selection because we will lose focus
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery(urlInput[0].form).find('input[type=submit]').val(butTitle)
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            button_selector = 'input[type=submit]'
            jQuery(urlInput[0].form).find(button_selector).val(butUpdateTitle)

          widget.options.editable.keepActivated true
          dialog.dialog('open')

          dialog.on 'dialogclose', ->
            jQuery('label', buttonHolder).removeClass 'ui-state-active'
            do widget.options.editable.element.focus
            widget.options.editable.keepActivated false
          return false

        @element.on "keyup paste change mouseup", (event) ->
          start = jQuery(widget.options.editable.getSelection().startContainer)
          if start.prop('nodeName')
            nodeName = start.prop('nodeName')
          else
            nodeName = start.parent().prop('nodeName')
          if nodeName and nodeName.toUpperCase() is "A"
            jQuery('label', button).addClass 'ui-state-active'
            return
          jQuery('label', button).removeClass 'ui-state-active'

      if (@options.link)
        buttonize "A"

      if (@options.link)
        toolbar.append buttonset
        buttonset.hallobuttonset()
        dialog.dialog(@options.dialogOpts)
)(jQuery)
