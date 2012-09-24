#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.hallobutton',
    button: null
    isChecked: false

    options:
      uuid: ''
      label: null
      icon: null
      editable: null
      command: null
      queryState: true
      cssClass: null

    _create: ->
      # By default the icon is icon-command, but this doesn't
      # always match with
      # <http://fortawesome.github.com/Font-Awesome/#base-icons>
      @options.icon ?= "icon-#{@options.label.toLowerCase()}"

      id = "#{@options.uuid}-#{@options.label}"
      opts = @options
      @button = @_createButton id, opts.command, opts.label, opts.icon
      @element.append @button
      @button.addClass @options.cssClass if @options.cssClass
      @button.addClass 'btn-large' if @options.editable.options.touchScreen
      @button.data 'hallo-command', @options.command

      hoverclass = 'ui-state-hover'
      @button.bind 'mouseenter', (event) =>
        if @isEnabled()
          @button.addClass hoverclass
      @button.bind 'mouseleave', (event) =>
        @button.removeClass hoverclass

    _init: ->
      @button = @_prepareButton() unless @button
      @element.append @button
      queryState = (event) =>
        return unless @options.command
        try
          @checked document.queryCommandState @options.command
        catch e
          return

      if @options.command
        @button.bind 'click', (event) =>
          @options.editable.execute @options.command
          queryState
          return false

      return unless @options.queryState

      editableElement = @options.editable.element
      events = 'keyup paste change mouseup hallomodified'
      editableElement.bind events, queryState
      editableElement.bind 'halloenabled', =>
        editableElement.bind events, queryState
      editableElement.bind 'hallodisabled', =>
        editableElement.unbind events, queryState

    enable: ->
      @button.removeAttr 'disabled'

    disable: ->
      @button.attr 'disabled', 'true'

    isEnabled: ->
      return @button.attr('disabled') != 'true'

    refresh: ->
      if @isChecked
        @button.addClass 'ui-state-active'
      else
        @button.removeClass 'ui-state-active'

    checked: (checked) ->
      @isChecked = checked
      @refresh()

    _createButton: (id, command, label, icon) ->
      classes = [
        'ui-button'
        'ui-widget'
        'ui-state-default'
        'ui-corner-all'
        'ui-button-text-only'
        "#{command}_button"
      ]
      jQuery "<button id=\"#{id}\"
        class=\"#{classes.join(' ')}\" title=\"#{label}\">
          <span class=\"ui-button-text\">
            <i class=\"#{icon}\"></i>
          </span>
        </button>"


  jQuery.widget 'IKS.hallobuttonset',
    buttons: null
    _create: ->
      @element.addClass 'ui-buttonset'

    _init: ->
      @refresh()

    refresh: ->
      rtl = @element.css('direction') == 'rtl'
      @buttons = @element.find '.ui-button'
      @buttons.removeClass 'ui-corner-all ui-corner-left ui-corner-right'
      if rtl
        @buttons.filter(':first').addClass 'ui-corner-right'
        @buttons.filter(':last').addClass 'ui-corner-left'
      else
        @buttons.filter(':first').addClass 'ui-corner-left'
        @buttons.filter(':last').addClass 'ui-corner-right'
)(jQuery)
