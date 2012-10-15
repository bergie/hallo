fs = require 'fs'
{exec, spawn} = require 'child_process'
{series} = require 'async'

sh = (command) -> (k) ->
  console.log "Executing #{command}"
  exec command, (err, sout, serr) ->
    console.log err if err
    console.log sout if sout
    console.log serr if serr
    do k

getVersion = ->
  packageJson = JSON.parse fs.readFileSync "#{__dirname}/package.json", 'utf-8'
  packageJson.version

task 'doc', 'generate documentation for *.coffee files', ->
  series [
    (sh "./node_modules/.bin/docco-husky src")
  ]

task 'doc_copy', 'copy documentation to gh-pages branch', ->
  series [
    (sh "./node_modules/.bin/docco-husky src")
    (sh "mv docs docs_tmp")
    (sh "git checkout gh-pages")
    (sh "mv docs_tmp/* docs")
    (sh "git add docs/*")
    (sh "git commit -m 'updating documentation from master'")
    (sh "git checkout master")
  ]

task 'build', 'generate unified JavaScript file for whole Hallo', ->
  version = do getVersion
  console.log version
  series [
    (sh "cp -R src tmp")
    (sh "sed -ibak 's/{{ VERSION }}/#{version}/' '#{__dirname}/tmp/hallo.coffee'")
    (sh "./node_modules/.bin/coffee -o examples -j hallo.js -c `find tmp -type f -name '*.coffee'`")
    (sh "rm -r tmp")
  ]

task 'min', 'minify the generated JavaScript file', ->
  version = do getVersion
  console.log version
  series [
    (sh "cp -R src tmp")
    (sh "sed -ibak 's/{{ VERSION }}/#{version}/' '#{__dirname}/tmp/hallo.coffee'")
    (sh "./node_modules/.bin/coffee -o examples -j hallo.js -c `find tmp -type f -name '*.coffee'`")
    (sh "./node_modules/.bin/uglifyjs examples/hallo.js > examples/hallo-min.js")
    (sh "rm -r tmp")
  ]

task 'bam', 'build and minify Hallo', ->
  invoke 'min'
