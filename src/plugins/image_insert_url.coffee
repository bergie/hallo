#
#    Plugin to work with images inside the editable for Hallo
#    (c) 2013 Christian Grobmeier, http://www.grobmeier.de
#    This plugin may be freely distributed under the MIT license
#
((jQuery) ->
  jQuery.widget "IKS.hallo-image-insert-url",
    options:
      editable: null
      toolbar: null
      uuid: ""
      dialogOpts:
        autoOpen: false
        width: 'auto'
        height: 'auto'
        modal: true
        resizable: true
        draggable: true
        dialogClass: 'insert-image-dialog'
      dialog: null
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      widget = this

      dialog = "
        <div id=\"hallo-image-insert-url-container\">
          URL: <input id=\"hallo-image-insert-url-value\" type=\"text\" /> <button id=\"hallo-image-insert-url-insert\">Insert</button>
        </div>
      "

      @options.dialog = jQuery("<div>").
        attr('id', "#{@options.uuid}-image-insert-dialog").
        html(dialog)

      buttonset = jQuery("<span>").addClass @widgetName
      button = jQuery '<span>'
      button.hallobutton
        label: 'Insert Image'
        icon: 'icon-picture'
        editable: @options.editable
        command: null
        queryState: false
        uuid: @options.uuid
        cssClass: @options.buttonCssClass
      buttonset.append button

      button.click -> widget._openDialog(toolbar)

      toolbar.append buttonset
      @options.dialog.dialog(@options.dialogOpts)

    _openDialog: (toolbar) ->
      @lastSelection = @options.editable.getSelection()

      toolbar.hide()
      @options.dialog.dialog("open")
      @options.dialog.dialog("option", "title", "Insert Image")
      @options.dialog.on 'dialogclose', => @options.editable.element.focus()

      if @urlvalue is undefined
        @urlvalue = @options.dialog.find('#hallo-image-insert-url-value')

      if @urlinsert is undefined
        @urlinsert = @options.dialog.find('#hallo-image-insert-url-insert')
        @urlinsert.on "click", => @_insert_image @urlvalue.val()

    _insert_image: (source) ->
      image = jQuery '<img>'
      image.attr src: source
      @lastSelection.insertNode image[0]
      @urlvalue.val('')
      @_closeDialog()

    _closeDialog: ->
      @options.dialog.dialog("close")
) jQuery
