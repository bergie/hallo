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

task 'doc', 'generate documentation for *.coffee files', ->
  series [
    (sh "docco-husky src")
  ]

task 'doc_copy', 'copy documentation to gh-pages branch', ->
  series [
    (sh "docco-husky src")
    (sh "mv docs docs_tmp")
    (sh "git checkout gh-pages")
    (sh "mv docs_tmp/* docs")
    (sh "git add docs/*")
    (sh "git commit -m 'updating documentation from master'")
    (sh "git checkout master")
  ]

task 'build', 'generate unified JavaScript file for whole Hallo', ->
  series [
    (sh "coffee -o examples -j hallo.js -c `find src -type f -name '*.coffee'`")
  ]

task 'min', 'minify the generated JavaScript file', ->
  series [
    (sh "coffee -o examples -j hallo.js -c `find src -type f -name '*.coffee'`")
    (sh "uglifyjs examples/hallo.js > examples/hallo-min.js")
  ]

task 'bam', 'build and minify Hallo', ->
  invoke 'min'
