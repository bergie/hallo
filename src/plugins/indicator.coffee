#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloindicator',
    options:
      editable: null
      className: 'halloEditIndicator'

    _create: ->
      this.element.on 'halloenabled', =>
        do @buildIndicator

    populateToolbar: ->

    buildIndicator: ->
      editButton = jQuery '<div><i class="icon-edit"></i> Edit</div>'
      editButton.addClass @options.className
      do editButton.hide

      this.element.before editButton

      @bindIndicator editButton
      @setIndicatorPosition editButton

    bindIndicator: (indicator) ->
      indicator.on 'click', =>
        do @options.editable.element.focus

      this.element.on 'halloactivated', ->
        do indicator.hide

      this.element.on 'hallodisabled', ->
        do indicator.remove

      @options.editable.element.hover ->
        return if jQuery(this).hasClass 'inEditMode'
        do indicator.show
      , (data) ->
        return if jQuery(this).hasClass 'inEditMode'
        return if data.relatedTarget is indicator.get 0

        do indicator.hide

    setIndicatorPosition: (indicator) ->
      indicator.css 'position', 'absolute'
      offset = this.element.position()
      indicator.css 'top', offset.top + 2
      indicator.css 'left', offset.left + 2

) jQuery
