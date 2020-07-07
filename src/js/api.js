
const request = async (url, token, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  const res = await fetch(url, {...defaultOptions, ...options})
  if (!res.ok) {
    throw new ClientError(res.status)
  }
  return res.json()
}

export class ClientError extends Error {
  get messageForHuman() {
    const message = {
      [Client.STATUS_OVER_LIMIT]: '仕事しすぎです。少しコーヒー休憩を。',
      [Client.STATUS_INSUFFICIENT_PERMISSION]: 'TOKENの権限足りないみたい。'
    }
    return message[this.message] || 'APIで、なんかエラーになった。'
  }
}

export class Client {
  #team
  #token
  #baseUrl = 'https://api.esa.io/v1/teams'
  static STATUS_OVER_LIMIT = 429
  static STATUS_INSUFFICIENT_PERMISSION = 403

  constructor(team, token) {
    this.#team = team
    this.#token = token
  }

  getPost(id) {
    const url = new URL(`${this.#baseUrl}/${this.#team}/posts/${id}`)
    return request(url, this.#token)
  }

  updatePost(id, md) {
    const options = {
      method: 'PATCH',
      body: JSON.stringify({ post: { body_md: md, message: "Updated by esa-auto-linkify-extension."} })
    }
    const url = new URL(`${this.#baseUrl}/${this.#team}/posts/${id}`)
    return request(url, this.#token, options)
  }

  search(ids) {
    const url = new URL(`${this.#baseUrl}/${this.#team}/posts`)
    const query = ids.map(id => `number:${id}`).join(' or ')
    url.searchParams.append('q', query)
    return request(url, this.#token)
  }
}
