#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license

# This plugin will tidy up pasted content with help of 
# the jquery-clean plugin (https://code.google.com/p/jquery-clean/).
# The plugin has to be accessible or an error will be thrown. 

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
          lastContent = el.html()
          
          setTimeout => 

            if lastContent != el.html()
              # something went wrong while setting focus to the hidden field
              # the content has been pasted inside the editor (most likely because of weird IE behaviour)
              console.error 'content has been pasted in wrong place'
          
            # get and tidy up whole html
            pasted = hiddenPaste.html()
            cleanPasted = jQuery.htmlClean pasted, @options
            #console.log "pasted content: " + pasted
            #console.log "tidy pasted content: " + cleanPasted
            
            # remove pasting element
            hiddenPaste.remove()
            
            # return focus and caret position to editable
            widget.element.focus()

            # paste tidy pasted content back
            # TODO: set cursor _behind_ pasted content
            if cleanPasted != ''
              if lastRange.commonAncestorContainer == document
                el.html cleanPasted
              else
                lastRange.insertNode lastRange.createContextualFragment(cleanPasted)
            
            widget.options.editable.restoreSelection lastRange
          , 4

) jQuery
