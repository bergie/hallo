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

mergeDirs = (k) ->
  series [
    (sh "mkdir -p src")
    (sh "cp *.coffee src/")
    (sh "cp plugins/*.coffee src/")
    (sh "cp widgets/*.coffee src/")
  ], k

task 'doc', 'generate documentation for *.coffee files', ->
  series [
    mergeDirs
    (sh "docco-husky src")
  ]

task 'doc_copy', 'copy documentation to gh-pages branch', ->
  series [
    mergeDirs
    (sh "docco-husky src")
    (sh "mv docs docs_tmp")
    (sh "git checkout gh-pages")
    (sh "mv docs_tmp docs")
    (sh "git add docs/*")
    (sh "git commit -m 'updating documentation from master'")
    (sh "git checkout master")
  ]

task 'build', 'generate unified JavaScript file for whole Hallo', ->
  series [
    mergeDirs
    (sh "coffee -o examples -j hallo.js -c src/*.coffee")
  ]

task 'min', 'minify the generated JavaScript file', ->
  series [
    mergeDirs
    (sh "coffee -o examples -j hallo.js -c src/*.coffee")
    (sh "uglifyjs examples/hallo.js > examples/hallo-min.js")
  ]

task 'bam', 'build and minify Hallo', ->
  invoke 'min'
