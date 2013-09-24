#     Hallo - a rich text editing jQuery UI widget
#     (c) 2011 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
#
# ------------------------------------------------------
#
#     Hallo linebreak plugin
#     (c) 2011 Liip AG, Switzerland
#     This plugin may be freely distributed under the MIT license.
#
# The linebreak plugin allows linebreaks between editor buttons by
# wrapping each row in a div.
# It requires that all widgets have an id consisting of the uuid and
# the name for the surrounding element
# (<span id=\"#{@options.uuid}-" + widget.widgetName + "\">)
#
# The only option is 'breakAfter', which should be an array of
# widgetnames after which a linebreak should be inserted
# Make sure to add this option _after_ all the plugins that output
# toolbar icons when passing in the hallo options!
((jQuery) ->
  jQuery.widget "IKS.hallotoolbarlinebreak",
    options:
      editable: null
      uuid: ""
      # array of widgetnames after which a linebreak should occur
      breakAfter: []

    populateToolbar: (toolbar) ->
      buttonsets = jQuery('.ui-buttonset', toolbar)
      queuedButtonsets = jQuery()
      rowcounter = 0

      for row in @options.breakAfter
        rowcounter++
        buttonRow = "<div
          class=\"halloButtonrow halloButtonrow-#{rowcounter}\" />"
        for buttonset in buttonsets
          queuedButtonsets = jQuery(queuedButtonsets).add(jQuery(buttonset))
          if jQuery(buttonset).hasClass row
            queuedButtonsets.wrapAll buttonRow
            buttonsets = buttonsets.not(queuedButtonsets)
            queuedButtonsets = jQuery()
            break

      if buttonsets.length > 0
        rowcounter++
        buttonRow = "<div
          class=\"halloButtonrow halloButtonrow-#{rowcounter}\" />"
        buttonsets.wrapAll buttonRow
)(jQuery)
