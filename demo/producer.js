const { producer } = require('../dist/persevere');
const config = require('./config');

const publisher = { address: config.PUB_SUB_ADDRESS };

const router = {
	address: config.DEALER_ROUTER_ADDRESS,
	handler(data) {
		console.info(data);
		return Promise.resolve([
			{ message: `Hello ${data.pid}` },
			{ message: `I am ${process.pid}` }
		]);
	}
};

producer({ publisher,router })
	.then(publisher => {
		let increment = 0;
		setInterval(() => {
			const id = ++increment;
			console.info(`Publishing message #${id}`);
			publisher.send('Hello', { message: 'World', id });
		}, 1250);
	})
	.catch(console.error);