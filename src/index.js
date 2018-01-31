import zeromq from 'zeromq';

function dealer(options) {
	const socket = zeromq.socket('dealer');
	socket.once('message', options.handler);
	return new Promise((resolve, reject) => {
		socket.bind(options.address, error => {
			if (error) reject(error);
			else {
				socket.send(JSON.stringify(options.data));
				resolve(socket);
			}
		});
	});
}

function subscriber(options) {
	const socket = zeromq.socket('sub');
	socket.on('message', options.handler);
	socket.connect(options.address);
	if (options.topics == null) socket.subscribe(''); // subscribe to all topics
	else {
		const topics = Array.isArray(options.topics) ? options.topics : [options.topics];
		topics.forEach(topic => {
			socket.subscribe(topic);
		});
	}
	return Promise.resolve(socket);
}

export function consumer(options) {
	const promises = [subscriber(options.subscriber)];
	if (options.dealer) {
		promises.push(dealer(options.dealer));
	}
	return Promise.all(promises);
}

function router(options) {
	const socket = zeromq.socket('router');
	socket.on('message', async (envelope, data) => {
		const result = options.handler(JSON.parse(data));
		function send(message) {
			socket.send([envelope, JSON.stringify(message)]);
		}
		if (result == null) send({});
		else if (typeof result.then=='function') send(await result);
		else send(result);
	});
	socket.connect(options.address);
}

function publisher(options) {
	const socket = zeromq.socket('pub');
	return new Promise((resolve, reject) => {
		socket.bind(options.address, error => {
			if (error) reject(error);
			else resolve(socket);
		});
	});
}

export function producer(options) {
	const promises = [publisher(options.publisher)];
	if (options.router) {
		promises.push(router(options.router));
	}
	return Promise.all(promises);
}