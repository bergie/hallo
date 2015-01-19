((jQuery) ->
  jQuery.widget "IKS.hallohtml",
    options:
      editable: null
      toolbar: null
      uuid: ""
      lang: 'en'
      dialogOpts:
        autoOpen: false
        width: 350
        height: 'auto'
        modal: false
        resizable: true
        draggable: true
        dialogClass: 'panel panel-primary'
      dialog: null
      buttonCssClass: null

    translations:
      en:
        title: 'Edit HTML'
        update: 'Update'
      de:
        title: 'HTML bearbeiten'
        update: 'Aktualisieren'

    texts: null


    populateToolbar: ($toolbar) ->
      widget = this

      @texts = @translations[@options.lang]

      @options.toolbar = $toolbar
      selector = "#{@options.uuid}-htmledit-dialog"
      @options.dialog = jQuery("<div class='well well-sm' id=#{selector}></div>")

      $buttonset = jQuery("<span>").addClass widget.widgetName

      id = "#{@options.uuid}-htmledit"
      $buttonHolder = jQuery '<span>'
      $buttonHolder.hallobutton
        label: @texts.title
        icon: 'fa fa-list-alt'
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
          widget._openDialog()
        false

      @options.editable.element.on "hallodeactivated", ->
        widget._closeDialog()

      $toolbar.append $buttonset

      @options.dialog.dialog(@options.dialogOpts)
      @options.dialog.dialog("option", "title", @texts.title)


    _openDialog: ->

      widget = this

      $editableEl = jQuery @options.editable.element
      xposition = $editableEl.offset().left + $editableEl.outerWidth() + 10
      yposition = @options.toolbar.offset().top - jQuery(document).scrollTop()
      @options.dialog.dialog("option", "position", [xposition, yposition])

      @options.editable.keepActivated true
      @options.dialog.dialog("open")

      @options.dialog.on 'dialogclose', =>
        jQuery('label', @button).removeClass 'ui-state-active'
        @options.editable.element.focus()
        @options.editable.keepActivated false

      @options.dialog.html jQuery("<textarea cols='50' rows='8'>").addClass('html_source')
      html = @options.editable.element.html()

      #indented_html = @_indent_html html

      @options.dialog.children('.html_source').val html
      @options.dialog.append jQuery("<button class='btn btn-primary'>#{@texts.update}</button>")

      @options.dialog.on 'click', 'button', ->
        html = widget.options.dialog.children('.html_source').val()
        widget.options.editable.element.html html
        widget.options.editable.element.trigger('change')
        false

    _closeDialog: ->
      @options.dialog.dialog("close")
) jQuery
