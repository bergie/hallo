#
#    Plugin to work with images inside the editable for Hallo
#    (c) 2013 Christian Grobmeier, http://www.grobmeier.de
#    This plugin may be freely distributed under the MIT license
#
#    This plugin depends on DropzoneJS: http://www.dropzonejs.com/
#    DropzoneJS has chosen the MIT license too.
#
((jQuery) ->
  jQuery.widget "IKS.hallo-image-upload",
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
        dialogClass: 'insert-image-upload-dialog'
      dialog: null
      buttonCssClass: null
      uploadpath: null

    populateToolbar: (toolbar) ->
      widget = this

      Dropzone.autoDiscover = false;

      dialog = "
        <div class=\"hallo-image-upload-container\">
          <p class=\"hallo-image-upload-hint\">DROP YOUR IMAGE HERE</p>
          <p class=\"hallo-image-upload-error\"></p>
          <p class=\"hallo-image-upload-spinner\" style=\"display:none\"><i class=\"icon-spinner icon-spin icon-large\"></i></p>
        </div>
      "

      @options.dialog = jQuery("<div>").
        attr('id', "#{@options.uuid}-image-upload-dialog").
        html(dialog)

      buttonset = jQuery("<span>").addClass @widgetName
      button = jQuery '<span>'
      button.hallobutton
        label: 'Upload Image'
        icon: 'icon-upload'
        editable: @options.editable
        command: null
        queryState: false
        uuid: @options.uuid
        cssClass: @options.buttonCssClass
      buttonset.append button

      button.click ->
        toolbar.hide()
        widget._openDialog()

      toolbar.append buttonset
      @options.dialog.dialog(@options.dialogOpts)

    _openDialog: ->
      @lastSelection = @options.editable.getSelection()

      @options.dialog.dialog("open")
      @options.dialog.dialog("option", "title", "Upload Image")
      @options.dialog.on 'dialogclose', => @options.editable.element.focus()

      @hint ?= jQuery ".hallo-image-upload-hint"
      @error ?= jQuery ".hallo-image-upload-error"
      @spinner ?= jQuery ".hallo-image-upload-spinner"
      @uploadContainer ?= @_createDropzone()

    _createDropzone: ->
      options =
        url : @options.uploadpath

      @uploadContainer = new Dropzone "#hallo-image-upload-container", options
      @uploadContainer.on 'drop', =>
        @error.html('')
        @error.hide()
        @hint.hide()
        @spinner.show()

      @uploadContainer.on 'success', (file, responseText) =>
        @uploadContainer.removeAllFiles();
        response = jQuery.parseJSON responseText;
        @spinner.hide()
        @hint.show()
        @_insert_image(response.url)

      @uploadContainer.on 'error', (file, errorMessage) =>
        @uploadContainer.removeAllFiles()
        @spinner.hide()
        @hint.show()
        @error.html(errorMessage)
        @error.show()

    _insert_image: (source) ->
      image = jQuery '<img>'
      image.attr src: source
      @lastSelection.insertNode image[0]
      @_closeDialog()

    _closeDialog: ->
      @options.dialog.dialog("close")
) jQuery
