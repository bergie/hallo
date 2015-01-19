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
      commandValue: null
      queryState: true
      cssClass: null

    _create: ->
      # By default the icon is fa fa-command, but this doesn't
      # always match with
      # <http://fortawesome.github.com/Font-Awesome/#base-icons>
      @options.icon ?= "fa fa-#{@options.label.toLowerCase()}"

      id = "#{@options.uuid}-#{@options.label}"
      opts = @options
      @button = @_createButton id, opts.command, opts.label, opts.icon
      @element.append @button
      @button.addClass @options.cssClass if @options.cssClass
      @button.addClass 'btn-large' if @options.editable.options.touchScreen
      @button.data 'hallo-command', @options.command
      if @options.commandValue
        @button.data 'hallo-command-value', @options.commandValue
        
    _init: ->
      @button = @_prepareButton() unless @button
      @element.append @button

      if @options.queryState is true
        queryState = (event) =>
          return unless @options.command
          try
            if @options.commandValue
              value = document.queryCommandValue @options.command
              compared = value.match(new RegExp(@options.commandValue,"i"))
              @checked(if compared then true else false)
            else
              @checked document.queryCommandState @options.command
          catch e
            return
      else
        queryState = @options.queryState

      if @options.command
        @button.on 'click', (event) =>
          if @options.commandValue
            @options.editable.execute @options.command, @options.commandValue
          else
            @options.editable.execute @options.command
          if typeof queryState is 'function'
            queryState()
          return false

      return unless @options.queryState

      editableElement = @options.editable.element
      events = 'keyup paste change mouseup hallomodified'
      editableElement.on events, queryState
      editableElement.on 'halloenabled', =>
        editableElement.on events, queryState
      editableElement.on 'hallodisabled', =>
        editableElement.off events, queryState

    enable: ->
      @button.removeAttr 'disabled'

    disable: ->
      @button.attr 'disabled', 'true'

    isEnabled: ->
      return @button.attr('disabled') != 'true'

    refresh: ->
      if @isChecked
        @button.addClass 'btn-primary'
      else
        @button.removeClass 'btn-primary'

    checked: (checked) ->
      @isChecked = checked
      @refresh()

    _createButton: (id, command, label, icon) ->
      classes = [
        "btn",
        "btn-default",
        "#{command}_button"
      ]
      jQuery "<button id=\"#{id}\"
        class=\"#{classes.join(' ')}\" title=\"#{label}\">
            <i class=\"#{icon}\"></i>
        </button>"


  jQuery.widget 'IKS.hallobuttonset',
    buttons: null
    _create: ->
      @element.addClass 'btn-group'

    _init: ->
      @refresh()

    refresh: ->
      rtl = @element.css('direction') == 'rtl'
)(jQuery)
