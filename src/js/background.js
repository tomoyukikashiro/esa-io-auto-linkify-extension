chrome.declarativeContent.onPageChanged.addRules([{
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {originAndPathMatches: '\\w+\.esa\.io\/posts\/\\d+' }
    })
  ],
  actions: [
    new chrome.declarativeContent.ShowPageAction()
  ]
}]);
