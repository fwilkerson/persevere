const { consumer } = require("../dist/persevere-io");
const config = require("./config");

const subscriber = {
  address: config.PUB_SUB_ADDRESS,
  handler(topic, event) {
    console.info(topic, event);
  }
};

const dealer = {
  address: config.DEALER_ROUTER_ADDRESS,
  data: { message: "A consumer joined", pid: process.pid },
  handler(data) {
    console.info(data);
  }
};

consumer({ subscriber, dealer })
  .then(() => console.info(`${process.pid} ready`))
  .catch(console.error);
