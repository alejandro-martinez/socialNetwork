var express = require('express'),
    path = require('path'),
    http = require('http'),
	fs = require('fs'),
    users = require('./routes/users');    
	
var app = express();    
var server = http.createServer(app);
//var io = require('socket.io').listen(server);

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
 
    app.use(express.logger('dev'));  /* 'default', 'short', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', users.index);
app.get('/dashboard', users.showDashboard);
app.get('/contacts', users.showContacts);


server.listen(app.get('port'), function () {
     console.log("Express server escuchando en puerto" + app.get('port'));
 });

