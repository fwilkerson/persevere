import zeromq from "zeromq";

function dealer(options) {
  const socket = zeromq.socket("dealer");
  socket.once("message", data => {
    options.handler(JSON.parse(data));
  });
  return new Promise((resolve, reject) => {
    socket.bind(options.address, error => {
      if (error) {
        reject(error);
      } else {
        socket.send(JSON.stringify(options.data));
        resolve();
      }
    });
  });
}

function subscriber(options) {
  const socket = zeromq.socket("sub");
  socket.on("message", (topic, message) => {
    options.handler(topic.toString("utf8"), JSON.parse(message));
  });
  socket.connect(options.address);
  if (Array.isArray(options.topics)) {
    options.topics.forEach(topic => {
      if (typeof topic === "string") {
        socket.subscribe(topic);
      }
    });
  } else {
    socket.subscribe(options.topics || "");
  }
  return Promise.resolve();
}

export function consumer(options) {
  const promises = [subscriber(options.subscriber)];
  if (options.dealer) {
    promises.push(dealer(options.dealer));
  }
  return Promise.all(promises);
}

function router(options) {
  const socket = zeromq.socket("router");
  socket.on("message", async (envelope, data) => {
    const result = options.handler(JSON.parse(data));
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
  socket.connect(options.address);
  return Promise.resolve();
}

function publisher(options) {
  const socket = zeromq.socket("pub");
  return new Promise((resolve, reject) => {
    socket.bind(options.address, error => {
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
  const promises = [publisher(options.publisher)];
  if (options.router) {
    promises.push(router(options.router));
  }
  return Promise.all(promises).then(([publisher]) => publisher);
}
