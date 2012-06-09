#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimagesuggestions',
    loaded: false

    options:
      entity: null
      vie: null
      dbPediaUrl: null
      getSuggestions: null

    _create: ->
      @element.html '
      <div id="' + @options.uuid + '-tab-suggestions">
        <div class="imageThumbnailContainer">
          <div class="activitySpinner">Loading images...</div>
          <ul></ul>
        </div>
      </div>'

    _init: ->
      jQuery('.activitySpinner', @element).hide()

    _normalizeRelated: (related) ->
      return related if _.isString related
      return related.join(',') if _.isArray related
      related.pluck('@subject').join ','

    _prepareVIE: ->
      @options.vie = new VIE unless @options.vie
      return if @options.vie.services.dbpedia
      return unless @options.dbPediaUrl

      @options.vie.use new vie.DBPediaService
        url: @options.dbPediaUrl
        proxyDisabled: true

    _getSuggestions: ->
      return if @loaded
      return unless @options.entity

      jQuery('.activitySpinner', @element).show()

      tags = @options.entity.get 'skos:related'
      if tags.length is 0
        jQuery("#activitySpinner").html 'No images found.'
        return

      jQuery('.imageThumbnailContainer ul', @element).empty()

      # Get suggestions from server
      normalizedTags = @_normalizeRelated tags
      @options.getSuggestions normalizedTags, widget.options.limit, 0, @_showSuggestions if @options.getSuggestions

      do @_prepareVIE
      @_getSuggestionsDbPedia tags if @options.vie.services.dbpedia

      @loaded = true

    _getSuggestionsDbPedia: (tags) ->
      widget = this
      thumbId = 1
      _.each tags, (tag) ->
        vie.load(entity: tag).
        using('dbpedia').
        execute().
        done (entities) ->
          jQuery('.activitySpinner', @element).hide()

          _.each entities, (entity) ->
            thumbnail = entity.attributes['<http://dbpedia.org/ontology/thumbnail>']
            return unless thumbnail
            img = thumbnail[0].value if _.isObject thumbnail
            img = widget.options.entity.fromReference thumbnail if _.isString thumbnail
            widget._showSuggestion
              url: img
              label: tag

    _showSuggestion: (image) ->
      html = jQuery "<li><img src=\"#{image.url}\" class=\"imageThumbnail\" title=\"#{image.label}\"></li>"
      html.bind 'click', =>
        @options.imageWidget.setCurrent image
      jQuery('.imageThumbnailContainer ul', @element).append html

    _showSuggestions: (suggestions) ->
      jQuery('.activitySpinner', @element).hide()

      _.each suggestions, (image) =>
        @_showSuggestion image

) jQuery
