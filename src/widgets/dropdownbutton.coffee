#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.hallodropdownbutton',
    button: null

    options:
      uuid: ''
      label: null
      icon: null
      editable: null
      target: ''
      cssClass: null

    _create: ->
      @options.icon ?= "icon-#{@options.label.toLowerCase()}"

    _init: ->
      target = jQuery @options.target
      target.css 'position', 'absolute'
      target.addClass 'dropdown-menu'

      target.hide()
      @button = @_prepareButton() unless @button

      @button.bind 'click', =>
        if target.hasClass 'open'
          @_hideTarget()
          return
        @_showTarget()

      target.bind 'click', =>
        @_hideTarget()

      @options.editable.element.bind 'hallodeactivated', =>
        @_hideTarget()

      @element.append @button

    _showTarget: ->
      target = jQuery @options.target
      @_updateTargetPosition()
      target.addClass 'open'
      target.show()
    
    _hideTarget: ->
      target = jQuery @options.target
      target.removeClass 'open'
      target.hide()

    _updateTargetPosition: ->
      target = jQuery @options.target
      {top, left} = @button.position()
      top += @button.outerHeight()
      target.css 'top', top
      target.css 'left', left - 20

    _prepareButton: ->
      id = "#{@options.uuid}-#{@options.label}"
      classes = [
        'ui-button'
        'ui-widget'
        'ui-state-default'
        'ui-corner-all'
        'ui-button-text-only'
      ]
      buttonEl = jQuery "<button id=\"#{id}\"
        class=\"#{classes.join(' ')}\" title=\"#{@options.label}\">
         <i class=\"#{@options.icon}\"></i>
       </button>"
      buttonEl.addClass @options.cssClass if @options.cssClass
      buttonEl.button()

)(jQuery)
