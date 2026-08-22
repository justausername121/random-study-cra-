// A simple persistent scratch notepad, floating overlay like the calculator.

let notesSaveTimer = null;

function openNotes() {
  renderNotes(true);
}

function closeNotes() {
  const el = document.getElementById("notes-modal-root");
  if (el) el.innerHTML = "";
}

function renderNotes(open) {
  const root = document.getElementById("notes-modal-root");
  if (!open) {
    if (root) root.innerHTML = "";
    return;
  }
  root.innerHTML = `
    <div class="modal-backdrop" id="notes-backdrop">
      <div class="notes-card pop-in" role="dialog" aria-label="Ghi chú">
        <div class="modal-header">
          <span class="modal-title">${icon("notes")} Ghi chú</span>
          <button class="icon-btn" id="notes-close">${icon("x")}</button>
        </div>
        <textarea id="notes-textarea" class="notes-textarea" placeholder="Viết ghi chú của bạn ở đây...">${S.notes || ""}</textarea>
        <div class="notes-footer">
          <span id="notes-status" class="notes-status">Đã lưu</span>
          <span class="notes-count" id="notes-count">${(S.notes || "").length} kí tự</span>
        </div>
      </div>
    </div>
  `;
  document.getElementById("notes-close").addEventListener("click", closeNotes);
  document.getElementById("notes-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "notes-backdrop") closeNotes();
  });
  const textarea = document.getElementById("notes-textarea");
  const status = document.getElementById("notes-status");
  const count = document.getElementById("notes-count");
  textarea.addEventListener("input", () => {
    status.textContent = "Đang lưu...";
    count.textContent = `${textarea.value.length} kí tự`;
    clearTimeout(notesSaveTimer);
    notesSaveTimer = setTimeout(() => {
      S.notes = textarea.value;
      saveState(S);
      status.textContent = "Đã lưu";
    }, 500);
  });
}
