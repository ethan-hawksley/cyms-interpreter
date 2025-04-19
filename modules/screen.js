"use strict";

export class Screen {
  #screen;
  #ctx;

  constructor() {
    this.#screen = document.getElementById("screen");
    this.#ctx = this.#screen.getContext("2d");

    this.#ctx.fillStyle = "black";
    this.#ctx.fillRect(0, 0, 255, 144);
  }

  clear() {
    this.#ctx.fillStyle = "black";
    this.#ctx.fillRect(0, 0, 255, 144);
  }

  draw(x, y, width, height, colour) {
    this.#ctx.fillStyle = colour;
    this.#ctx.fillRect(x, y, width, height);
  }
}
