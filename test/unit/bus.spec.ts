import {stub} from 'sinon'
import {expect} from 'chai'
import {Bus} from '../../src/bus'
import PublisherBuilder from '../../src/publisherBuilder'
import SubscriberBuilder from '../../src/subscriberBuilder'
import {EventEmitter} from 'events'

describe('bus', function () {

  it('should connect and disconnect', async function () {
    const adapter = getAdapter()
    const bus = new Bus({url: 'some', adapter})
    await bus.connect()
    await bus.disconnect()
    expect(adapter.connect.calledOnce).eq(true)
    expect(adapter.disconnect.calledOnce).eq(true)
  })

  it('publisher should create publisher', async function () {
    const topic = 'test_topic'
    const adapter = getAdapter()
    const bus = new Bus({url: 'some', adapter})
    await bus.connect()

    const publisher = await bus.publisher(topic)

    expect(publisher instanceof PublisherBuilder).eq(true)
  })

  it('subscriber should create subscriberBuilder', async function () {
    const topic = 'test_topic'
    const adapter = getAdapter()
    const bus = new Bus({url: 'some', adapter})
    await bus.connect()

    const publisher = await bus.subscriber(topic)

    expect(publisher instanceof SubscriberBuilder).eq(true)
  })

})

function getAdapter () {
  return new FakeAdapter()
}

class FakeAdapter extends EventEmitter {

  connect = stub().resolves()
  disconnect = stub().resolves()
  publish = stub().resolves()
  listen = stub().resolves()
  ack = stub()
  nack = stub()
  request = stub().resolves()
  respond = stub().resolves()

  constructor () {
    super()
  }
}
