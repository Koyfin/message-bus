import * as amqplib from 'amqplib'
import {stub} from 'sinon'
import {expect} from 'chai'
import {RabbitMQAdapter} from '../../src/rabbitmq.adapter'

describe('RabbitMQAdapter', function () {

  let connection
  before('stub amqplib', function () {
    connection = {
      createChannel: stub().resolves({}),
      close: stub().resolves(),
    }
    stub(amqplib, 'connect').resolves(connection)
  })

  it('connect should call amqplib.connect and connection.createChannel', async function () {
    const rabbitMQAdapter = new RabbitMQAdapter({url: ''})

    await rabbitMQAdapter.connect()

    expect((amqplib.connect as any).calledOnce).eq(true)
    expect(connection.createChannel.calledOnce).eq(true)
  })

  it('disconnect should call connection.close', async function () {
    const rabbitMQAdapter = new RabbitMQAdapter({url: ''})

    await rabbitMQAdapter.connect()
    await rabbitMQAdapter.disconnect()

    expect(connection.close.calledOnce).eq(true)
  })

})
