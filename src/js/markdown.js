import visit from 'unist-util-visit'

export const linkify = (team, client) => () => async (ast) => {
  const urlRegex = new RegExp(String.raw`https:\/\/${team}\.esa\.io\/posts\/(?<id>\d+)(?<hash>#[a-zA-Z\d%]+)?`)
  let bareLinkIds = new Set()
  visit(ast, 'link', findLinks)
  const { posts: linkedPosts } = await client.search([...bareLinkIds])
  visit(ast, 'link', replaceLink)

  function replaceLink(node) {
    const id = getOurBareLinkId(node)
    if (id) {
      const post = linkedPosts.find(post => post.number === id)
      node.children[0].value = post.full_name
    }
  }

  // 検索するURLを探す
  function findLinks(node) {
    const id = getOurBareLinkId(node)
    if (id) {
      bareLinkIds.add(id)
    }
  }

  // [xx](http://xxx) 形式になっていないteamのlinkの記事id
  function getOurBareLinkId(node) {
    const notLinkFormat = node.url === node.children[0].value
    const hit = node.url.match(urlRegex)
    if (notLinkFormat && hit?.groups?.id) {
      return parseInt(hit.groups.id, 10)
    }
  }
}


