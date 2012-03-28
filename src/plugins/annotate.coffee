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
            buttonCssClass: ''

        _create: ->
          widget = @
          if @options.vie is undefined
            throw 'The halloannotate plugin requires VIE to be loaded'
            return

          unless typeof @element.annotate is 'function'
            throw 'The halloannotate plugin requires annotate.js to be loaded'
            return

          # states are off, working, on
          @state = 'off'

          buttonHolder = jQuery "<span class=\"#{widget.widgetName}\"></span>"
          @button = buttonHolder.hallobutton
            label: ''
            icon: 'icon-tags'
            editable: @options.editable
            command: null
            uuid: @options.uuid
            cssClass: @options.buttonCssClass
            queryState: false
 
          buttonHolder.bind 'change', (event) =>
            console.info @, arguments
            switch @state
              when 'off' then @enhance()
              when 'on' then @done()

          buttonHolder.buttonset()

          @options.toolbar.append @button
          @instantiate()

          editableElement = @options.editable.element
          queryState = (event) =>
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


        instantiate: ->
            @options.editable.element.annotate
                vie: @options.vie
                debug: true
                showTooltip: true
                select: @options.select
                remove: @options.remove
                success: @options.success
                error: @options.error
            # @buttons.acceptAll.hide()
        acceptAll: ->
            @options.editable.element.each ->
                jQuery(this).annotate 'acceptAll', (report) ->
                    console.log 'AcceptAll finished with the report:', report

            @buttons.acceptAll.button 'disable'

        enhance: ->
            widget = @
            @button.hallobutton "disable"
            console.info '.content', @options.editable.element
            try
                @options.editable.element.annotate 'enable', (success) =>
                    if success
                        @state = "on"
                        @button.hallobutton "enable"
                        console.log 'done'
                    else
                        @buttons.enhance.show()
                        .button('enable')
                        .button 'option', 'label', 'error, see the log.. Try to enhance again!'
            catch e
                alert e
        done: ->
            @options.editable.element.annotate 'disable'
            @state = 'off'
)(jQuery)
