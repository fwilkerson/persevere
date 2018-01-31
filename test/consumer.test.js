const { consumer } = require('../dist/persevere');
const config = require('./config');

const subscriber = {
	address: config.PUB_SUB_ADDRESS,
	handler(topic, event) {
		console.info(JSON.parse(event));
	}
};

const dealer = {
	address: config.DEALER_ROUTER_ADDRESS,
	data: {},
	handler(snapshot) {
		console.info('dealer?', JSON.parse(snapshot));
	}
};

consumer({ subscriber,dealer })
	.then(sockets => {})
	.catch(console.error);
