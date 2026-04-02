/**
 * search_bar.js
 * Handles month-picker (From / To) and the Rooms + Adults modal overlay.
 */

/* ─────────────────────────────────────────────
   ROOMS STATE
   rooms = [ adultsCount, adultsCount, … ]   (1 or 2 adults per room)
───────────────────────────────────────────── */
// var rooms = [2]; // start: 1 room, 2 adults
var rooms= JSON.parse(document.getElementById('roomsDataInput').value || '[2]'); // load from hidden input (if any)


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
    var totalAdults = rooms.reduce(function (s, a) { return s + a; }, 0);
    var roomWord    = rooms.length === 1 ? 'Room' : 'Rooms';
    var adultWord   = totalAdults === 1  ? 'Adult' : 'Adults';

    var valEl = document.getElementById('sbRoomsVal');
    var subEl = document.getElementById('sbRoomsSub');
    if (valEl) valEl.textContent = rooms.length + ' ' + roomWord;
    if (subEl) subEl.textContent = totalAdults + ' ' + adultWord;

    var countInput = document.getElementById('roomsCountInput');
    var dataInput  = document.getElementById('roomsDataInput');
    if (countInput) countInput.value = rooms.length;
    if (dataInput)  dataInput.value  = JSON.stringify(rooms);
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
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var selectedFrom = null; // { year, month }
var selectedTo   = null;
var fromYear, toYear;

function initYears() {
    var now = new Date();
    fromYear = now.getFullYear();
    toYear   = now.getFullYear();
    var fy = document.getElementById('mdFromYear');
    var ty = document.getElementById('mdToYear');
    if (fy) fy.textContent = fromYear;
    if (ty) ty.textContent = toYear;
    renderMonths('from');
    renderMonths('to');
}

function renderMonths(which) {
    var year     = which === 'from' ? fromYear : toYear;
    var grid     = document.getElementById(which === 'from' ? 'mdFromMonths' : 'mdToMonths');
    var selected = which === 'from' ? selectedFrom : selectedTo;
    var now      = new Date();
    if (!grid) return;

    grid.innerHTML = '';
    MONTHS.forEach(function (m, i) {
        var btn  = document.createElement('button');
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
    var valEl  = document.getElementById(which === 'from' ? 'sbFromVal'  : 'sbToVal');
    var subEl  = document.getElementById(which === 'from' ? 'sbFromSub'  : 'sbToSub');
    var hidden = document.getElementById(which === 'from' ? 'dateFromInput' : 'dateToInput');

    var obj = { year: year, month: month };
    if (which === 'from') selectedFrom = obj; else selectedTo = obj;

    var label = MONTHS[month] + ' ' + year;
    if (valEl) valEl.textContent = label;
    if (subEl) subEl.textContent = 'Month · Year';

    /* store first day of selected month */
    var d = new Date(year, month, 1);
    if (hidden) hidden.value = d.toISOString().slice(0, 10);

    renderMonths(which);
    closeAllMonthDropdowns();
}

function shiftYear(which, delta) {
    if (which === 'from') { fromYear += delta; } else { toYear += delta; }
    var el = document.getElementById(which === 'from' ? 'mdFromYear' : 'mdToYear');
    if (el) el.textContent = (which === 'from' ? fromYear : toYear);
    renderMonths(which);
}

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
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
    });
})();


/* ── init on DOM ready ── */
document.addEventListener('DOMContentLoaded', function () {
    initYears();
    renderRooms();
});