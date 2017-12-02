let dotenv = require('dotenv'),
	package = require('./package.json'),
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	bodyParser = require("body-parser"),
	io = require('socket.io')(http),
	fs = require('fs'),
	whiskers = require('whiskers'),
	FooModule = require('./app/foo.js')
 
// Load our .env environment variable file in root directory
dotenv.load()

// Create and start some placeholder module. Your main app logic should be somewhere
// in there. In a more complex project, you will be splitting it all further, but this
// is just to show general flow.
const foo = new FooModule()
foo.start()

// Listen for data changes
foo.whenThereIsNewData(function(data) {

	// Render a sub-template with the new data
	let rendered = whiskers.render(fs.readFileSync('./templates/foo.html'), {
		bars: [{
			baz: (data === true) ? 'bar' : 'faz'
		}]
	})

	// Emit a signal to all connected users, including both the actual data as well 
	// as the rendered HTML for easy replacement. In a more complex app, you will 
	// probably be doing some front end processing rather than rendering in the 
	// server itself.
	io.emit('foo_data', {
		data: data,
		content: rendered
	})

})

// Set up Express to use POST/PUT JSON parsing. This allows us to do request.body.variable
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Serve static files from public directory, but accessed from /assets root url
app.use('/assets', express.static('public'))

// Here is what happens when a user accesses the index (main) page
app.get('/', function(request, response) {

	// Simple HTTP Authentication, if you need it.
	// If you uncomment the lines below, the browser will prompt you to enter
	// a username and password, which are checked against values in .env
	/*
	const auth = {login: process.env.AUTH_USERNAME, password: process.env.AUTH_PASSWORD}

	const b64auth = (request.headers.authorization || '').split(' ')[1] || ''
	const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

	// Verify login and password are set and correct
	if (!login || !password || login !== auth.login || password !== auth.password) {
		response.set('WWW-Authenticate', 'Basic realm="Simple Web App"') // change this
		response.status(401).send('Access restricted.') // custom message
		return
	}
	*/

	// We're going to be rendering our index page using some data
	let data = {}

	// Add current project version (from the package.json file) to our initial data package
	data.v = package.version

	// Grab some environment variable
	data.foobar = process.env.FOO_BAR

	// Render a sub-template
	data.foo = whiskers.render(fs.readFileSync('./templates/foo.html'), {
		bars: [{
			baz: 'faz'
		}, {
			baz: 'far'
		}]
	})

	// Render our index page
	const html = whiskers.render(fs.readFileSync('./templates/index.html'), data)

	// Send OK response and HTML data
	response.status(200).send(html)
})

// Here you handle what happens when a user initiates a GET /foo request.
app.post('/foo', function(request, response) {
	// Just some bogus object creation
	foo.create(request.body).then(function(id) {
		response.status(200).send(JSON.stringify({id:id}))
	}).catch(function(error) {
		console.error(`${Date()} [POST /subscriptions]`)
		console.error(error)
		response.status(400).send('{}')
	})
})

// Here you handle what happens when a user initiates a PUT /foo/<some id> request.
app.put('/foo/:id', function(request, response) {
	// Just some bogus object update
	foo.update(request.params.id, request.body).then(function() {
		response.status(200).send('{}')
	}).catch(function(error) {
		console.error(`${Date()} [PUT /subscriptions/${request.params.id}]`)
		console.error(error)
		response.status(400).send('{}')
	})
})

// Here you handle what happens when a user initiates a DELETE /foo/<some id> request.
app.delete('/foo/:id', function(request, response) {
	// Just some bogus object delete
	foo.delete(request.params.id).then(function() {
		response.status(200).send('{}')
	}).catch(function(error) {
		console.error(`${Date()} [DELETE /subscriptions/${request.params.id}]`)
		console.error(error)
		response.status(400).send('{}')
	})
})

// The server will listen on port 3000. After starting the app, you will be able to access it by 
// typing http://localhost:3000 into your browser.
http.listen(3000, function(){
  console.info(`${Date()} Node.js server listening on port 3000`)
})

// Here you handle what happens when a user connects via websockets
io.on('connection', function(socket) {
	// Log socket connection for debugging.
	console.info(`${Date()} User ${socket.id} connected`)

	// We're going to emit a version signal shortly after the user connects so that the page can be 
	// automatically refreshed if there's a version mismatch, opening up the possibility of keeping 
	// currently connected users automatically up to date without needing a manual page refresh.
	// Try the following: start the app as normal, access the index page in a browser, then stop the
	// app while keeping the browser page open, update the version in package.json, and start the app
	// again. You should see the browser page automatically refresh.
	setTimeout(function() {
		// Log it debug purposes
		console.info(`${Date()} Emitting version to ${socket.id}`)

		io.to(socket.id).emit('v', {
			v: package.version
		})
	},200)

	// Do whatever you want (updating database, etc) when a user disconnects.
	socket.on('disconnect', function() {
		// Log socket disconnect for debugging.
		console.info(`${Date()} User ${socket.id} disconnected`)
	})
})