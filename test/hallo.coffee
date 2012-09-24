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
  equal jQuery('.hallotoolbar').length, 1
  ok fixture.hasClass 'inEditMode'

  # Check also the instance data
  instance = fixture.data 'hallo'
  ok instance

  fixture.bind 'hallodisabled', ->
    equal fixture.attr('contentEditable'), 'false'
    do start

  # Destroy
  do stop
  fixture.hallo 'destroy'
  equal fixture.data('hallo'), undefined
  equal jQuery('.hallotoolbar').length, 0
  equal fixture.hasClass('inEditMode'), false

test 'Hallo activation events', ->
  fixture = jQuery '.hallo-instance p.editable'

  # Instantiate
  do fixture.hallo
  instance = fixture.data 'hallo'

  fixture.bind 'halloactivated', (event, data) ->
    equal data, instance
    equal jQuery('.hallotoolbar').length, 1
    ok fixture.hasClass 'inEditMode'
    do start
    do fixture.blur

  fixture.bind 'hallodeactivated', (event, data) ->
    equal data, instance
    equal fixture.hasClass('inEditMode'), false
    do start

  do stop
  do fixture.focus

test 'Hallo modification events', ->
  fixture = jQuery '.hallo-modified p.editable'

  # Instantiate
  do fixture.hallo
  instance = fixture.data 'hallo'
  do fixture.focus

  equal fixture.hallo('isModified'), false
  equal fixture.hasClass('isModified'), false

  fixture.bind 'hallomodified', (event, data) ->
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
