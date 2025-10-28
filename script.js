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

function onlyDate(d) {
  const nd = new Date(d);
  nd.setHours(0,0,0,0);
  return nd;
}

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

// 📊 Експорт към Excel
exportBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("No tasks to export!");
    return;
  }

  // Преобразуваме масива в таблица
  const worksheet = XLSX.utils.json_to_sheet(tasks);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Homework");

  // Сваляме Excel файл
  XLSX.writeFile(workbook, "homework-tasks.xlsx");
});

// Първоначално зареждане
renderTasks();
