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
        if document.queryCommandState @options.command
          @button.attr 'checked', true
          @button.next('label').addClass 'ui-state-clicked'
          @button.button 'refresh'
          return
        @button.attr 'checked', false
        @button.next('label').removeClass 'ui-state-clicked'
        @button.button 'refresh'
      editableElement.bind 'halloenabled', =>
        editableElement.bind 'keyup paste change mouseup hallomodified', queryState
      editableElement.bind 'hallodisabled', =>
        editableElement.unbind 'keyup paste change mouseup hallomodified', queryState

    enable: ->
      @button.button 'enable'

    disable: ->
      @button.button 'disable'

    _prepareButton: ->
      id = "#{@options.uuid}-#{@options.label}"
      buttonEl = jQuery """<input id=\"#{id}\" type=\"checkbox\" />
        <label for=\"#{id}\" class=\"#{@options.command}_button\" title=\"#{@options.label}\">
          <i class=\"#{@options.icon}\"></i>
        </label>"""
      buttonEl.addClass @options.cssClass if @options.cssClass
      button = buttonEl.button()
      button.data 'hallo-command', @options.command
      button

)(jQuery)
