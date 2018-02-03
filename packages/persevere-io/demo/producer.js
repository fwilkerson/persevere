const { producer } = require("../dist/persevere-io");

function onInitialize(data) {
  console.info(data);
  return Promise.resolve([
    { message: `Hello ${data.pid}` },
    { message: `I am ${process.pid}` }
  ]);
}

producer({ initialize: { onInitialize } })
  .then(publisher => {
    let increment = 0;
    setInterval(() => {
      const id = ++increment;
      console.info(`Publishing message #${id}`);
      publisher.send("Hello", { message: "World", id });
    }, 1250);
  })
  .catch(console.error);
