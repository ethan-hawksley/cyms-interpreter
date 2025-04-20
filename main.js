"use strict";
import { Interpreter } from "./modules/interpreter.js";

const cymsCode = document.getElementById("cyms-code");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const saveButton = document.getElementById("save");
const loadButton = document.getElementById("load");
const loadInput = document.getElementById("load-input");
const showExamplesButton = document.getElementById("show-examples");
const examplesDialog = document.getElementById("examples");
const closeExamplesButton = document.getElementById("close-examples");
const loadExampleButtons = document.getElementsByClassName("load-example");
const interpreter = new Interpreter();

stopButton.disabled = true;

startButton.addEventListener("click", () => {
  stopButton.disabled = false;
  startButton.disabled = true;
  cymsCode.disabled = true;
  interpreter.run(cymsCode.value);
});

stopButton.addEventListener("click", () => {
  stopButton.disabled = true;
  startButton.disabled = false;
  cymsCode.disabled = false;
  interpreter.stop();
});

saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  const content = cymsCode.value;
  const file = new Blob([content], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = "program.cyms";
  link.click();
  URL.revokeObjectURL(link.href);
});

loadButton.addEventListener("click", () => {
  loadInput.click();
});

loadInput.addEventListener("change", () => {
  const file = loadInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // Set code textbox to the content of the file.
      cymsCode.value = reader.result;
    };
    reader.readAsText(file);
  }
});

showExamplesButton.addEventListener("click", () => {
  console.log("opening");
  examplesDialog.showModal();
});

closeExamplesButton.addEventListener("click", () => {
  console.log("closing");
  examplesDialog.close();
});

for (let i = 0; i < loadExampleButtons.length; i++) {
  loadExampleButtons[i].addEventListener("click", async () => {
    // Fetch from https://hawksley.dev/cyms-interpreter/examples/file.cyms
    const promise = fetch(
      "./examples/" + loadExampleButtons[i].dataset.fileName + ".cyms",
    );
    promise.then((response) => {
      response.text().then((text) => {
        // Set code box to the 
        cymsCode.value = text;
      });
    });
    examplesDialog.close();
  });
}
