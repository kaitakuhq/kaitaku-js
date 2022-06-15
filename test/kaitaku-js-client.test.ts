import KaitakuJSClient from '../src/kaitaku-js-client'
import fetch from 'jest-fetch-mock'
import { Auth, NewHttpError } from '../src/types'

describe('Kaitaku JS Client', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  const basePath = 'https://api.kaitakuhq.com/v1'
  const token = 'pk.mytoken'

  it('Client is instantiable', () => {
    expect(new KaitakuJSClient(basePath, token)).toBeInstanceOf(KaitakuJSClient)
  })

  it('Throws if host name is empty', () => {
    expect(() => new KaitakuJSClient('', token)).toThrow()
  })

  it('Does not throw if token is empty', () => {
    expect(() => new KaitakuJSClient(basePath, '')).not.toThrow()
  })

  const getCli = (path = basePath, apiToken = token) => {
    return new KaitakuJSClient(path, apiToken)
  }

  const getParamHeaders = (overrideHeaders?: Record<string, string>) => {
    const h = new Headers()
    h.append('Authorization', 'Bearer ' + token)

    for (const val in overrideHeaders) {
      h.append(val, overrideHeaders[val])
    }
    return h
  }

  const okStatus = <T>(data?: T) => {
    return {
      status: 'OK',
      data: data
    }
  }

  describe('signup', () => {
    it('should call signup with payload', async () => {
      fetch.mockResponse(
        JSON.stringify(
          okStatus<Auth>({
            id: 'authid',
            name: 'name',
            token: 'token'
          })
        )
      )

      const cli = getCli()
      await cli.signUp('email', 'name')
      expect(fetch).toHaveBeenCalledWith(
        'https://api.kaitakuhq.com/v1/signup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'email',
            name: 'name'
          }),
          headers: getParamHeaders({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should catch already registered payload', async () => {
      fetch.mockResponse(
        JSON.stringify({
          status: 'Invalid Request',
          code: 'INVALID_EMAIL_ALREADY_REGISTERED',
          error: 'email already registered'
        })
      )

      try {
        const cli = getCli()
        await cli.signUp('email', 'name')
      } catch (err) {
        expect(err).toEqual(
          expect.objectContaining({
            appStatusCode: 'Invalid Request',
            responseCode: 'INVALID_EMAIL_ALREADY_REGISTERED',
            responseError: 'email already registered'
          })
        )
      }
    })
  })

  describe('login', () => {
    it('should call login with payload', async () => {
      fetch.mockResponse(
        JSON.stringify(
          okStatus<Auth>({
            id: 'authid',
            name: 'name',
            token: 'token'
          })
        )
      )

      const cli = getCli()
      await cli.login('email')
      expect(fetch).toHaveBeenCalledWith(
        'https://api.kaitakuhq.com/v1/signin',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'email'
          }),
          headers: getParamHeaders({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should catch invalid email', async () => {
      fetch.mockResponse(
        JSON.stringify({
          status: 'Invalid Request',
          code: 'INVALID_EMAIL_NOT_REGISTERED',
          error: "Email isn't registered"
        })
      )

      try {
        const cli = getCli()
        await cli.login('email')
      } catch (err) {
        expect(err).toEqual(
          expect.objectContaining({
            appStatusCode: 'Invalid Request',
            responseCode: 'INVALID_EMAIL_NOT_REGISTERED',
            responseError: "Email isn't registered"
          })
        )
      }
    })
  })
})
