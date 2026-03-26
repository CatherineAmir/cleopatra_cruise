// ── particles
let container = document.getElementById('particles');
for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 2 + 1}px;
      height: ${Math.random() * 2 + 1}px;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.5};
    `;
    container.appendChild(p);
}

// ── date picker logic
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// function formatDate(d) {
//     return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
// }
//
// function getWeekday(d) {
//     return DAYS[d.getDay()];
// }
//
// function updateDates() {
//     const inVal = document.getElementById('dateIn').value;
//     const outVal = document.getElementById('dateOut').value;
//     console.log('Updating dates:', inVal, outVal);
//
//     if (inVal) {
//         const d = new Date(inVal + 'T00:00:00');
//         document.getElementById('dispIn').textContent = formatDate(d);
//         document.getElementById('dispInDay').textContent = getWeekday(d);
//     }
//     if (outVal) {
//         const d = new Date(outVal + 'T00:00:00');
//         document.getElementById('dispOut').textContent = formatDate(d);
//         document.getElementById('dispOutDay').textContent = getWeekday(d);
//     }
//     if (inVal && outVal) {
//         const start = new Date(inVal + 'T00:00:00');
//         const end = new Date(outVal + 'T00:00:00');
//         const diff = Math.round((end - start) / 86400000);
//         const pill = document.getElementById('durationPill');
//         if (diff > 0) {
//             document.getElementById('durationText').textContent = `${diff} Night${diff !== 1 ? 's' : ''} · ${diff + 1} Day${diff + 1 !== 1 ? 's' : ''}`;
//             pill.style.display = 'inline-flex';
//         } else {
//             pill.style.display = 'none';
//         }
//         // enforce out > in
//         document.getElementById('dateOut').min = inVal;
//     }
// }

// document.getElementById('dateIn').addEventListener('change', () => {
//     document.getElementById('dateOut').min = document.getElementById('dateIn').value;
//     updateDates();
// });
// document.getElementById('dateOut').addEventListener('change', updateDates);

// Set default dates (today + 12 nights)
// const today = new Date();
// const defIn = new Date(today);
// defIn.setDate(today.getDate() + 30);
// const defOut = new Date(defIn);
// defOut.setDate(defIn.getDate() + 12);
// const toISO = d => d.toISOString().split('T')[0];
// document.getElementById('dateIn').value = toISO(defIn);
// document.getElementById('dateOut').value = toISO(defOut);
// updateDates();


// document.getElementById('bookBtn').addEventListener('click', function (e) {
//     const btn = this;
//     const circle = document.createElement('span');
//     circle.className = 'ripple';
//     const d = Math.max(btn.clientWidth, btn.clientHeight);
//     circle.style.width = circle.style.height = d + 'px';
//     const rect = btn.getBoundingClientRect();
//     circle.style.left = (e.clientX - rect.left - d / 2) + 'px';
//     circle.style.top = (e.clientY - rect.top - d / 2) + 'px';
//     btn.appendChild(circle);
//     setTimeout(() => circle.remove(), 600);
//
//     // feedback
//     btn.textContent = '✓ Reserved!';
//     btn.style.background = 'linear-gradient(135deg, #2d7d5a, #3aaa78)';
//     setTimeout(() => {
//         btn.textContent = 'Book Now';
//         btn.style.background = '';
//     }, 2200);
// });


// ══ SEARCH BAR LOGIC ══
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const sbState = {
    from: {year: new Date().getFullYear(), month: null},
    to: {year: new Date().getFullYear(), month: null},
};

function renderMonths(which) {
    const grid = document.getElementById(which === 'from' ? 'mdFromMonths' : 'mdToMonths');
    const yr = sbState[which].year;
    const now = new Date();
    grid.innerHTML = '';
    MONTH_NAMES.forEach((m, i) => {
        const btn = document.createElement('button');
        btn.className = 'md-month-btn';
        btn.textContent = m;
        btn.type = 'button';
        const isPast = yr < now.getFullYear() || (yr === now.getFullYear() && i < now.getMonth());
        if (isPast) btn.classList.add('past');
        if (sbState[which].month === i && sbState[which].year === yr) btn.classList.add('selected');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            pickMonth(which, i);
        });
        grid.appendChild(btn);
    });
    document.getElementById(which === 'from' ? 'mdFromYear' : 'mdToYear').textContent = yr;
}

function pickMonth(which, idx) {
    sbState[which].month = idx;
    const yr = sbState[which].year;
    const fieldVal = document.getElementById(which === 'from' ? 'sbFromVal' : 'sbToVal');
    const fieldSub = document.getElementById(which === 'from' ? 'sbFromSub' : 'sbToSub');
    fieldVal.textContent = MONTH_FULL[idx];
    fieldSub.textContent = yr;

    // Create a date on the first day of the selected month
    const date = new Date(yr, idx, 1);
    const dateStr = date.toISOString().split('T')[0];

    // Set the hidden input value
    if (which === 'from') {
        document.getElementById('dateFromInput').value = dateStr;
    } else {
        document.getElementById('dateToInput').value = dateStr;
    }

    closeAllDropdowns();
}

function shiftYear(which, dir) {
    const now = new Date();
    const next = sbState[which].year + dir;
    if (next < now.getFullYear()) return;
    sbState[which].year = next;
    renderMonths(which);
}

function openDropdown(which) {
    closeAllDropdowns();
    renderMonths(which);
    const dd = document.getElementById(which === 'from' ? 'mdFrom' : 'mdTo');
    dd.classList.add('open');
    document.getElementById(which === 'from' ? 'sbFromField' : 'sbToField').classList.add('active');
}

function closeAllDropdowns() {
    ['mdFrom', 'mdTo'].forEach(id => document.getElementById(id).classList.remove('open'));
    ['sbFromField', 'sbToField'].forEach(id => document.getElementById(id).classList.remove('active'));
}

document.getElementById('sbFromField').addEventListener('click', e => {
    e.stopPropagation();
    openDropdown('from');
});
document.getElementById('sbToField').addEventListener('click', e => {
    e.stopPropagation();
    openDropdown('to');
});
document.addEventListener('click', closeAllDropdowns);

// persons counter
// let persons = 2;

function updatePersons(delta) {
    let persons = parseInt(document.getElementById('personsCountInput')?.value) || 1;
    console.log("Updating persons Called:", persons, "Delta:", delta);
    const newPersons = persons + delta;
    console.log("Updating persons:", newPersons);
    if (newPersons >= 1 && newPersons <= 20) {
        persons = newPersons;
        document.getElementById('personsNum').textContent = persons;
        document.getElementById('personsCountInput').value = persons;
        document.getElementById('personsSub').textContent = persons === 1 ? 'Person' : 'Persons';
    }
}




const card = document.getElementById('cruiseCard');
card.addEventListener('mousemove', e => {
    const {left, top, width, height} = card.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 10;
    const y = ((e.clientY - top) / height - 0.5) * -10;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.01)`;
});
card.addEventListener('mouseleave', () => {
    card.style.transform = '';
});
