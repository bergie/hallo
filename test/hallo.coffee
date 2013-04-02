module 'Hallo Core'

test 'Hallo widget registered', ->
  equal typeof jQuery('body').hallo, 'function'

test 'Hallo instantiation and destruction', ->
  fixture = jQuery '.hallo-instance p.editable'

  fixture.bind 'halloenabled', ->
    equal fixture.attr('contentEditable'), 'true'
    do start

  # Instantiate
  do stop
  do fixture.hallo

  # Activate to get toolbar
  do fixture.focus
  ok fixture.hasClass 'inEditMode'
  ok fixture.data('IKS-halloToolbarContextual')
  equal jQuery('.hallotoolbar').length, 1
  # Contextual toolbar shouldn't be visible without a selection
  equal jQuery('.hallotoolbar:visible').length, 0

  # Check also the instance data
  instance = fixture.data 'IKS-hallo'
  ok instance

  fixture.bind 'hallodisabled', ->
    equal fixture.attr('contentEditable'), 'false'
    do start

  # Destroy
  do stop
  fixture.hallo 'destroy'
  equal fixture.data('IKS-hallo'), undefined
  equal fixture.data('IKS-halloToolbarContextual'), undefined
  equal jQuery('.hallotoolbar').length, 0
  equal fixture.hasClass('inEditMode'), false

test 'Hallo activation events', ->
  fixture = jQuery '.hallo-instance p.editable'

  # Instantiate
  do fixture.hallo
  instance = fixture.data 'IKS-hallo'

  fixture.on 'halloactivated', (event, data) ->
    equal data, instance
    equal jQuery('.hallotoolbar').length, 1
    ok fixture.hasClass 'inEditMode'
    do start
    do fixture.blur

  fixture.on 'hallodeactivated', (event, data) ->
    equal data, instance
    equal fixture.hasClass('inEditMode'), false
    do start

  do stop
  do fixture.focus

test 'Hallo modification events', ->
  fixture = jQuery '.hallo-modified p.editable'

  # Instantiate
  do fixture.hallo
  instance = fixture.data 'IKS-hallo'
  do fixture.focus

  equal fixture.hallo('isModified'), false
  equal fixture.hasClass('isModified'), false

  fixture.on 'hallomodified', (event, data) ->
    equal data.editable, instance
    equal data.content, 'h'
    ok fixture.hasClass 'isModified'
    ok fixture.hallo 'isModified'

    fixture.hallo 'setUnmodified'
    equal fixture.hasClass('isModified'), false
    equal fixture.hallo('isModified'), false

    equal fixture.hallo('getContents'), data.content

    fixture.hallo 'restoreOriginalContent'
    equal fixture.hallo('getContents'), ''
    equal fixture.html(), ''
    do start

  # Simulate typing
  press = jQuery.Event 'keyup'
  fixture.html 'h'
  do stop
  fixture.trigger press

test 'Hallo fixed toolbar', ->
  fixture = jQuery '.hallo-modified p.editable'

  # Instantiate
  fixture.hallo
    toolbar: 'halloToolbarFixed'
  instance = fixture.data 'IKS-hallo'

  # We shouldn't have a toolbar before first focus
  equal fixture.data('IKS-halloToolbarFixed'), undefined

  do fixture.focus
  ok fixture.data('IKS-halloToolbarFixed')
  equal fixture.data('IKS-halloToolbarContextual'), undefined
  equal jQuery('.hallotoolbar:visible').length, 1
  equal jQuery('.hallotoolbar:hidden').length, 0

  do fixture.blur
  equal jQuery('.hallotoolbar:visible').length, 0
  equal jQuery('.hallotoolbar:hidden').length, 1
  ok fixture.data('IKS-halloToolbarFixed')

  do fixture.focus
  equal jQuery('.hallotoolbar:visible').length, 1
  equal jQuery('.hallotoolbar:hidden').length, 0

  do fixture.blur
  equal jQuery('.hallotoolbar:visible').length, 0
  equal jQuery('.hallotoolbar:hidden').length, 1
