import { Bus } from '../src'
import { expect } from 'chai'
import * as amqp from 'amqplib'

describe('bus', function () {

  const url = process.env.BUS_URL || 'amqp://localhost'

  let bus: Bus
  let ch: amqp.Channel
  let conn: amqp.Connection

  before('prepare amqp', async function () {
    conn = await amqp.connect(url)
    ch = await conn.createChannel()
  })

  after('disconnect bus', function () {
    return bus && bus.disconnect()
  })

  after('close amqp connection', function () {
    return conn && conn.close()
  })

  it(`channel should be of type Channel`, async function () {
    bus = await Bus.connect(url)
    const channel = bus.channel()
    expect(channel.constructor.name).to.eq('Channel')
  })

  it(`channel should be of type ConfirmationChannel`, async function () {
    bus = await Bus.connect(url, {channelType: 'confirm'})
    const channel = bus.channel()
    expect(channel.constructor.name).to.eq('ConfirmChannel')
  })
})
