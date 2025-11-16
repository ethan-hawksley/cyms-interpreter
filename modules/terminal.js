'use strict';

export class Terminal {
  #element;
  #maxEntries;

  constructor() {
    this.#element = document.getElementById('terminal');
    this.#maxEntries = 100;
  }

  clear() {
    this.#element.replaceChildren();
  }

  log(message) {
    this.#print(message, 'log-entry');
  }

  error(message) {
    this.#print(message, 'error-entry');
  }

  #print(message, type) {
    const isScrolledToBottom =
      this.#element.scrollHeight - this.#element.clientHeight <=
      this.#element.scrollTop + 1;

    if (this.#element.childElementCount >= this.#maxEntries) {
      this.#element.removeChild(this.#element.firstChild);
    }
    const entry = document.createElement('li');
    entry.classList.add('entry', type);
    entry.textContent = message;
    this.#element.appendChild(entry);

    if (isScrolledToBottom) {
      this.#element.scrollTop =
        this.#element.scrollHeight - this.#element.clientHeight;
    }
  }
}
