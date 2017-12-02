const request = require('request-promise-native')
const seqqueue = require('seq-queue')
const bar = require('./bar.js')

class FooModule {

	constructor() {
		// Callback listeners
		this._listeners = []
		// FIFO queue, see https://www.npmjs.com/package/seq-queue, and the notes below
		this._queue = seqqueue.createQueue()

		this._timerDuration = 2 // Seconds
	}

	// Do any kind of initialisation of flow here. E.g., start a regular fetching of some API url.
	start() {
		this.setupTimer()
	}

	// Add a callback that will be triggered when local data changes. Placeholder function to show
	// possibilities
	whenThereIsNewData(callback) {
		// Theoretically there can be multiple listeners attaching a callback, but in your case you
		// will likely only have one. Nevertheless, this shows the basic concept of multiple listeners.
		this._listeners.push(callback)
	}

	// Just to demonstrate
	create(data) {
		return Promise.resolve(777)
	}

	// Just to demonstrate
	update(id, data) {
		// Alternative Promise flow if there is a complex nesting/collection of asynchronous operations.
		// See callAPI() below for a real example
		return new Promise((resolve, reject) => {
			// Do something and then...
			resolve('whatever data you want to resolve with');
		})
	}

	// Just to demonstrate promise rejection upstream
	delete(id) {
		return Promise.reject(`Nope! It's Chuck Testa.`);
	}

	setupTimer() {
		// Make sure only one timer running at a time
		this.stopTimer()

		// Note the () => {} syntax. This automatically preserves "this" context, which the normal
		// function() {} syntax wouldn't.
		this._timer = setTimeout(() => {
			this.callAPI().then(() => {
				this.setupTimer()
			}).catch(() => {
				this.setupTimer()
			})
		}, this._timerDuration * 1000) // 2 seconds
	}

	stopTimer() {
		if (this._timer !== undefined) {
			clearTimeout(this._timer)
			this._timer = undefined
		}
	}

	callAPI() {
		// Since we want to separate concerns between timer, request, and processing, we'll wrap
		// this in another Promise and return that. Also makes testing straight forward.
		return new Promise((resolve, reject) => {
			// We're going to call a random number generation API for illustration purposes. 0-1
			request({
				uri: 'https://www.random.org/integers/?num=1&min=0&max=1&col=1&base=10&format=plain&rnd=new',
				method: 'GET',
				json: false
			}).then(data => {
				// Do something with the data
				this.processData(data)
				// Resolve the returned Promise so upstream logic can continue
				resolve()
			}).catch(error => {
				console.error(`${Date()} FooModule request`)
				console.error(error)
				// Reject the returned Promise so upstream logic can continue
				reject()
			})
		})
	}

	processData(data) {
		// This is rather ridiculous in this simple project, but if your app does a lot of asynchronous
		// data collection, aggregation, and/or processing you can benefit from a serialised queue because 
		// you may otherwise run into data consistency issues.
		this._queue.push(task => {
			// Just some bogus processing
			let result = bar.something((Number(data) === 1) ? true : false)

			// Trigger callbacks that were attached with whenThereIsNewData
			this._listeners.forEach(callback => {
				callback(result)
			})

			// You need to call task.done() when processing finishes. If you are doing more asynchronous
			// logic within the task, then call it when that logic is done (within callback functions or
			// promise then/catch).
			task.done()
		})
	}

}

module.exports = FooModule