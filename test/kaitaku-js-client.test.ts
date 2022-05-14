import KaitakuJSClient from '../src/kaitaku-js-client'
import fetch from 'jest-fetch-mock'

describe('Kaitaku JS Client', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('Client is instantiable', () => {
    expect(new KaitakuJSClient('url')).toBeInstanceOf(KaitakuJSClient)
  })

  it('Throws if host name is empty', () => {
    expect(() => new KaitakuJSClient('')).toThrow()
  })

  it('should call get project', () => {
    expect(async () => {
      const cli = new KaitakuJSClient('https://exmaple.com')
      await cli.getProject('projectId', 'token')
    }).toThrow()
    // try {
    //   const cli = new KaitakuJSClient('https://exmaple.com')
    //   cli.getProject('projectId', 'token')
    // } catch (err) {
    //   console.log("ERR", err)
    // }

    // expect(fetch).toHaveBeenCalled()
  })
})
