const { producer } = require('../dist/persevere');
const config = require('./config');

const publisher = { address: config.PUB_SUB_ADDRESS };

const router = {
	address: config.DEALER_ROUTER_ADDRESS,
	handler(data) {
		console.info('router?', data);
		return Promise.resolve([{ message: 'Hello' }, { message: 'Router' }]);
	}
};

producer({ publisher,router })
	.then(([publisher,router]) => {
		setInterval(() => {
			publisher.send(['topic', JSON.stringify({ message: 'World' })]);
		}, 1000);
	})
	.catch(console.error);