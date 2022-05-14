// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import humps from 'humps'
import { Comment, Project, fetchErrorToHttpError, NewHttpError } from './types'

export default class KaitakuJSClient {
  private baseApiUrl: string

  constructor(baseApiUrl: string) {
    if (!baseApiUrl) {
      throw new Error(`Base API URL is required`)
    }
    this.baseApiUrl = baseApiUrl
  }

  createComment = (
    projectId: string,
    categoryId: string,
    userId: string,
    comment: string,
    token: string
  ): Promise<Comment | null> => {
    if (!projectId || !categoryId || !token || !userId) {
      return new Promise(resolve => resolve(null))
    }
    return this.makeRequest<Comment | null>(
      `/project/${projectId}/category/${categoryId}/comment?user_id=` + userId,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          comment: comment,
          user_id: userId
        })
      }
    )
  }

  getProject = (projectId: string, token: string): Promise<Project | null> => {
    if (!projectId || !token) {
      return new Promise(resolve => resolve(null))
    }
    return this.makeRequest<Project | null>(`/project/${projectId}`, token)
  }

  listComment = (
    projectId: string,
    categoryId: string,
    userId: string,
    token: string
  ): Promise<Comment[]> => {
    if (!projectId || !categoryId || !token || !userId) {
      return new Promise(resolve => resolve([]))
    }
    return this.makeRequest<Comment[]>(
      `/project/${projectId}/category/${categoryId}/comment?user_id=` + userId,
      token
    )
  }

  updateComment = (
    projectId: string,
    categoryId: string,
    commentId: string,
    userId: string,
    upvoted: boolean,
    token: string
  ): Promise<Comment | null> => {
    if (!projectId || !categoryId || !token || !userId) {
      return new Promise(resolve => resolve(null))
    }
    return this.makeRequest<Comment | null>(
      `/project/${projectId}/category/${categoryId}/comment/${commentId}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify({
          upvoted: upvoted,
          user_id: userId
        })
      }
    )
  }

  private async makeRequest<T>(path: string, token: string, params?: RequestInit): Promise<T> {
    const url = this.baseApiUrl + path

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
    }

    return (
      fetch(url, params)
        .then(res => res.json())
        .then(res => {
          if (res.status !== 'OK') {
            const err = NewHttpError(res)
            throw err
          }
          return res.data as T
        })
        // @ts-ignore
        .then(res => this.snakeToCamel(res) as T)
        .catch(err => {
          if (err.appStatusCode) {
            // already converted & thrown in the few lines above
            throw err
          }
          throw fetchErrorToHttpError(err)
        })
    )
  }

  // snakeToCamel converts REST API's snake case variables like owner_id to JS standard came case variables like ownerId
  private snakeToCamel = (obj: object) => humps.camelizeKeys(obj)
}
