#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license

# This plugin will tidy up pasted content with help of 
# the jquery-clean plugin (https://code.google.com/p/jquery-clean/).
# Also the selection save and restore module from rangy 
# (https://code.google.com/p/rangy/wiki/SelectionSaveRestoreModule)
# is required in order to resolve cross browser bugs for pasting.
# The plugins have to be accessible or an error will be thrown. 
# 
# Usage (example):
#
#jQuery('.editable').hallo({
#         plugins: {
#            'hallocleanhtml': {
#              format: false,
#              allowedTags: ['p', 'em', 'strong', 'br', 'div', 'ol', 'ul', 'li', 'a'],
#              allowedAttributes: ['style']
#            }
#          },
#        });
#
# The plugin options correspond to the available jquery-clean plugin options.
# 
# Tested in IE 10 + 9, Chrome 25, FF 19

((jQuery) ->
  jQuery.widget 'IKS.hallocleanhtml',

    _create: ->
      if jQuery.htmlClean is undefined
        throw new Error 'The hallocleanhtml plugin requires jQuery.htmlClean (see https://code.google.com/p/jquery-clean/)'
        return

      editor = this.element
      
      # bind paste handler on first call
      editor.bind 'paste', this, (event) -> 
       
        # TODO: find out why this check always fails when placed directly after jQuery.htmlClean check
        if rangy.saveSelection is undefined
          throw new Error 'The hallocleanhtml plugin requires the selection save and restore module from rangy (see https://code.google.com/p/rangy/wiki/SelectionSaveRestoreModule).'
          return 
        
        widget = event.data
        widget.options.editable.getSelection().deleteContents()  # bugfix for overwriting selected text in ie
        lastRange = rangy.saveSelection()
        
        # make sure content will be pasted _empty_ editor and save old contents
        # (because we cannot access clipboard data in all browsers)
        lastContent = editor.html()
        editor.html ''
        
        setTimeout -> 
          
          pasted = editor.html()
          cleanPasted = jQuery.htmlClean pasted, @options
          
          #console.log "content before: " + lastContent
          #console.log "pasted content: " + pasted
          #console.log "tidy pasted content: " + cleanPasted
         
          # back in timne to the state before pasting
          editor.html lastContent
          rangy.restoreSelection lastRange
          
          # paste tidy pasted content back
          # TODO: set cursor _behind_ pasted content
          if cleanPasted != ''
            try
              document.execCommand 'insertHTML', false, cleanPasted
            catch error
              # most likely ie
              range = widget.options.editable.getSelection()
              range.insertNode range.createContextualFragment(cleanPasted)
        , 4

) jQuery
