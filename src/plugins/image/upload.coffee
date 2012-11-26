#     Hallo - a rich text editing jQuery UI widget
#     (c) 2012 Henri Bergius, IKS Consortium
#     Hallo may be freely distributed under the MIT license
((jQuery) ->
  jQuery.widget 'IKS.halloimageupload',
    options:
      uploadCallback: null
      uploadUrl: null
      imageWidget: null
      entity: null

    _create: ->
      @element.html '
        <form class="upload">
        <input type="file" class="file" name="userfile" accept="image/*" />
        <input type="hidden" name="tags" value="" />
        <input type="text" class="caption" name="caption" placeholder="Title" />
        <button class="uploadSubmit">Upload</button>
        </form>
      '
    _init: ->
      widget = @
      if widget.options.uploadUrl and !widget.options.uploadCallback
        widget.options.uploadCallback = widget._iframeUpload

      jQuery('.uploadSubmit', @element).on 'click', (event) ->
        event.preventDefault()
        event.stopPropagation()
        widget.options.uploadCallback
          widget: widget
          success: (url) ->
            widget.options.imageWidget.setCurrent
              url: url
              label: ''

    _prepareIframe: (widget) ->
      iframeName = "#{widget.widgetName}_postframe_#{widget.options.uuid}"
      iframeName = iframeName.replace /-/g, '_'
      iframe = jQuery "##{iframeName}"
      return iframe if iframe.length

      iframe = jQuery "<iframe name=\"#{iframeName}\" id=\"#{iframeName}\"
        class=\"hidden\" style=\"display:none\" />"
      @element.append iframe
      iframe.get(0).name = iframeName
      iframe

    _iframeUpload: (data) ->
      widget = data.widget
      iframe = widget._prepareIframe widget

      uploadForm = jQuery 'form.upload', widget.element

      if typeof widget.options.uploadUrl is 'function'
        uploadUrl = widget.options.uploadUrl widget.options.entity
      else
        uploadUrl = widget.options.uploadUrl

      iframe.on 'load', ->
        imageUrl = iframe.get(0).contentWindow.location.href
        widget.element.hide()
        data.success imageUrl

      uploadForm.attr 'action', uploadUrl
      uploadForm.attr 'method', 'post'
      uploadForm.attr 'target', iframe.get(0).name
      uploadForm.attr 'enctype', 'multipart/form-data'
      uploadForm.attr 'encoding', 'multipart/form-data'
      uploadForm.submit()

) jQuery
