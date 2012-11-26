#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloblacklist',
    options:
      tags: []

    _init: ->
      unless @options.tags.indexOf('br') is -1
        # Prevent 'enter' key if <br> is blacklisted
        @element.on 'keydown', (event) ->
          event.preventDefault() if event.originalEvent.keyCode is 13

    cleanupContentClone: (el) ->
      for tag in @options.tags
        jQuery(tag, el).remove()

) jQuery
