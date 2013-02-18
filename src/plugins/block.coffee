#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloblock',
    options:
      editable: null
      toolbar: null
      uuid: ''
      elements: [
        'h1'
        'h2'
        'h3'
        'p'
        'pre'
        'blockquote'
      ]
      buttonCssClass: null

    populateToolbar: (toolbar) ->
      buttonset = jQuery "<span class=\"#{@widgetName}\"></span>"
      contentId = "#{@options.uuid}-#{@widgetName}-data"
      target = @_prepareDropdown contentId
      toolbar.append buttonset
      buttonset.hallobuttonset()
      buttonset.append target
      buttonset.append @_prepareButton target

    _prepareDropdown: (contentId) ->
      contentArea = jQuery "<div id=\"#{contentId}\"></div>"

      containingElement = @options.editable.element.get(0).tagName.toLowerCase()

      addElement = (element) =>
        el = jQuery "<button class='blockselector'>
          <#{element} class=\"menu-item\">#{element}</#{element}>
        </button>"
        
        if containingElement is element
          el.addClass 'selected'

        unless containingElement is 'div'
          el.addClass 'disabled'

        el.on 'click', =>
          tagName = element.toUpperCase()
          if el.hasClass 'disabled'
            return
          if navigator.appName is 'Microsoft Internet Explorer'
            # In IE FormatBlock wants tags inside brackets
            @options.editable.execute 'FormatBlock', "<#{tagName}>"
            return
          @options.editable.execute 'formatBlock', tagName
          
        queryState = (event) =>
          block = document.queryCommandValue 'formatBlock'
          if block.toLowerCase() is element
            el.addClass 'selected'
            return
          el.removeClass 'selected'
        
        events = 'keyup paste change mouseup'
        @options.editable.element.on events, queryState

        @options.editable.element.on 'halloenabled', =>
          @options.editable.element.on events, queryState
        @options.editable.element.on 'hallodisabled', =>
          @options.editable.element.off events, queryState

        el

      for element in @options.elements
        contentArea.append addElement element
      contentArea

    _prepareButton: (target) ->
      buttonElement = jQuery '<span></span>'
      buttonElement.hallodropdownbutton
        uuid: @options.uuid
        editable: @options.editable
        label: 'block'
        icon: 'icon-text-height'
        target: target
        cssClass: @options.buttonCssClass
      buttonElement

)(jQuery)
