const { consumer } = require("../dist/persevere-io");

function onReceive(topic, event) {
  console.info(topic, event);
}

function onInitialized(data) {
  console.info(data);
}

consumer({
  onReceive,
  initialize: {
    args: { message: "A consumer joined", pid: process.pid },
    onInitialized
  }
})
  .then(() => console.info(`${process.pid} ready`))
  .catch(console.error);
