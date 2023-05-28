class PubSubMock {
  static mockInstances = [];

  static clearAllMocks() {
    PubSubMock.mockInstances.forEach((instance) =>
      Object.getOwnPropertyNames(instance.constructor.prototype).forEach((method) => method.mockClear()),
    );

    PubSubMock.mockInstances.length = 0;
  }

  constructor() {
    Object.getOwnPropertyNames(this.constructor.prototype).forEach((method) => {
      jest.spyOn(this, method);
    });

    PubSubMock.mockInstances.push(this);
  }

  topic() {
    return this;
  }

  async publishMessage() {
    return null;
  }
}

module.exports.PubSub = PubSubMock;
