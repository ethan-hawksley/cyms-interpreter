"use strict";

export class Stack {
  #stack;

  constructor() {
    this.#stack = [];
  }

  push(value) {
    this.#stack.push(value);
  }

  pop() {
    if (this.#stack.length > 0) {
      return this.#stack.pop();
    }
    console.error("Popped empty stack");
    // By default, return 0.
    return 0;
  }
}
