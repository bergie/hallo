#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.hallocleanhtml',
    
    initialized: []

    _create: ->
      if jQuery.htmlClean is undefined
        throw new Error 'The hallocleanhtml plugin requires jQuery.htmlClean'
        return

    cleanupContentClone: (el) ->
    
      if jQuery.inArray el, @initialized
        @initialized.push(el)
        
        # bind paste handler on first call
        el.bind 'paste', this, (event) -> 
          widget = event.data
          
          rangy.getSelection().deleteFromDocument()
          lastRange = widget.options.editable.getSelection()
          
          # make sure content will be pasted in an empty element
          # (because we cannot access clipboard data in all browsers)
          hiddenPaste = jQuery "<div id='hallocleanhtml-paste' contenteditable='true' style='position:fixed;top:-400px;left:0;'></div>"
          jQuery('body').append hiddenPaste
          hiddenPaste.focus()
          
          setTimeout (widget, lastRange) -> 
          
            # get and tidy up whole html
            hiddenPaste = jQuery("#hallocleanhtml-paste")
            pasted = hiddenPaste.html()
            cleanPasted = jQuery.htmlClean pasted, @options
            console.log "tidy pasted content: " + cleanPasted
            
            # paste tidy pasted content back
            setTimeout (cleanPasted) -> 
              document.execCommand("insertHTML", false, cleanPasted);
            , 4, cleanPasted
            
            # remove pasting element
            hiddenPaste.remove()
            
            # return focus and caret position to editable
            widget.element.focus()
            widget.options.editable.restoreSelection(lastRange)
            
          , 4, widget, lastRange

) jQuery
