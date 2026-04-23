/**
 * search_bar.js
 * Handles month-picker (From / To) and the Rooms + Adults modal overlay.
 */

/* ─────────────────────────────────────────────
   ROOMS STATE
   rooms = [ adultsCount, adultsCount, … ]   (1 or 2 adults per room)
───────────────────────────────────────────── */
// var rooms = [2]; // start: 1 room, 2 adults
var roomsDataEl = document.getElementById('roomsDataInput');
var rooms = roomsDataEl ? JSON.parse(roomsDataEl.value || '[2]') : [2];


/* ── render the room rows ── */
function renderRooms() {
    var list = document.getElementById('rdRoomsList');
    if (!list) return;
    list.innerHTML = '';

    rooms.forEach(function (adults, idx) {
        var row = document.createElement('div');
        row.className = 'room-row';
        row.innerHTML =
            '<div class="room-info">' +
            '<div class="room-label">Room ' + (idx + 1) + '</div>' +
            '<div class="adults-label">Adults</div>' +
            '</div>' +
            '<div class="adults-counter">' +
            '<button class="counter-btn" type="button" onclick="updateAdults(' + idx + ', -1)">−</button>' +
            '<span class="counter-value">' + adults + '</span>' +
            '<button class="counter-btn" type="button" onclick="updateAdults(' + idx + ', 1)">+</button>' +
            '</div>' +
            (rooms.length > 1
                ? '<button class="remove-room-btn" type="button" onclick="removeRoom(' + idx + ')">✕</button>'
                : '');
        list.appendChild(row);
    });

    /* hide "Add Room" when 4 rooms reached */
    var addBtn = document.getElementById('rdAddRoomBtn');
    if (addBtn) addBtn.style.display = rooms.length >= 4 ? 'none' : '';

    syncRoomsInputs();
}

/* ── add / remove room ── */
function addRoom() {
    if (rooms.length < 4) {
        rooms.push(2); // new room defaults to 2 adults
        renderRooms();
    }
}

function removeRoom(idx) {
    if (rooms.length > 1) {
        rooms.splice(idx, 1);
        renderRooms();
    }
}

/* ── update adults in a room (min 1, max 2) ── */
function updateAdults(roomIdx, delta) {
    var val = (rooms[roomIdx] || 1) + delta;
    if (val < 1) val = 1;
    if (val > 2) val = 2;
    rooms[roomIdx] = val;
    renderRooms();
}

/* ── sync summary label + hidden inputs ── */
function syncRoomsInputs() {
    var totalAdults = rooms.reduce(function (s, a) {
        return s + a;
    }, 0);
    var roomWord = rooms.length === 1 ? 'Room' : 'Rooms';
    var adultWord = totalAdults === 1 ? 'Adult' : 'Adults';

    var valEl = document.getElementById('sbRoomsVal');
    var subEl = document.getElementById('sbRoomsSub');
    if (valEl) valEl.textContent = rooms.length + ' ' + roomWord;
    if (subEl) subEl.textContent = totalAdults + ' ' + adultWord;

    var countInput = document.getElementById('roomsCountInput');
    var dataInput = document.getElementById('roomsDataInput');
    var personsInput = document.getElementById('personsCountInput');
    if (countInput) countInput.value = rooms.length;
    if (dataInput) dataInput.value = JSON.stringify(rooms);
    if (personsInput) personsInput.value = totalAdults;
}

/* ── open overlay modal ── */
function openRoomsOverlay(event) {
    event.stopPropagation();
    var overlay = document.getElementById('roomsOverlay');
    if (overlay) {
        overlay.classList.add('open');
        renderRooms();
        closeAllMonthDropdowns();
    }
}

/* ── close overlay modal ── */
function closeRoomsOverlay() {
    var overlay = document.getElementById('roomsOverlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
}

/* ── close overlay when clicking outside modal ── */
document.addEventListener('click', function (e) {
    var overlay = document.getElementById('roomsOverlay');
    if (overlay && overlay.classList.contains('open')) {
        if (!document.querySelector('.rooms-modal').contains(e.target)) {
            closeRoomsOverlay();
        }
    }
});

/* ─────────────────────────────────────────────
   MONTH PICKER  (From / To)
───────────────────────────────────────────── */
// const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var selectedFrom = null; // { year, month }
var selectedTo = null;
var fromYear, toYear;


function renderMonths(which) {
    var year = which === 'from' ? fromYear : toYear;
    var grid = document.getElementById(which === 'from' ? 'mdFromMonths' : 'mdToMonths');
    var selected = which === 'from' ? selectedFrom : selectedTo;
    var now = new Date();
    if (!grid) return;

    grid.innerHTML = '';
    MONTHS.forEach(function (m, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'md-month-btn';
        btn.textContent = m;

        var isPast = (year < now.getFullYear()) ||
            (year === now.getFullYear() && i < now.getMonth());
        if (isPast) btn.classList.add('past');

        if (selected && selected.year === year && selected.month === i) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            selectMonth(which, year, i);
        });
        grid.appendChild(btn);
    });
}

function selectMonth(which, year, month) {
    console.log('selectMonth called with:', which, year, month);
    var valEl = document.getElementById(which === 'from' ? 'sbFromVal' : 'sbToVal');
    var subEl = document.getElementById(which === 'from' ? 'sbFromSub' : 'sbToSub');
    var hidden = document.getElementById(which === 'from' ? 'dateFromInput' : 'dateToInput');

    var prevFrom = selectedFrom ? {year: selectedFrom.year, month: selectedFrom.month} : null;
    var prevTo = selectedTo ? {year: selectedTo.year, month: selectedTo.month} : null;

    var obj = {year: year, month: month};
    if (which === 'from') selectedFrom = obj; else selectedTo = obj;

    var label = MONTHS[month] + ' ' + year;
    if (valEl) valEl.textContent = label;
    if (subEl) subEl.textContent = 'Month · Year';

    /* store first day of selected month (avoid UTC shift with toISOString) */
    var mm = String(month + 1).padStart(2, '0');
    let date_day = '01';
    if (which === "from") {
         date_day = '01';
    }
    //     make date_to to the last day of month if from month is same as to month to avoid confusion about month range (e.g. Jan 2024 - Jan 2024 should mean whole January, not just one day)
    else {
        var lastDay = new Date(year, month + 1, 0).getDate();
         date_day = String(lastDay).padStart(2, '0');
    }

    console.log('Selected month:', label, 'Stored value:', year + '-' + mm + '-' + date_day + "in" + which);
    if (hidden) hidden.value = year + '-' + mm + date_day;

    if (!isValidMonthRange()) {
        alert('From month must be before or equal To month.');

        if (which === 'from') {
            selectedFrom = prevFrom;
            restoreMonthField('from', prevFrom);
        } else {
            selectedTo = prevTo;
            restoreMonthField('to', prevTo);
        }

        renderMonths('from');
        renderMonths('to');
        return;
    }

    renderMonths('from');
    renderMonths('to');
    closeAllMonthDropdowns();
}

function getMonthRank(v) {
    if (!v) return null;
    return (v.year * 12) + v.month;
}

function isValidMonthRange() {
    if (!selectedFrom || !selectedTo) return true;
    return getMonthRank(selectedFrom) <= getMonthRank(selectedTo);
}

function restoreMonthField(which, valueObj) {
    var valEl = document.getElementById(which === 'from' ? 'sbFromVal' : 'sbToVal');
    var subEl = document.getElementById(which === 'from' ? 'sbFromSub' : 'sbToSub');
    var hidden = document.getElementById(which === 'from' ? 'dateFromInput' : 'dateToInput');

    if (!valueObj) return;

    if (valEl) valEl.textContent = MONTHS[valueObj.month] + ' ' + valueObj.year;
    if (subEl) subEl.textContent = 'Month · Year';

    var mm = String(valueObj.month + 1).padStart(2, '0');
    if (hidden) hidden.value = valueObj.year + '-' + mm + '-01';
}

/* ── close overlay when clicking outside modal ── */
document.addEventListener('click', function (e) {
    var overlay = document.getElementById('roomsOverlay');
    if (overlay && overlay.classList.contains('open')) {
        if (!document.querySelector('.rooms-modal').contains(e.target)) {
            closeRoomsOverlay();
        }
    }
});

/* ─────────────────────────────────────────────
   MONTH PICKER  (From / To)
───────────────────────────────────────────── */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var selectedFrom = null; // { year, month }
var selectedTo = null;
var fromYear, toYear;

function initYears() {
    var now = new Date();
    fromYear = now.getFullYear();
    toYear = now.getFullYear();
    var fy = document.getElementById('mdFromYear');
    var ty = document.getElementById('mdToYear');
    if (fy) fy.textContent = fromYear;
    if (ty) ty.textContent = toYear;
    renderMonths('from');
    renderMonths('to');
}

function renderMonths(which) {
    var year = which === 'from' ? fromYear : toYear;
    var grid = document.getElementById(which === 'from' ? 'mdFromMonths' : 'mdToMonths');
    var selected = which === 'from' ? selectedFrom : selectedTo;
    var now = new Date();
    if (!grid) return;

    grid.innerHTML = '';
    MONTHS.forEach(function (m, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'md-month-btn';
        btn.textContent = m;

        var isPast = (year < now.getFullYear()) ||
            (year === now.getFullYear() && i < now.getMonth());
        if (isPast) btn.classList.add('past');

        if (selected && selected.year === year && selected.month === i) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            selectMonth(which, year, i);
        });
        grid.appendChild(btn);
    });
}

function selectMonth(which, year, month) {
    var valEl = document.getElementById(which === 'from' ? 'sbFromVal' : 'sbToVal');
    var subEl = document.getElementById(which === 'from' ? 'sbFromSub' : 'sbToSub');
    var hidden = document.getElementById(which === 'from' ? 'dateFromInput' : 'dateToInput');

    var prevFrom = selectedFrom ? {year: selectedFrom.year, month: selectedFrom.month} : null;
    var prevTo = selectedTo ? {year: selectedTo.year, month: selectedTo.month} : null;

    var obj = {year: year, month: month};
    if (which === 'from') selectedFrom = obj; else selectedTo = obj;

    var label = MONTHS[month] + ' ' + year;
    if (valEl) valEl.textContent = label;
    if (subEl) subEl.textContent = 'Month · Year';

    /* store first day of selected month in case in of from and last date in case of end
     (avoid UTC shift with toISOString) */

    var mm = String(month + 1).padStart(2, '0');
        let date_day = '01';
     if (which === "from") {
          date_day = '01';
    }
    //     make date_to to the last day of month if from month is same as to month to avoid confusion about month range (e.g. Jan 2024 - Jan 2024 should mean whole January, not just one day)
    else {
        var lastDay = new Date(year, month + 1, 0).getDate();
          date_day = String(lastDay).padStart(2, '0');
    }

    if (hidden) hidden.value = year + '-' + mm +'-'+ date_day;
        console.log("date_day:", date_day, "hidden value:", hidden ? hidden.value : 'N/A');
    if (!isValidMonthRange()) {
        alert('From month must be before or equal To month.');

        if (which === 'from') {
            selectedFrom = prevFrom;
            restoreMonthField('from', prevFrom);
        } else {
            selectedTo = prevTo;
            restoreMonthField('to', prevTo);
        }

        renderMonths('from');
        renderMonths('to');
        return;
    }

    renderMonths('from');
    renderMonths('to');
    closeAllMonthDropdowns();
}

function getMonthRank(v) {
    if (!v) return null;
    return (v.year * 12) + v.month;
}

function isValidMonthRange() {
    if (!selectedFrom || !selectedTo) return true;
    return getMonthRank(selectedFrom) <= getMonthRank(selectedTo);
}

function restoreMonthField(which, valueObj) {
    var valEl = document.getElementById(which === 'from' ? 'sbFromVal' : 'sbToVal');
    var subEl = document.getElementById(which === 'from' ? 'sbFromSub' : 'sbToSub');
    var hidden = document.getElementById(which === 'from' ? 'dateFromInput' : 'dateToInput');

    if (!valueObj) return;

    if (valEl) valEl.textContent = MONTHS[valueObj.month] + ' ' + valueObj.year;
    if (subEl) subEl.textContent = 'Month · Year';

    var mm = String(valueObj.month + 1).padStart(2, '0');
    if (hidden) hidden.value = valueObj.year + '-' + mm + '-01';
}

/* Close month overlay when clicking outside modal */
document.addEventListener('click', function (e) {
    var mdFrom = document.getElementById('mdFrom');
    var mdTo = document.getElementById('mdTo');
    var sbFromField = document.getElementById('sbFromField');
    var sbToField = document.getElementById('sbToField');

    if (mdFrom && mdFrom.classList.contains('open')) {
        if (!sbFromField.contains(e.target) && !mdFrom.contains(e.target)) {
            closeAllMonthDropdowns();
        }
    }

    if (mdTo && mdTo.classList.contains('open')) {
        if (!sbToField.contains(e.target) && !mdTo.contains(e.target)) {
            closeAllMonthDropdowns();
        }
    }
});

/* toggle From / To dropdowns */
(function attachMonthToggles() {
    ['From', 'To'].forEach(function (which) {
        var field = document.getElementById('sb' + which + 'Field');
        var panel = document.getElementById('md' + which);
        if (!field || !panel) return;
        if (field.classList.contains('disabled')) return;
        field.addEventListener('click', function (e) {
            e.stopPropagation();
            closeRoomsOverlay();
            var isOpen = panel.classList.contains('open');
            closeAllMonthDropdowns();
            if (!isOpen) {
                panel.classList.add('open');
                field.classList.add('active');
            }
        });
        panel.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });
})();


/* ── init on DOM ready ── */
function closeAllMonthDropdowns() {
    ['mdFrom', 'mdTo'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    ['sbFromField', 'sbToField'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}


document.addEventListener('DOMContentLoaded', function () {
    initYears();
    renderRooms();

    // Restore month selections from hidden inputs (after form submit / page reload)
    var dateFromVal = document.getElementById('dateFromInput') ? document.getElementById('dateFromInput').value : '';
    var dateToVal = document.getElementById('dateToInput') ? document.getElementById('dateToInput').value : '';

    if (dateFromVal) {
        var parts = dateFromVal.split('-');
        var y = parseInt(parts[0]);
        var m = parseInt(parts[1]) - 1; // 0-based
        fromYear = y;
        var fy = document.getElementById('mdFromYear');
        if (fy) fy.textContent = fromYear;
        selectMonth('from', y, m);
    }

    if (dateToVal) {
        var parts = dateToVal.split('-');
        var y = parseInt(parts[0]);
        var m = parseInt(parts[1]) - 1;
        toYear = y;
        var ty = document.getElementById('mdToYear');
        if (ty) ty.textContent = toYear;
        selectMonth('to', y, m);
    }

    // Final guard on submit
    var searchForm = document.querySelector('form[action*="/cruises"], form[action*="/cabins"]');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            if (!isValidMonthRange()) {
                e.preventDefault();
                alert('From month must be before or equal To month.');
            }
        });
    }
});

