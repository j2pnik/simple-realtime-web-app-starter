// You might not need jQuery. Seriously: http://youmightnotneedjquery.com/

// Once DOM is loaded
function ready(fn) {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}
ready(function() {
	// Create websocket using socket.io
	var socket = io();

	// Reload page if there's a version mismatch
	socket.on('v', function(data) {
		if (data.v !== document.body.getAttribute('data-v')) {
			setTimeout(function() {
				// true should force cache refresh
				window.location.reload(true);
			}, 200);
		}
	});

	// Listen for data changes
	socket.on('foo_data', function(data) {
		// Replace HTML contents of data container
		var foo = document.getElementById('foo')
		if (foo) {
			foo.outerHTML = data.content;
		}
	});

	var handleClick = function(button) {
		var formData = new FormData(button.parentNode);
		formData.set('key2','val2');

		var post = {}

		for (var entry of formData.entries()) {
			post[entry[0]] = entry[1];
		}
		
		// Set up our request
		var request = new XMLHttpRequest();
		request.open(button.parentNode.getAttribute('method'), button.parentNode.getAttribute('action'), true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.onload = function() {
			if (request.status == 200) {
				// Success!
				console.log('Success!')
			} else {
				// Error
				console.log('Error!')
			}
			button.removeAttribute('disabled')
		};
		request.onerror = function() {
			// Error
			console.log('Error!')
			button.removeAttribute('disabled')
		};

		// Make sure we're not sending multiple requests by over-clicking
		button.setAttribute('disabled','disabled')

		request.send(JSON.stringify(post));
	}

	var createButton = document.getElementById('create-button')
	if (createButton) {
		createButton.addEventListener('click', function(event) {
			event.preventDefault();

			handleClick(createButton)
		});
	}

	var updateButton = document.getElementById('update-button')
	if (updateButton) {
		updateButton.addEventListener('click', function(event) {
			event.preventDefault();

			handleClick(updateButton)
		});
	}

	var deleteButton = document.getElementById('delete-button')
	if (deleteButton) {
		deleteButton.addEventListener('click', function(event) {
			event.preventDefault();

			handleClick(deleteButton)
		});
	}

});