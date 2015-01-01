#  Author : Vanshdeep Singh <kansi13@gmail.com>
#  Date   : 01-01-15
((jQuery) ->
  jQuery.widget "IKS.hallotable",
    options:
      editable: null
      uuid: ""
      defaultUrl: 'http://'
      defaultRows: 2
      defaultCols: 2
      dialogOpts:
        autoOpen: false
        width: 400
        height: 130
        title: "Add Table"
        buttonTitle: "Insert"
        buttonUpdateTitle: "Update"
        modal: true
        resizable: false
        draggable: false
        dialogClass: 'panel panel-primary'
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      widget = this

      dialogId = "#{@options.uuid}-dialog"
      butTitle = @options.dialogOpts.buttonTitle
      butUpdateTitle = @options.dialogOpts.buttonUpdateTitle
      dialog = jQuery "<div class='well well-sm' id=\"#{dialogId}\">
        <form action=\"#\" method=\"post\" class='navbar-form navbar-left'>
          <input class='form-control' type=\"text\" name=\"rows\" size='10' value=\"#{@options.defaultRows}\" />
          <input class='form-control' type=\"text\" name=\"cols\" size='10' value=\"#{@options.defaultCols}\" />
          <span class='input-group-btn'>
          <input type=\"submit\" class='btn btn-primary' id=\"addlinkButton\" value=\"#{butTitle}\"/></span>
        </form></div>"
      rowsInput = jQuery('input[name=rows]', dialog)
      colsInput = jQuery('input[name=cols]', dialog)

      dialogSubmitCb = (event) ->
        event.preventDefault()

        rows = rowsInput.val()
        cols = colsInput.val()
        if rows=="" || cols==""
            return

        dialog.dialog('close')
        widget.options.editable.restoreSelection(widget.lastSelection)

        Tcols = ""; Trows=""
        Tcols += "<td></td>" for num in [1..cols]
        Trows += "<tr>#{Tcols}</tr>" for num in [1..rows]

        tableNode = jQuery(" <table border=\"1\"> <tbody>#{Trows}</tbody> </table> ")[0]

        #jQuery("table tbody").resizable()

        widget.lastSelection.insertNode tableNode 
        widget.options.editable.element.trigger('change')
        return false

      dialog.find("input[type=submit]").click dialogSubmitCb

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'Table'
          icon: "fa fa-#{type}"
          editable: @options.editable
          command: null
          queryState: false
          uuid: @options.uuid
          cssClass: @options.buttonCssClass
        buttonset.append buttonHolder
        button = buttonHolder
        button.on "click", (event) ->
          widget.lastSelection = widget.options.editable.getSelection()
          rowsinput            = jQuery('input[name=rows]', dialog)
          colsinput            = jQuery('input[name=cols]', dialog)
          selectionParent      = widget.lastSelection.startContainer.parentNode
          rowsinput.val(widget.options.defaultRows)
          rowsinput.val(widget.options.defaultCols)

          widget.options.editable.keepActivated true
          dialog.dialog('open')

          dialog.on 'dialogclose', ->
            widget.options.editable.restoreSelection widget.lastSelection
            jQuery('label', buttonHolder).removeClass 'ui-state-active'
            do widget.options.editable.element.focus
            widget.options.editable.keepActivated false
          return false

      buttonize "table"
      toolbar.append buttonset
      buttonset.hallobuttonset()
      dialog.dialog(@options.dialogOpts)
)(jQuery)
