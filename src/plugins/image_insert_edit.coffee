((jQuery) ->
  jQuery.widget "IKS.hallo-image-insert-edit",
    options:
      editable: null
      toolbar: null
      uuid: ""
      insert_file_dialog_ui_url: null
      lang: 'en'
      dialogOpts:
        autoOpen: false
        width: 560
        height: 'auto'
        modal: false
        resizable: true
        draggable: true
        dialogClass: 'insert-image-dialog'
      dialog: null
      buttonCssClass: null

    translations:
      en:
        title_insert: 'Insert Image'
        title_properties: 'Image Properties'
        insert: 'Insert'
        chage_image: 'Change Image:'
        source: 'URL'
        width: 'Width'
        height: 'Height'
        alt: 'Alt Text'
        padding: 'Padding'
        'float': 'Float'
        float_left: 'left'
        float_right: 'right'
        float_none: 'No'
      de:
        title_insert: 'Bild einfügen'
        title_properties: 'Bildeigenschaften'
        insert: 'Einfügen'
        chage_image: 'Bild ändern:'
        source: 'URL'
        width: 'Breite'
        height: 'Höhe'
        alt: 'Alt Text'
        padding: 'Padding'
        'float': 'Float'
        float_left: 'Links'
        float_right: 'Rechts'
        float_none: 'Nein'

    texts: null

    dialog_image_selection_ui_loaded: false
    $image: null

    populateToolbar: ($toolbar) ->
      widget = this

      @texts = @translations[@options.lang]

      @options.toolbar = $toolbar

      dialog_html = "<div id='hallo_img_properties'></div>"
      if @options.insert_file_dialog_ui_url
        dialog_html += "<div id='hallo_img_file_select_ui'></div>"

      @options.dialog = jQuery("<div>").
        attr('id', "#{@options.uuid}-insert-image-dialog").
        html(dialog_html)

      $buttonset = jQuery("<span>").addClass @widgetName

      $buttonHolder = jQuery '<span>'
      $buttonHolder.hallobutton
        label: @texts.title_insert
        icon: 'icon-picture'
        editable: @options.editable
        command: null
        queryState: false
        uuid: @options.uuid
        cssClass: @options.buttonCssClass
      $buttonset.append $buttonHolder

      @button = $buttonHolder
      @button.click ->
        if widget.options.dialog.dialog "isOpen"
          widget._closeDialog()
        else
          # we need to save the current selection because we will lose focus
          widget.lastSelection = widget.options.editable.getSelection()
          widget._openDialog()
        false

      @options.editable.element.on "halloselected, hallounselected", ->
        if widget.options.dialog.dialog "isOpen"
          widget.lastSelection = widget.options.editable.getSelection()

      @options.editable.element.on "hallodeactivated", ->
        widget._closeDialog()

      jQuery(@options.editable.element).on "click", "img", (e) ->
        widget._openDialog jQuery(this)
        false

      # Prevent contextual toolbar from showing when image is clicked.
      @options.editable.element.on 'halloselected', (event, data) ->
        toolbar_option = widget.options.editable.options.toolbar
        if toolbar_option == "halloToolbarContextual" and
         jQuery(data.originalEvent.target).is('img')
          $toolbar.hide()
          false

      $toolbar.append $buttonset

      @options.dialog.dialog(@options.dialogOpts)


    _openDialog: ($image) ->
      @$image = $image
      widget = this

      $editableEl = jQuery @options.editable.element
      xposition = $editableEl.offset().left + $editableEl.outerWidth() + 10

      if @$image
        yposition = @$image.offset().top - jQuery(document).scrollTop()
      else
        yposition = @options.toolbar.offset().top - jQuery(document).scrollTop()

      @options.dialog.dialog("option", "position", [xposition, yposition])

      @options.editable.keepActivated true
      @options.dialog.dialog("open")

      if @$image
        @options.dialog.dialog("option", "title", @texts.title_properties)
        jQuery(document).keyup (e) ->
          if e.keyCode == 46 or e.keyCode == 8
            jQuery(document).off()
            widget._closeDialog()
            widget.$image.remove()
            widget.$image = null

          e.preventDefault()

        @options.editable.element.on "click", ->
          widget.$image = null
          widget._closeDialog()

      else
        @options.dialog.children('#hallo_img_properties').hide()
        @options.dialog.dialog("option", "title", @texts.title_insert)
        if jQuery('#hallo_img_file_select_title').length > 0
          jQuery('#hallo_img_file_select_title').text ''

      @_load_dialog_image_properties_ui()

      @options.dialog.on 'dialogclose', =>
        jQuery('label', @button).removeClass 'ui-state-active'
        scrollbar_pos = jQuery(document).scrollTop()
        @options.editable.element.focus()
        jQuery(document).scrollTop(scrollbar_pos)  # restore scrollbar pos
        @options.editable.keepActivated false

      if @options.insert_file_dialog_ui_url and not
       @dialog_image_selection_ui_loaded

        @options.dialog.on 'click', ".reload_link", ->
          widget._load_dialog_image_selection_ui()
          false

        @options.dialog.on 'click', '.file_preview img', ->
          if widget.$image
            new_source = jQuery(this).attr('src').replace(/-thumb/, '')
            widget.$image.attr 'src', new_source
            jQuery('#hallo_img_source').val new_source

          else
            widget._insert_image jQuery(this).attr('src').replace(/-thumb/, '')

          false

        @_load_dialog_image_selection_ui()


    _insert_image: (source) ->
      @options.editable.restoreSelection(@lastSelection)
      document.execCommand "insertImage", null, source
      @options.editable.element.trigger('change')
      @options.editable.removeAllSelections()
      @_closeDialog()


    _closeDialog: ->
      @options.dialog.dialog("close")


    _load_dialog_image_selection_ui: ->
      widget = this
      jQuery.ajax
        url: @options.insert_file_dialog_ui_url
        success: (data, textStatus, jqXHR) ->
          file_select_title = ''
          $properties = widget.options.dialog.children('#hallo_img_properties')
          if $properties.is(':visible')
            file_select_title = widget.texts.change_image

          t = "<div id='hallo_img_file_select_title'>#{file_select_title}</div>"
          widget.options.dialog.children('#hallo_img_file_select_ui').
           html( t + data)

          widget.dialog_image_selection_ui_loaded = true
        beforeSend: ->
          widget.options.dialog.children('#hallo_img_file_select_ui').
            html('<div class="hallo_insert_file_loader"></div>')


    _load_dialog_image_properties_ui: ->
      widget = this
      $img_properties = @options.dialog.children('#hallo_img_properties')

      if @$image

        width = if @$image.is('[width]') then @$image.attr('width') else ''
        height = if @$image.is('[height]') then @$image.attr('height') else ''
        html = @_property_input_html( 'source',
          @$image.attr('src'), { label: @texts.source } ) +
        @_property_input_html( 'alt',
          @$image.attr('alt') || '', { label: @texts.alt } ) +
        @_property_row_html(
          @_property_input_html('width',
            width, { label: @texts.width, row: false }) +
          @_property_input_html('height',
            height, { label: @texts.height, row: false })) +
        @_property_input_html( 'padding',
          @$image.css('padding'), { label: @texts.padding } ) +
        @_property_row_html(
          @_property_cb_html( 'float_left',
            @$image.css('float') == 'left',
            { label: @texts.float_left, row: false } ) +
          @_property_cb_html( 'float_right',
            @$image.css('float') == 'right',
            { label: @texts.float_right, row: false } ) +
          @_property_cb_html( 'unfloat',
            @$image.css('float') == 'none',
            { label: @texts.float_none, row: false } ),
        @texts[float])
        $img_properties.html html
        $img_properties.show()
      else
        unless @options.insert_file_dialog_ui_url
          $img_properties.html @_property_input_html 'source',
                                                     '',
                                                     {
                                                       label: @texts.source
                                                     }
          $img_properties.show()

      if @$image
        unless @options.insert_file_dialog_ui_url
          jQuery('#insert_image_btn').remove()

        if jQuery('#hallo_img_file_select_title').length > 0
          jQuery('#hallo_img_file_select_title').text @texts.chage_image

        jQuery('#hallo_img_properties #hallo_img_source').keyup ->
          widget.$image.attr 'src', this.value

        jQuery('#hallo_img_properties #hallo_img_alt').keyup ->
          widget.$image.attr 'alt', this.value

        jQuery('#hallo_img_properties #hallo_img_padding').keyup ->
          widget.$image.css 'padding', this.value

        jQuery('#hallo_img_properties #hallo_img_height').keyup ->
          widget.$image.css 'height', this.value
          widget.$image.attr 'height', this.value

        jQuery('#hallo_img_properties #hallo_img_width').keyup ->
          widget.$image.css 'width', this.value
          widget.$image.attr 'width', this.value

        jQuery('#hallo_img_properties #hallo_img_float_left').click ->
          return false unless this.checked
          widget.$image.css 'float', 'left'
          jQuery('#hallo_img_properties #hallo_img_float_right').
            removeAttr('checked')
          jQuery('#hallo_img_properties #hallo_img_unfloat').
            removeAttr('checked')

        jQuery('#hallo_img_properties #hallo_img_float_right').click ->
          return false unless this.checked
          widget.$image.css 'float', 'right'
          jQuery('#hallo_img_properties #hallo_img_unfloat').
            removeAttr('checked')
          jQuery('#hallo_img_properties #hallo_img_float_left').
            removeAttr('checked')

        jQuery('#hallo_img_properties #hallo_img_unfloat').click ->
          return false unless this.checked
          widget.$image.css 'float', 'none'
          jQuery('#hallo_img_properties #hallo_img_float_right').
            removeAttr('checked')
          jQuery('#hallo_img_properties #hallo_img_float_left').
            removeAttr('checked')

      else
        unless @options.insert_file_dialog_ui_url
          button = "<button id=\"insert_image_btn\">#{@texts.insert}</button>"
          $img_properties.after button
          jQuery('#insert_image_btn').click ->
            $img_source = jQuery('#hallo_img_properties #hallo_img_source')
            widget._insert_image $img_source.val()


    _property_col_html: (col_html) ->
      "<div class='hallo_img_property_col'>#{col_html}</div>"

    _property_row_html: (row_html, label = '') ->
      row_html = @_property_col_html(label) + @_property_col_html(row_html)
      "<div class='hallo_img_property_row'>#{ row_html }</div>"

    _property_html: (property_html, options = {}) ->
      if options.row == false
        if options.label
          entry = "#{options.label} #{property_html}"
          property_html = "<span class='img_property_entry'>#{entry}</span>"
        property_html
      else
        entry = "<span class='img_property_entry'>#{property_html}</span>"
        @_property_row_html(entry, options.label)

    _property_input_html: (id, value, options = {}) ->
      text_field = "<input type='text' id='hallo_img_#{id}' value='#{value}'>"
      @_property_html text_field, options

    _property_cb_html: (id, checked, options = {}) ->
      checked_attr = if checked then 'checked=checked' else ''
      cb = "<input type='checkbox' id='hallo_img_#{id}' #{ checked_attr }'>"
      @_property_html cb, options
) jQuery
