fs = require 'fs'
{exec, spawn} = require 'child_process'

# deal with errors from child processes
exerr = (err, sout, serr)->
  console.log err if err
  console.log sout if sout
  console.log serr if serr

task 'mergedirs', 'Merge source files to one directory', ->
  try
    stat = fs.statSync "src"
  catch e
    fs.mkdirSync "src"
  exec "cp *.coffee src/", exerr
  exec "cp plugins/*.coffee src/", exerr

task 'doc', 'generate documentation for *.coffee files', ->
  invoke 'mergedirs'
  exec "docco src/*.coffee", exerr

task 'build', 'generate unified JavaScript file for whole Hallo', ->
  invoke 'mergedirs'
  exec "coffee -o examples -j hallo.js -c src/*.coffee", exerr

task 'min', 'minify the generated JavaScript file', ->
  invoke 'build'
  exec "uglifyjs examples/hallo.js > examples/hallo-min.js", exerr
