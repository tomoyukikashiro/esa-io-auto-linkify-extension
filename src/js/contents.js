import { Client } from './api'

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const { team, token, id, contents } = request
  if (team && token && id && contents) {
    const client = new Client(team, token)
    client.updatePost(id, contents)
    .then(() => {
      window.location.reload()
      callback()
    })
    .catch(e => {
      callback(e.messageForHuman)
    })
  }
  return true
});
