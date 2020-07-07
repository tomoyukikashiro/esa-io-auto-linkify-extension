import { getConfig } from './esa'

(async () => {
  const form = document.getElementById('form')
  const config = await getConfig()
  form.team.value = config.team
  form.token.value = config.token

  form.addEventListener('submit', e => {
    e.preventDefault()
    const target = e.currentTarget
    const team = target.team.value
    const token = target.token.value
    if (team && token) {
      chrome.storage.sync.set({team, token}, function() {
        window.alert('保存完了')
        window.close()
      })
    } else {
      window.alert('team と token は両方とも必須です。')
    }
  })
})()
