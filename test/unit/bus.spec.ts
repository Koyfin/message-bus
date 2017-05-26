import {stub} from 'sinon'
import {expect} from 'chai'
import {Bus, Adapter} from '../../src/bus'

describe('bus', function () {

  class FakeAdapter implements Adapter {

    public connect
    public disconnect
    public publisher
    public subscriber

    constructor () {
      this.connect = stub().resolves()
      this.disconnect = stub().resolves()
      this.publisher = stub().resolves()
      this.subscriber = stub().resolves()
    }

  }

  it('should connect and disconnect', async function () {
    const adapter = new FakeAdapter()
    const bus = new Bus({}, adapter)
    await bus.connect()
    await bus.disconnect()
    expect(adapter.connect.calledOnce).eq(true)
    expect(adapter.disconnect.calledOnce).eq(true)
  })

})
