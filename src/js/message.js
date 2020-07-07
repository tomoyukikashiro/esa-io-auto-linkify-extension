export class Message {
  #message
  constructor() {
    this.#message = document.getElementById('message')
    const options = document.getElementById('options')
    options.addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })
  }

  show(message) {
    this.#message.textContent = message
  }
}
