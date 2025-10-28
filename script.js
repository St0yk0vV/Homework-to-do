const subjectInput = document.getElementById("subject");
const taskInput = document.getElementById("task");
const deadlineInput = document.getElementById("deadline");
const addBtn = document.getElementById("addBtn");
const exportBtn = document.getElementById("exportBtn");
const taskList = document.getElementById("taskList");

// Минимална дата = днес
const todayStr = new Date().toISOString().split("T")[0];
deadlineInput.min = todayStr;
deadlineInput.value = todayStr;

// Зареждане от localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
  taskList.innerHTML = "";
  tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = `${task.subject} – ${task.task} (Due: ${task.deadline})`;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔ Done";
    doneBtn.onclick = () => {
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    };

    li.appendChild(info);
    li.appendChild(doneBtn);
    taskList.appendChild(li);
  });
}

addBtn.addEventListener("click", () => {
  if (!subjectInput.value || !taskInput.value || !deadlineInput.value) {
    alert("Please fill in all fields!");
    return;
  }

  const newTask = {
    subject: subjectInput.value.trim(),
    task: taskInput.value.trim(),
    deadline: deadlineInput.value
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  subjectInput.value = "";
  taskInput.value = "";
  deadlineInput.value = todayStr;

  renderTasks();
});

// Помощна: CSV експорт (fallback, ако няма XLSX)
function exportCSV(filename = "homework-tasks.csv") {
  const headers = ["subject", "task", "deadline"];
  const rows = tasks.map(t => [t.subject, t.task, t.deadline]);

  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csv = [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 📊 Експорт към Excel (или CSV fallback)
exportBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("No tasks to export!");
    return;
  }

  try {
    if (typeof XLSX !== "undefined" && XLSX && XLSX.utils) {
      const worksheet = XLSX.utils.json_to_sheet(tasks);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Homework");
      XLSX.writeFile(workbook, "homework-tasks.xlsx");
    } else {
      // Fallback към CSV (Excel го отваря без проблем)
      alert("Excel library not loaded – exporting as CSV instead.");
      exportCSV();
    }
  } catch (err) {
    console.error(err);
    alert("Export failed. Exporting as CSV instead.");
    exportCSV();
  }
});

// Първоначално зареждане
renderTasks()
