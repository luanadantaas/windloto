// Custom jsdom environment that exposes Node 20 native fetch globals required by MSW v2
const { default: Environment } = require('jest-environment-jsdom')

class CustomEnvironment extends Environment {
  async setup() {
    await super.setup()
    Object.assign(this.global, {
      fetch: fetch,
      Request: Request,
      Response: Response,
      Headers: Headers,
      TextEncoder: TextEncoder,
      TextDecoder: TextDecoder,
    })
  }
}

module.exports = CustomEnvironment
