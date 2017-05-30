import {stub} from 'sinon'
import {expect} from 'chai'
import {Bus} from '../../src/bus'
import PublisherBuilder from '../../src/publisherBuilder'

describe('bus', function () {

  it('should connect and disconnect', async function () {
    const adapter = getAdapter()
    const bus = new Bus(adapter)
    await bus.connect()
    await bus.disconnect()
    expect(adapter.connect.calledOnce).eq(true)
    expect(adapter.disconnect.calledOnce).eq(true)
  })

  it('publisher should create publisher', async function () {
    const topic = 'test_topic'
    const adapter = getAdapter()
    const bus = new Bus(adapter)
    await bus.connect()

    const publisher = await bus.publisher(topic)

    expect(publisher instanceof PublisherBuilder).eq(true)
  })

})

function getAdapter () {
  return {
    connect: stub().resolves(),
    disconnect: stub().resolves(),
    publish: stub().resolves(),
  }
}
