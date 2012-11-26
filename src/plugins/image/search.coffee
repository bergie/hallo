#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimagesearch',
    options:
      imageWidget: null
      searchCallback: null
      searchUrl: null
      limit: 5

    _create: ->
      @element.html '<div>
        <form method="get">
          <input type="text" class="searchInput" placeholder="Search" />
          <input type="submit" class="btn searchButton" value="OK" />
        </form>
        <div class="searchResults imageThumbnailContainer">
          <div class="activitySpinner">Loading images...</div>
          <ul></ul>
        </div>
      </div>'

    _init: ->
      if @options.searchUrl and !@options.searchCallback
        @options.searchCallback = @_ajaxSearch

      jQuery('.activitySpinner', @element).hide()

      jQuery('form', @element).submit (event) =>
        event.preventDefault()

        jQuery('.activitySpinner', @element).show()

        query = jQuery('.searchInput', @element.element).val()
        @options.searchCallback query, @options.limit, 0, (results) =>
          @_showResults results

    _showResult: (image) ->
      image.label = image.alt unless image.label

      html = jQuery "<li>
        <img src=\"#{image.url}\" class=\"imageThumbnail\"
          title=\"#{image.label}\"></li>"

      html.on 'click', =>
        @options.imageWidget.setCurrent image

      # Prevent users from dragging from the thumbnails list
      jQuery('img', html).on 'mousedown', (event) =>
        event.preventDefault()
        @options.imageWidget.setCurrent image

      jQuery('.imageThumbnailContainer ul', @element).append html

    _showNextPrev: (results) ->
      container = jQuery 'imageThumbnailContainer ul', @element
      container.prepend jQuery '<div class="pager-prev" style="display:none" />'
      container.append jQuery '<div class="pager-next" style="display:none" />'

      jQuery('.pager-prev', container).show() if results.offset > 0
      jQuery('.pager-next', container).show() if results.offset < results.total

      jQuery('.pager-prev', container).click (event) =>
        offset = results.offset - @options.limit
        @options.searchCallback query, @options.limit, offset, (results) =>
          @_showResults results
      jQuery('.pager-next', container).click (event) =>
        offset = results.offset + @options.limit
        @options.searchCallback query, @options.limit, offset, (results) =>
          @_showResults results

    _showResults: (results) ->
      jQuery('.activitySpinner', @element).hide()
      jQuery('.imageThumbnailContainer ul', @element).empty()
      jQuery('.imageThumbnailContainer ul', @element).show()

      @_showResult image for image in results.assets

      @options.imageWidget.setCurrent results.assets.shift()

      @_showNextPrev results

    _ajaxSearch: (query, limit, offset, success) ->
      searchUrl = @searchUrl + '?' + jQuery.param
        q: query
        limit: limit
        offset: offset

      jQuery.getJSON searchUrl, success

) jQuery
