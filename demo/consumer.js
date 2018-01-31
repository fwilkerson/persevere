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
	data: { message: 'A consumer joined', pid: process.pid },
	handler(snapshot) {
		console.info(JSON.parse(snapshot));
	}
};

consumer({ subscriber,dealer })
	.then(sockets => {})
	.catch(console.error);
