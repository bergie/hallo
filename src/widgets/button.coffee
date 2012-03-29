#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.hallobutton',
    button: null

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
      # always match with <http://fortawesome.github.com/Font-Awesome/#base-icons>
      @options.icon ?= "icon-#{@options.label.toLowerCase()}"

      id = "#{@options.uuid}-#{@options.label}"
      @element.append @_createButton id, @options.command
      @element.append @_createLabel id, @options.command, @options.label, @options.icon
      @element.find('label').addClass @options.cssClass if @options.cssClass
      @button = @element.find 'input'
      @button.button()
      @button.addClass @options.cssClass if @options.cssClass
      @button.data 'hallo-command', @options.command

    _init: ->
      @button = @_prepareButton() unless @button
      @element.append @button

      if @options.command
        @button.bind 'change', (event) =>
          @options.editable.execute @options.command

      return unless @options.queryState

      editableElement = @options.editable.element
      queryState = (event) =>
        return unless @options.command
        try
          @checked document.queryCommandState @options.command
        catch e
          return
      editableElement.bind 'halloenabled', =>
        editableElement.bind 'keyup paste change mouseup hallomodified', queryState
      editableElement.bind 'hallodisabled', =>
        editableElement.unbind 'keyup paste change mouseup hallomodified', queryState

    enable: ->
      @button.button 'enable'

    disable: ->
      @button.button 'disable'

    refresh: ->
      @button.button 'refresh'

    checked: (checked) ->
      @button.attr 'checked', checked
      @refresh()

    _createButton: (id) ->
      jQuery "<input id=\"#{id}\" type=\"checkbox\" />"

    _createLabel: (id, command, label, icon) ->
      jQuery "<label for=\"#{id}\" class=\"#{command}_button\" title=\"#{label}\"><i class=\"#{icon}\"></i></label>"

)(jQuery)
