#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimageupload',
    options:
      uploadCallback: null
      uploadUrl: null
      imageWidget: null

    _create: ->
      @element.html '
        <form>
          <input type="file" class="file" accept="image/*" />
          <input type="submit" class="uploadSubmit" value="Upload">
        </form>
      '
    _init: ->
      widget = @
      if widget.options.uploadUrl and !widget.options.uploadCallback
        widget.options.uploadCallback = widget._iframeUpload

      jQuery('.uploadSubmit', @element).bind 'click', (event) ->
        event.preventDefault()
        userFile = jQuery('.file', widget.element).val()
        widget.options.uploadCallback
          widget: widget
          file: jQuery('.file', widget.element).val()
          success: (url) ->
            widget.options.imageWidget.setCurrent
              url: url
              label: ''

    _prepareIframe: (widget) ->
      iframeName = "#{widget.options.uuid}_#{widget.widgetName}_postframe"
      iframe = jQuery "##{iframeName}"
      return iframe if iframe.length

      iframe = jQuery "<iframe name=\"#{iframeName}\" id=\"#{iframeName}\" class=\"hidden\" src=\"javascript:false;\" style=\"display:none\" />"
      @element.append iframe
      iframe.get(0).name = iframeName
      iframe

    _iframeUpload: (data) ->
      widget = data.widget
      iframe = widget._prepareIframe widget
      console.log iframe, iframe.get(0).name

      uploadForm = jQuery 'form', widget.element
      uploadForm.attr 'action', widget.options.uploadUrl
      uploadForm.attr 'method', 'post'
      uploadForm.attr 'userfile', data.file
      uploadForm.attr 'enctype', 'multipart/form-data'
      uploadForm.attr 'encoding', 'multipart/form-data'
      uploadForm.attr 'target', iframe.get(0).name
      uploadForm.submit()

      iframe.load ->
        imageUrl = iframe.get(0).contentWindow.location.href
        widget.element.hide()
        data.success imageUrl

) jQuery
