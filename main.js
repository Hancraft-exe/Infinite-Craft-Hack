const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentData = null;
const pencilSize = 16; // tamaño área clic del lápiz
let pencilPositions = []; // para detectar clicks en lápices

// Input file
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".ic,.gzip,.gz";
document.body.insertBefore(fileInput, canvas);

// [+] Add Item button
const addButton = document.createElement("button");
addButton.textContent = "[+] Add Item";
addButton.style.display = "block";
addButton.style.margin = "8px 0";
addButton.style.backgroundColor = "#4CAF50";
addButton.style.color = "white";
addButton.style.border = "none";
addButton.style.padding = "8px 12px";
addButton.disabled = true;
document.body.insertBefore(addButton, canvas);

// Download button
const downloadButton = document.createElement("button");
downloadButton.textContent = "💾 Download .IC";
downloadButton.style.display = "block";
downloadButton.style.margin = "8px 0";
downloadButton.style.backgroundColor = "#2196F3";
downloadButton.style.color = "white";
downloadButton.style.border = "none";
downloadButton.style.padding = "8px 12px";
downloadButton.disabled = true;
document.body.insertBefore(downloadButton, canvas);

// Load file
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  try {
    const decompressed = pako.ungzip(uint8, { to: "string" });
    currentData = JSON.parse(decompressed);

    addButton.disabled = false;
    downloadButton.disabled = false;

    drawCanvasPreview();
  } catch (err) {
    alert("❌ Error reading file: " + err);
  }
});

// Draw canvas with pencil icons
function drawCanvasPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00FF00";
  ctx.font = "18px monospace";
  ctx.fillText("📂 Loaded JSON Items", 20, 30);

  if (!currentData || !currentData.items) return;

  ctx.font = "14px monospace";
  let y = 60;
  pencilPositions = [];

  currentData.items.forEach((item, index) => {
    // ID
    ctx.fillStyle = "#00FF00";
    ctx.fillText("ID: " + item.id, 20, y);

    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Text: " + item.text, 80, y);

    // Emoji
    ctx.fillStyle = "#FFD700";
    ctx.fillText("Emoji: " + item.emoji, 300, y);

    // Pencil icon
    ctx.fillStyle = "#FFA500";
    ctx.fillText("✏️", 500, y);
    pencilPositions[index] = { x: 500, y: y - 12, w: 20, h: 20 }; // área clic

    y += 24;
    if (y > canvas.height - 20) y = 60;
  });
}

// Detect click on pencil to edit
canvas.addEventListener("click", (e) => {
  if (!currentData || !currentData.items) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  pencilPositions.forEach((pos, index) => {
    if (
      clickX >= pos.x &&
      clickX <= pos.x + pos.w &&
      clickY >= pos.y &&
      clickY <= pos.y + pos.h
    ) {
      openEditModal(index);
    }
  });
});

// Next ID
function getNextId() {
  if (!currentData || !currentData.items) return 0;
  const ids = currentData.items.map(i => i.id);
  let newId = 0;
  while (ids.includes(newId)) newId++;
  return newId;
}

// Open Add/Edit Modal
function openEditModal(itemIndex = null) {
  const isEdit = itemIndex !== null;
  const item = isEdit ? currentData.items[itemIndex] : null;

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  const form = document.createElement("div");
  form.style.backgroundColor = "#111";
  form.style.color = "white";
  form.style.padding = "20px";
  form.style.border = "2px solid lime";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "10px";
  form.style.position = "relative"; // para la X
  modal.appendChild(form);

  // Close X
  const closeX = document.createElement("span");
  closeX.textContent = "✖";
  closeX.style.position = "absolute";
  closeX.style.top = "5px";
  closeX.style.right = "10px";
  closeX.style.cursor = "pointer";
  closeX.style.color = "red";
  closeX.style.fontSize = "18px";
  form.appendChild(closeX);
  closeX.addEventListener("click", () => document.body.removeChild(modal));

  // ID
  const idInput = document.createElement("input");
  idInput.type = "number";
  idInput.value = isEdit ? item.id : getNextId();
  idInput.placeholder = "ID";
  form.appendChild(idInput);

  // Text
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Text";
  textInput.value = isEdit ? item.text : "";
  form.appendChild(textInput);

  // Emoji
  const emojiInput = document.createElement("input");
  emojiInput.type = "text";
  emojiInput.placeholder = "Emoji";
  emojiInput.value = isEdit ? item.emoji : "";
  form.appendChild(emojiInput);

  // Add/Save button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = isEdit ? "Save Item" : "Add Item";
  submitBtn.style.backgroundColor = "#4CAF50";
  submitBtn.style.color = "white";
  submitBtn.style.border = "none";
  submitBtn.style.padding = "6px 10px";
  form.appendChild(submitBtn);

  submitBtn.addEventListener("click", () => {
    const newItem = {
      id: parseInt(idInput.value),
      text: textInput.value,
      emoji: emojiInput.value
    };

    if (!currentData.items) currentData.items = [];

    if (isEdit) {
      currentData.items[itemIndex] = newItem;
    } else {
      currentData.items.push(newItem);
    }

    drawCanvasPreview();
    document.body.removeChild(modal);
  });

  // Close modal if click outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}

// Download button
downloadButton.addEventListener("click", () => {
  if (!currentData) return;

  try {
    const jsonStr = JSON.stringify(currentData);
    const compressed = pako.gzip(jsonStr);

    const blob = new Blob([compressed], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "save.ic";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("❌ Error generating .IC: " + err);
  }
});

// [+] Add Item button opens modal
addButton.addEventListener("click", () => openEditModal(null));
