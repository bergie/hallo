var
	express = require('express'),
	app = express.createServer();

// Configure
app.configure(function(){
    app.use(express.static(__dirname));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
app.get('/', function(req, res){
  res.send('<a href="http://localhost:3000/examples/">Examples</a>');
});

// Listen
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
