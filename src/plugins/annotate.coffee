((jQuery) ->
  z = null
  if @VIE isnt undefined
    z = new VIE
    z.use new z.StanbolService
      proxyDisabled: true
      url : 'http://dev.iks-project.eu:8081',

  jQuery.widget 'IKS.halloannotate',
    options:
      vie: z
      editable: null
      toolbar: null
      uuid: ''
      select: ->
      decline: ->
      remove: ->
      buttonCssClass: null

    _create: ->
      widget = @
      if @options.vie is undefined
        throw new Error 'The halloannotate plugin requires VIE'
        return
      unless typeof @element.annotate is 'function'
        throw new Error 'The halloannotate plugin requires annotate.js'
        return

      # states are off, working, on
      @state = 'off'

      @instantiate()

      turnOffAnnotate = ->
        editable = @
        jQuery(editable).halloannotate 'turnOff'
      editableElement = @options.editable.element
      editableElement.on 'hallodisabled', turnOffAnnotate

    populateToolbar: (toolbar) ->
      buttonHolder = jQuery "<span class=\"#{@widgetName}\"></span>"
      @button = buttonHolder.hallobutton
        label: 'Annotate'
        icon: 'icon-tags'
        editable: @options.editable
        command: null
        uuid: @options.uuid
        cssClass: @options.buttonCssClass
        queryState: false
 
      buttonHolder.on 'change', (event) =>
        return if @state is "pending"
        return @turnOn() if @state is "off"
        @turnOff()
            
      buttonHolder.buttonset()

      toolbar.append @button

    cleanupContentClone: (el) ->
      if @state is 'on'
        el.find(".entity:not([about])").each () ->
          jQuery(@).replaceWith jQuery(@).html()

    instantiate: ->
      widget = @
      @options.editable.element.annotate
        vie: @options.vie
        debug: false
        showTooltip: true
        select: @options.select
        remove: @options.remove
        success: @options.success
        error: @options.error
      .on 'annotateselect', (event, data) ->
        widget.options.editable.setModified()
        # console.info @, arguments
      .on 'annotateremove', ->
        jQuery.noop()
        # console.info @, arguments

    turnPending: ->
      @state = 'pending'
      @button.hallobutton 'checked', false
      @button.hallobutton 'disable'

    turnOn: ->
      @turnPending()
      widget = @
      try
        @options.editable.element.annotate 'enable', (success) =>
          return unless success
          @state = 'on'
          @button.hallobutton 'checked', true
          @button.hallobutton 'enable'
      catch e
        alert e

    turnOff: ->
      @options.editable.element.annotate 'disable'
      @state = 'off'
      return unless @button
      @button.attr 'checked', false
      @button.find("label").removeClass "ui-state-clicked"
      @button.button 'refresh'
)(jQuery)
