#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimagecurrent',
    options:
      imageWidget: null

    _create: ->
      @element.html '<div>
        <div class="activeImageContainer">
          <div class="rotationWrapper">
            <div class="hintArrow"></div>
              <img src="" class="activeImage" />
            </div>
            <img src="" class="activeImage activeImageBg" />
          </div>
          <div class="metadata" style="display: none;">
            <input type="text" class="caption" name="caption" />
          </div>
        </div>'
      @element.hide()

    setImage: (image) ->
      return unless image
      @element.show()

      jQuery('.activeImage', @element).attr 'src', image.url

      if image.label
        jQuery('input', @element).val image.label
        jQuery('.metadata', @element).show()

) jQuery
