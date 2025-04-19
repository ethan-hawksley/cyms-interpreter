"use strict";

export class Queue {
  #head;
  #tail;

  constructor() {
    this.#head = null;
    this.#tail = null;
  }

  enqueue(value) {
    const node = new Node(value);

    if (!this.#head) {
      this.#head = node;
    } else {
      this.#tail.next = node;
    }
    this.#tail = node;
  }

  dequeue() {
    const node = this.#head;
    this.#head = node?.next ?? null;
    if (this.#head === null) {
      this.#tail = null;
    }

    return node?.value ?? 0;
  }

  clear() {
    this.#head = null;
    this.#tail = null;
  }
}

class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
