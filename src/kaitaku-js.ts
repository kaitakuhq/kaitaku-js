import camelCase from 'lodash.camelcase'
import { fetchErrorToHttpError, NewHttpError, Auth } from './types'

export * from './types'

export default class KaitakuJSClient {
  // baseApiUrl for calling APIs
  private baseApiUrl: string

  // access token to access the API resources
  private token: string

  constructor(baseApiUrl: string, token: string) {
    if (!baseApiUrl) {
      throw new Error(`Base API URL is required`)
    }
    this.baseApiUrl = baseApiUrl
    this.token = token
    return this
  }

  // signUp is called when user signs up for the first time.
  public signUp = (email: string, name: string): Promise<Auth> => {
    const content = {
      email: email,
      name: name
    }
    return this.makeRequest<Auth>('/signup', {
      method: 'POST',
      body: JSON.stringify(content)
    })
  }

  // login is called when user logs in.
  public login = (email: string): Promise<Auth> => {
    const content = {
      email: email
    }
    return this.makeRequest<Auth>('/signin', {
      method: 'POST',
      body: JSON.stringify(content)
    })
  }

  private async makeRequest<T>(path: string, params?: RequestInit): Promise<T> {
    const url = this.baseApiUrl + path

    const token = this.token
    // append token to header
    if (token) {
      if (!params) {
        params = {}
      }
      if (!params.headers) {
        const header = new Headers()
        params.headers = header
      }
      if (!(params.headers as Headers).get('Authorization')) {
        ;(params.headers as Headers).append('Authorization', 'Bearer ' + token)
      }
      if (
        ((params?.method || '').toLowerCase() === 'post' ||
          (params?.method || '').toLocaleLowerCase() === 'put') &&
        !(params.headers as Headers).get('Content-Type')
      ) {
        ;(params.headers as Headers).append('Content-Type', 'application/json')
      }
    }

    return fetch(url, params)
      .then(res => res.json())
      .then(res => {
        if (res.status !== 'OK') {
          const err = NewHttpError(res)
          throw err
        }
        // @ts-ignore
        return this.camelizeKeys(res.data) as T
      })
      .catch(err => {
        if (err.appStatusCode) {
          // already converted & thrown in the few lines above
          throw err
        }
        throw fetchErrorToHttpError(err)
      })
  }

  private camelizeKeys(obj: Record<string, any>): Record<string, any> {
    if (Array.isArray(obj)) {
      return obj.map(v => this.camelizeKeys(v))
    } else if (obj != null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [camelCase(key)]: this.camelizeKeys(obj[key])
        }),
        {}
      )
    }
    return obj
  }
}
