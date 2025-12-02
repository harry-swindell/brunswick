const calendar = document.getElementById('calendar');
const header = document.getElementById('month-header');
const dayLabels = document.getElementById('day-labels');

// Track current view year & month
let currentDate = new Date();
let viewYear = currentDate.getFullYear();
let viewMonth = currentDate.getMonth(); // 0 = Jan

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Create weekday labels once
weekdays.forEach(day => {
  const label = document.createElement('div');
  label.textContent = day;
  dayLabels.appendChild(label);
});

// --- MAIN CALENDAR RENDER FUNCTION ---
function renderCalendar(year, month) {
  calendar.innerHTML = "";

  header.textContent = `${monthNames[month]} ${year}`;

  const today = new Date();
  const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill blanks before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    const blank = document.createElement('div');
    calendar.appendChild(blank);
  }

  // Fill days
  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.textContent = d;

    // Default: past/today/future coloring
    if (isCurrentMonth) {
      if (d < today.getDate()) day.classList.add('past');
      else if (d === today.getDate()) day.classList.add('today');
      else day.classList.add('future');
    } else {
      day.classList.add('future');
    }

    // ---------- HIGHLIGHT ONLY IF LETTER-SUFFIX IMAGES EXIST ----------
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    let marked = false;

    letters.forEach(letter => {
      const img = new Image();
      img.onload = () => {
        if (!marked) {
          marked = true;
          day.classList.add("has-image");
        }
      };
      img.src = `assets/${year}/${month + 1}/day${d}${letter}.jpg`;
    });
    // -----------------------------------------------------------------

    day.addEventListener('click', () => openIframe(year, month, d));

    calendar.appendChild(day);
  }
}

// --- IFRAME POPUP / MULTI-IMAGE POPUP ---
let currentIframe = null;

function openIframe(year, month, day) {
  if (currentIframe) currentIframe.remove();

  const popup = document.createElement('div');
  popup.classList.add('iframe-popup');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('iframe-header');
  headerDiv.innerHTML = `<span>Events for ${month + 1}/${day}/${year}</span>`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.onclick = () => popup.remove();

  headerDiv.appendChild(closeBtn);
  popup.appendChild(headerDiv);

  document.body.appendChild(popup);
  makeDraggable(popup, headerDiv);
  currentIframe = popup;

  /* ---- MULTIPLE IMAGE SUPPORT ---- */

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const images = [];

  function renderImages() {
    while (popup.children.length > 1) {
      popup.removeChild(popup.lastChild);
    }

    if (images.length === 0) {
      const msg = document.createElement('div');
      msg.style.padding = "1.5em";
      msg.style.textAlign = "center";
      msg.style.fontFamily = "sans-serif";
      msg.innerHTML = `<p>No events posted.</p>`;
      popup.appendChild(msg);
      return;
    }

    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      popup.appendChild(img);
    });
  }

  // Always check base image
  const basePath = `assets/${year}/${month + 1}/day${day}.jpg`;
  const baseProbe = new Image();
  baseProbe.onload = () => { images.push(basePath); renderImages(); };
  baseProbe.src = basePath;

  // Check lettered images (dayXa, dayXb …)
  letters.forEach(letter => {
    const path = `assets/${year}/${month + 1}/day${day}${letter}.jpg`;
    const probe = new Image();
    probe.onload = () => { images.push(path); renderImages(); };
    probe.src = path;
  });
}


// --- DRAGGABLE POPUP ---
function makeDraggable(element, handle) {
  let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    offsetX = mouseX - e.clientX;
    offsetY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    element.style.top = (element.offsetTop - offsetY) + "px";
    element.style.left = (element.offsetLeft - offsetX) + "px";
    element.style.transform = "";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// --- MONTH NAVIGATION ---
document.getElementById('prev-month').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  renderCalendar(viewYear, viewMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar(viewYear, viewMonth);
});

// INITIAL RENDER
renderCalendar(viewYear, viewMonth);
