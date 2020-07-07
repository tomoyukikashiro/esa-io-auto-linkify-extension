export const getCurrentPostId = () => {
  return new Promise((resolve => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      resolve(tabs[0].url.match(/\/posts\/(?<id>\d+)/).groups.id)
    })
  }))
}

export const getConfig = () => {
  return new Promise(resolve => {
    chrome.storage.sync.get(['team', 'token'], function(data) {
      const { team = '', token = '' } = data
      resolve({team, token})
    })
  })
}
