import test from 'ava';

const path = '../../app/foo';

import proxyquire from 'proxyquire';
proxyquire.noPreserveCache(); proxyquire.noCallThru();

test('starts', t => {

	// Mock the dependencies in the module
	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	// Create a new module instance that is now using our mocked dependencies.
	// Technically, you could argue that you should mock
	let foo = new module()

	// We're just interested that nothing fails. You can mock the inner time method if you want
	// by writing foo.setupTimer = function() {}
	let error
	try {
		foo.start()
	} catch (e) {
		error = e
	}

	t.is(error,undefined)

})

test('attaches a listener', t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	let callback = function(){}

	foo.whenThereIsNewData(callback)

	// Test that the listeners array is exactly what we expect after calling whenThereIsNewData
	t.deepEqual(foo._listeners, [
		callback
	])

})

// Note the 'async' keyword. If the function that you're testing returns a Promise, 
// this is required.
test('creates', async t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	let result = await foo.create({
		key: 'val'
	})

	t.is(result, 777)

})

test('updates', async t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	let result = await foo.update(1)

	t.is(result, 'whatever data you want to resolve with')

})

test('deletes', async t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	let result
	let error

	// In this case, we are expecting a rejection
	try {
		result = await foo.delete(1)
	} catch (e) {
		error = e
	}

	t.is(error, `Nope! It's Chuck Testa.`)

})

test('sets up timer', async t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()
	foo._timerDuration = 0.1

	foo.setupTimer()

	let firstTimer = foo._timer

	foo.setupTimer()

	let secondTimer = foo._timer

	t.not(firstTimer, secondTimer)

	foo.callAPI = function() {
		return Promise.resolve()
	}

	// We're going to do a bit of magic here. Can you figure out what and why?
	await new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, (foo._timerDuration + 0.1) * 1000)
	})

	t.not(secondTimer, foo._timer)
	t.not(foo._timer, undefined)

})

test('stops timer', t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	foo.setupTimer()
	foo.stopTimer()

	t.is(foo._timer, undefined)

})

test('calls API that resolves', async t => {

	let module = proxyquire(path, {
		'./bar.js' : {},
		'request-promise-native' : function() {
			return Promise.resolve(1)
		},
		'seq-queue' : {
			createQueue: function(){}
		}
	})

	let foo = new module()

	let test

	foo.processData = function() {
		test = 'ok'
	}

	await foo.callAPI()

	t.is(test, 'ok')

})

// Here's an exercise for you. Complete this test...
test('calls API that rejects', async t => {

	t.pass()

})

test('processes data', t => {

	let module = proxyquire(path, {
		'./bar.js' : {
			something(x) {
				return x
			}
		},
		'request-promise-native' : function(){},
		'seq-queue' : {
			createQueue: function() {
				return {
					push(action) {
						action({
							done(){}
						})
					}
				}
			}
		}
	})

	let foo = new module()

	let result

	foo._listeners = [function(data) {
		result = data
	}]

	foo.processData('0')

	t.is(result, false)	

})