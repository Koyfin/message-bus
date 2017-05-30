export interface Adapter {
  connect (options): Promise<void>
  disconnect (): Promise<void>
  publish (key: string, ex: string, message: object): Promise<any>
  listen (key: string, handler: any): Promise<any>
  ack (msg): void
  request (options): Promise<any>
}
