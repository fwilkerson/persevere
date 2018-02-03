import zeromq from "zeromq";

function dealer({
  address = "127.0.0.1",
  initialize: { args, onInitialized, port = 4401 }
}) {
  const socket = zeromq.socket("dealer");
  socket.once("message", data => {
    onInitialized(JSON.parse(data));
  });
  return new Promise((resolve, reject) => {
    socket.bind(`tcp://${address}:${port}`, error => {
      if (error) {
        reject(error);
      } else {
        socket.send(JSON.stringify(args));
        resolve();
      }
    });
  });
}

function subscriber({
  address = "127.0.0.1",
  onReceive,
  port = 4400,
  topics = ""
}) {
  const socket = zeromq.socket("sub");
  socket.on("message", (topic, message) => {
    onReceive(topic.toString("utf8"), JSON.parse(message));
  });
  socket.connect(`tcp://${address}:${port}`);
  if (Array.isArray(topics)) {
    topics.forEach(topic => {
      if (typeof topic === "string") {
        socket.subscribe(topic);
      }
    });
  } else {
    socket.subscribe(topics);
  }
  return Promise.resolve();
}

export function consumer(options) {
  const promises = [subscriber(options)];
  if (options.initialize) {
    promises.push(dealer(options));
  }
  return Promise.all(promises);
}

function router({
  address = "127.0.0.1",
  initialize: { onInitialize, port = 4401 }
}) {
  const socket = zeromq.socket("router");
  socket.on("message", async (envelope, data) => {
    const result = onInitialize(JSON.parse(data));
    function send(message) {
      socket.send([envelope, JSON.stringify(message)]);
    }
    if (result === null || result === undefined) {
      send({});
    } else if (typeof result.then === "function") {
      send(await result);
    } else {
      send(result);
    }
  });
  socket.connect(`tcp://${address}:${port}`);
  return Promise.resolve();
}

function publisher({ address = "127.0.0.1", port = 4400 }) {
  const socket = zeromq.socket("pub");
  return new Promise((resolve, reject) => {
    socket.bind(`tcp://${address}:${port}`, error => {
      if (error) {
        reject(error);
      } else {
        resolve({
          send(topic, message) {
            socket.send([topic, JSON.stringify(message)]);
          }
        });
      }
    });
  });
}

export function producer(options) {
  const promises = [publisher(options)];
  if (options.initialize) {
    promises.push(router(options));
  }
  return Promise.all(promises).then(([publisher]) => publisher);
}
