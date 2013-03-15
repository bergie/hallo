#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.hallocleanhtml',
    
    initialized: []

    _create: ->
      console.log "create hallocleanhtml plugin " + jQuery.htmlClean
      unless jQuery.htmlClean?
        throw new Error 'The hallocleanhtml plugin requires jQuery.htmlClean'
        return
      
    instantiate: ->
      console.log "instantiate (hallocleanhtml plugin)"

    cleanupContentClone: (el) ->
    
      # bind paste handler on first call
      if jQuery.inArray el, @initialized
        @initialized.push(el)
        
        el.bind 'paste', el, (event) -> 
          setTimeout (el) -> 
            # tidy up whole html
            el.html jQuery.htmlClean el.html(), @options
          , 4, event.data

) jQuery
