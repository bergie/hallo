#
#    Browser plugin to work with images inside the editable for Hallo
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
      limit: 4
    currentpage: 1
    lastquery: ""

    populateToolbar: (toolbar) ->
      widget = this

      dialog = "
        <div id=\"hallo-image-browser-container-#{@options.uuid}\">
          <input class=\"hallo-image-browser-search-value\" type=\"text\" /> <button class=\"hallo-image-browser-search\">Search</button>
          <hr />
          <div class=\"hallo-image-browser-paging\" style=\"display:none\">
              <button class=\"hallo-image-browser-paging-back\" style=\"display:none\">Back</button>
              <button class=\"hallo-image-browser-paging-forward\" style=\"display:none\">Forward</button>
          </div>
          <div class=\"hallo-image-browser-search-result\">
            <p class=\"hallo-image-browser-no-search-result\">No images to view.</p>
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

      @container ?= jQuery "#hallo-image-browser-container-#{@options.uuid}"

      @paging ?= jQuery '.hallo-image-browser-paging', @container
      @pagingback ?= jQuery '.hallo-image-browser-paging-back', @container
      @pagingforward ?= jQuery '.hallo-image-browser-paging-forward', @container

      @pagingback.on "click", =>
        @currentpage--;
        @_search()

      @pagingforward.on "click", =>
        @currentpage++;
        @_search()

      @noresult ?= jQuery '.hallo-image-browser-no-search-result', @container
      @searchvalue ?= @options.dialog.find('.hallo-image-browser-search-value')

      initSearchButton = =>
        @searchbutton = @options.dialog.find('.hallo-image-browser-search')
        @searchbutton.on "click", => @_search()
      @searchbutton ?= initSearchButton()

    _search: ->
      query = @searchvalue.val()

      if @lastquery isnt query
        @currentpage = 1
        @lastquery = query

      data =
        limit: @options.limit
        page : @currentpage
        query: query

      jQuery.getJSON @options.searchurl, data, (data) =>
        @_resetSearchResults()
        @_paging(data.page, data.total)
        @_preview_images(data.results)

    _paging: (page, total) ->
      if total < @limit
        @paging.hide()
        return
      else
        @paging.show()

      if page > 1
        @pagingback.show()
      else
        @pagingback.hide()

      numberofpages = Math.ceil ( total / @options.limit )
      if page < numberofpages
        @pagingforward.show()
      else
        @pagingforward.hide()

    _preview_images: (data) ->
      widget = @
      previewbox = jQuery '.hallo-image-browser-search-result', @container

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

    _resetSearchResults: ->
      @noresult.show()
      jQuery('.hallo-image-browser-preview', @container).remove()

    _closeDialog: ->
      @_resetSearchResults()
      @options.dialog.dialog("close")
) jQuery
