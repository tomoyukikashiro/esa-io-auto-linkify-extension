import unified from 'unified'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import { linkify } from './markdown'
import { getCurrentPostId, getConfig } from './esa'
import { Message } from './message'
import { Client } from './api'

(async() => {
  const message = new Message()
  const config = await getConfig()
  if (!config.team || !config.token) {
    message.show('設定を行ってください')
    return
  }
  const currentPostId = await getCurrentPostId()
  const client = new Client(config.team, config.token)
  const { body_md: contents } = await client.getPost(currentPostId)

  message.show('更新中...')
  unified()
    .use(markdown)
    .use(linkify(config.team, client))
    .use(stringify)
    .process(contents, function (err, file) {
      if (err) {
        console.error(err)
        message.show('Markdownの解析に失敗しました。')
        return
      }
      requestUpdatePostMd({
        ...config,
        id: currentPostId,
        contents: String(file)
      })
    })

  function requestUpdatePostMd(config) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, config, function(errorMessage) {
        if (errorMessage) {
          message.show(errorMessage)
        } else {
          message.show('完了')
          setTimeout(() => {
            window.close()
          }, 1000)
        }
      });
    });
  }
})()


