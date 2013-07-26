#
#    Plugin to work with images inside the editable for Hallo
#    (c) 2013 Christian Grobmeier, http://www.grobmeier.de
#    This plugin may be freely distributed under the MIT license
#
((jQuery) ->
  jQuery.widget "IKS.hallo-image-browser",
    options:
      editable: null
      toolbar: null
      uuid: ""
      dialogOpts:
        autoOpen: false
        width: 600
        height: 'auto'
        modal: true
        resizable: true
        draggable: true
        dialogClass: 'insert-image-dialog'
      dialog: null
      buttonCssClass: null
      searchurl : null


    populateToolbar: (toolbar) ->
      widget = this

      dialog = "
        <div id=\"hallo-image-browser-container\">
          <input id=\"hallo-image-browser-search-value\" type=\"text\" /> <button id=\"hallo-image-browser-search\">Search</button>
          <hr />
          <div id=\"hallo-image-browser-search-result\">
            <p id=\"hallo-image-browser-no-search-result\">No images to view.</p>
          </div>
        </div>
      "

      @options.dialog = jQuery("<div>").
        attr('id', "#{@options.uuid}-image-browser-dialog").
        html(dialog)

      buttonset = jQuery("<span>").addClass @widgetName
      button = jQuery '<span>'
      button.hallobutton
        label: 'Insert Image from Browser'
        icon: 'icon-folder-open'
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
      @options.dialog.dialog("option", "title", "Insert Image")
      @options.dialog.on 'dialogclose', => @options.editable.element.focus()

      if @noresult is undefined
        @noresult = jQuery '#hallo-image-browser-no-search-result'

      if @searchvalue is undefined
        @searchvalue = @options.dialog.find('#hallo-image-browser-search-value')

      if @searchbutton is undefined
        @searchbutton = @options.dialog.find('#hallo-image-browser-search')
        @searchbutton.on "click", =>
          jQuery.getJSON @options.searchurl, (data) =>
            @_preview_images(data)

    _preview_images: (data) ->
      widget = @
      previewbox = jQuery '#hallo-image-browser-search-result'

      _showImage = (definition) ->
        imageContainer = jQuery ("<div></div>")
        imageContainer.addClass "hallo-image-browser-preview"
        image = jQuery ("<img>")
        image.css("max-width", 200).css("max-height", 200)
        image.attr src: definition.url
        image.attr alt: definition.alt
        imageContainer.append image
        imageContainer.append jQuery("<p>" + definition.alt + "</p>")

        imageContainer.on "click", (event) ->
          image = jQuery (event.target)
          widget._insert_image(image)

        previewbox.append imageContainer

      if data.length > 0
        @noresult.hide()
        _showImage(definition) for definition in data
      else
        @noresult.show()

    _insert_image: (image) ->
      image.attr('style', '')
      @lastSelection.insertNode image[0]
      @searchvalue.val('')
      @_closeDialog()

    _closeDialog: ->
      @noresult.show()
      jQuery('.hallo-image-browser-preview').remove()
      @options.dialog.dialog("close")
) jQuery
