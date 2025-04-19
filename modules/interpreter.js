"use strict";
import { Terminal } from "./terminal.js";
import { Stack } from "./stack.js";
import { Queue } from "./queue.js";
import { Screen } from "./screen.js";

export class Interpreter {
  #DEBUG;
  #terminal;
  #active;
  #code;
  #mem;
  #pc;
  #overflow;
  #memOffset;
  #timeOffset;
  #indexOffset;
  #callStack;
  #stack;
  #inputQueue;
  #screen;

  constructor() {
    this.#DEBUG = false;
    this.#active = false;
    this.#terminal = new Terminal();
    this.#memOffset = 2;
    this.#timeOffset = -2;
    this.#indexOffset = -1;
    this.#screen = new Screen();
    this.#inputQueue = new Queue();
    document.addEventListener("keydown", (event) => {
      if (this.#active) {
        this.#inputQueue.enqueue(event.key.charCodeAt(0));
      }
    });
  }

  run(code) {
    this.#terminal.clear();
    this.#callStack = new Stack();
    this.#stack = new Stack();
    this.#inputQueue.clear();

    this.#screen.clear();
    this.#active = true;
    const preprocessedCode = code
      .split("\n") // split into each codeline
      .map((i) => i.split("//")[0].trim()) // remove anything after //
      .filter((i) => i !== "") // remove blank lines
      .map((i) => i.split(" ")); // turn into array of opcode and operands
    // time, index, and 4096 normal addresses
    // +2 offset applied to each access of the array
    this.#code = [];
    let lineNumber = 0;
    let postprocessedCode = [];
    // time and index constants
    let constants = { time: this.#timeOffset, index: this.#indexOffset };
    // Find all labels and constants
    preprocessedCode.forEach((line) => {
      // If starts with @
      if (line[0][0] === "@") {
        if (line.length !== 1) {
          this.#terminal.error("Invalid label expression");
          this.#active = false;
        }
        constants[line[0]] = lineNumber.toString();
        // If a constant
      } else if (line[0] === ".const") {
        if (line.length !== 3) {
          this.#terminal.error("Invalid .const expression");
          this.#active = false;
        }

        // All constants are strings
        constants[line[1]] = line[2];
      } else {
        // Increment so the label points to the correct line number
        postprocessedCode.push(line);
        lineNumber++;
      }
    });

    postprocessedCode.forEach((line) => {
      let instruction = [line[0]];
      line.slice(1).map((operand) => {
        // Handle constants
        let cleanOperand = operand.replace(/[#$]/g, "");
        if (cleanOperand in constants) {
          cleanOperand = constants[cleanOperand];
        }
        // How many times to redirect
        cleanOperand += "$".repeat((operand.match(/[$]/g) || []).length);
        // If indexed or not
        cleanOperand += "#".repeat((operand.match(/#/g) || []).length);
        instruction.push(cleanOperand);
      });
      this.#code.push(instruction);
    });

    if (this.#DEBUG) console.log(this.#code);

    // 2 registers, 4096 regular memory
    this.#mem = new Array(4098).fill(0);
    this.#pc = 0;
    this.#overflow = false;
    if (this.#active && this.#code.length > 0) {
      this.#terminal.log("Started");
      // Run a cycle each frame
      requestAnimationFrame(() => this.#cycle());
    } else {
      this.#terminate();
    }
  }

  stop() {
    this.#terminal.log("Stopped");
    this.#terminate();
  }

  #terminate() {
    this.#active = false;
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
    document.getElementById("cyms-code").disabled = false;
  }

  #cycle() {
    if (this.#DEBUG) console.log(this.#mem);
    const opcode = this.#code[this.#pc][0].toUpperCase();
    const preprocessedOperands = this.#code[this.#pc].slice(1);
    this.#mem[this.#timeOffset + this.#memOffset]++;
    this.#pc++;

    let operands = [];
    preprocessedOperands.forEach((operand) => {
      // How many times to redirect
      const redirections = (operand.match(/[$]/g) || []).length;
      // If indexed or not
      const indexed = (operand.match(/#/) || []).length >= 1;

      // Remove $ and #, then parse as int
      let processedOperand = parseInt(operand.replace(/[#$]/g, ""), 10);

      if (indexed) {
        // Add index register
        processedOperand += this.#mem[this.#indexOffset + this.#memOffset];
      }

      for (let i = 0; i < redirections; i++) {
        // Set value to what is held at the address
        processedOperand = this.#mem[processedOperand + this.#memOffset];
      }

      operands.push(processedOperand);
    });

    switch (opcode) {
      case "NOP":
      case "LOG": // LOG is unimplemented
        break;
      case "CPY":
        this.#cpy(operands);
        break;
      case "SWP":
        this.#swp(operands);
        break;
      case "ADD":
        this.#add(operands);
        break;
      case "SUB":
        this.#sub(operands);
        break;
      case "INC":
        this.#inc(operands);
        break;
      case "DEC":
        this.#dec(operands);
        break;
      case "MUL":
        this.#mul(operands);
        break;
      case "DIV":
        this.#div(operands);
        break;
      case "MOD":
        this.#mod(operands);
        break;
      case "AND":
        this.#and(operands);
        break;
      case "ORR":
        this.#orr(operands);
        break;
      case "XOR":
        this.#xor(operands);
        break;
      case "NOT":
        this.#not(operands);
        break;
      case "JMP":
        this.#jmp(operands);
        break;
      case "BRG":
        this.#brg(operands);
        break;
      case "BNG":
        this.#bng(operands);
        break;
      case "BRE":
        this.#bre(operands);
        break;
      case "BNE":
        this.#bne(operands);
        break;
      case "BRL":
        this.#brl(operands);
        break;
      case "BNL":
        this.#bnl(operands);
        break;
      case "BRO":
        this.#bro(operands);
        break;
      case "BNO":
        this.#bno(operands);
        break;
      case "JSR":
        this.#jsr(operands);
        break;
      case "RTS":
        this.#rts();
        break;
      case "PSH":
        this.#psh(operands);
        break;
      case "POP":
        this.#pop(operands);
        break;
      case "RNG":
        this.#rng(operands);
        break;
      case "INP":
        this.#inp(operands);
        break;
      case "OUT":
        this.#out(operands);
        break;
      case "DRW":
        this.#drw(operands);
        break;
      case "SFX":
        this.#sfx(operands);
        break;
      case "HLT":
        this.#hlt();
        break;
      default:
        this.#terminal.error('Unknown instruction "' + opcode + '"');
        this.#terminate();
        break;
    }

    if (this.#pc >= this.#code.length) {
      this.#terminal.log("Finished");
      this.#terminate();
    }
    if (this.#active) {
      requestAnimationFrame(() => this.#cycle());
    }
  }

  #cpy(operands) {
    this.#mem[operands[1] + this.#memOffset] = operands[0];
  }

  #swp(operands) {
    const temp = this.#mem[operands[1] + this.#memOffset];
    this.#mem[operands[1] + this.#memOffset] =
      this.#mem[operands[0] + this.#memOffset];
    this.#mem[operands[0] + this.#memOffset] = temp;
  }

  #add(operands) {
    this.#mem[operands[2] + this.#memOffset] = operands[0] + operands[1];
  }

  #sub(operands) {
    this.#mem[operands[2] + this.#memOffset] = operands[0] - operands[1];
  }

  #inc(operands) {
    this.#mem[operands[0] + this.#memOffset]++;
  }

  #dec(operands) {
    this.#mem[operands[0] + this.#memOffset]--;
  }

  #mul(operands) {
    this.#mem[operands[2] + this.#memOffset] = operands[0] * operands[1];
  }

  #div(operands) {
    if (operands[1] === 0) {
      // Store 0 when dividing by 0
      this.#overflow = true;
      this.#mem[operands[2] + this.#memOffset] = 0;
    } else {
      this.#overflow = false;
      this.#mem[operands[2] + this.#memOffset] = Math.floor(
        operands[0] / operands[1],
      );
    }
  }

  #mod(operands) {
    this.#mem[operands[2] + this.#memOffset] = operands[0] % operands[1];
  }

  #and(operands) {
    // A value >= 1 is considered truthy
    this.#mem[operands[2] + this.#memOffset] =
      operands[0] >= 1 && operands[1] >= 1;
  }

  #orr(operands) {
    this.#mem[operands[2] + this.#memOffset] =
      operands[0] >= 1 || operands[1] >= 1;
  }

  #xor(operands) {
    this.#mem[operands[2] + this.#memOffset] =
      operands[0] >= 1 ? operands[1] < 1 : operands[1] >= 1;
  }

  #not(operands) {
    this.#mem[operands[1] + this.#memOffset] = operands[0] < 1;
  }

  #jmp(operands) {
    this.#pc = operands[0];
  }

  #brg(operands) {
    if (operands[1] > operands[2]) {
      this.#pc = operands[0];
    }
  }

  #bng(operands) {
    if (operands[1] <= operands[2]) {
      this.#pc = operands[0];
    }
  }

  #bre(operands) {
    if (operands[1] === operands[2]) {
      this.#pc = operands[0];
    }
  }

  #bne(operands) {
    if (operands[1] !== operands[2]) {
      this.#pc = operands[0];
    }
  }

  #brl(operands) {
    if (operands[1] < operands[2]) {
      this.#pc = operands[0];
    }
  }

  #bnl(operands) {
    if (operands[1] >= operands[2]) {
      this.#pc = operands[0];
    }
  }

  #bro(operands) {
    if (this.#overflow) {
      this.#pc = operands[0];
    }
  }

  #bno(operands) {
    if (!this.#overflow) {
      this.#pc = operands[0];
    }
  }

  #jsr(operands) {
    this.#callStack.push(this.#pc);
    this.#pc = operands[0];
  }

  #rts() {
    this.#pc = this.#callStack.pop();
  }

  #psh(operands) {
    this.#stack.push(operands[0]);
  }

  #pop(operands) {
    this.#mem[operands[0] + this.#memOffset] = this.#stack.pop();
  }

  #rng(operands) {
    // Store a random number between min and max, inclusive
    this.#mem[operands[2] + this.#memOffset] = Math.floor(
      Math.random() * (operands[1] - operands[0] + 1) + operands[0],
    );
  }

  #inp(operands) {
    // Stores 0 if there are no inputs to process
    this.#mem[operands[0] + this.#memOffset] = this.#inputQueue.dequeue();
  }

  #out(operands) {
    this.#terminal.log(operands[0]);
  }

  #drw(operands) {
    let colour = "";
    // Select the correct colour
    switch (operands[4]) {
      case 0:
        colour = "#FFFFFF";
        break;
      case 1:
        colour = "#9D9D97";
        break;
      case 2:
        colour = "#474F52";
        break;
      case 3:
        colour = "#000000";
        break;
      case 4:
        colour = "#835432";
        break;
      case 5:
        colour = "#B02E26";
        break;
      case 6:
        colour = "#F9801D";
        break;
      case 7:
        colour = "#FED83D";
        break;
      case 8:
        colour = "#80C71F";
        break;
      case 9:
        colour = "#5E7C16";
        break;
      case 10:
        colour = "#169C9C";
        break;
      case 11:
        colour = "#3AB3DA";
        break;
      case 12:
        colour = "#3C44AA";
        break;
      case 13:
        colour = "#8932B8";
        break;
      case 14:
        colour = "#C74EBD";
        break;
      case 15:
        colour = "#F38BAA";
        break;
      default:
        this.#terminal.error("Invalid colour code " + operands[4]);
        this.#terminate();
        break;
    }
    this.#screen.draw(
      operands[0],
      operands[1],
      operands[2],
      operands[3],
      colour,
    );
  }

  #sfx(operands) {
    // Play tone for 400ms at provided frequency
    let audioContext = new AudioContext();
    let oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = operands[0] * 50 + 50;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, 400);
  }

  #hlt() {
    this.#terminal.log("Halted");
    this.#terminate();
  }
}
