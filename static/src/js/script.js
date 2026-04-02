// ── particles
try{
    const container = document.getElementById('particles');
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
}
catch(e){
    container=document.getElementById('particles');
}
// for (let i = 0; i < 40; i++) {
//     const p = document.createElement('div');
//     p.className = 'particle';
//     p.style.cssText = `
//       left: ${Math.random() * 100}%;
//       width: ${Math.random() * 2 + 1}px;
//       height: ${Math.random() * 2 + 1}px;
//       animation-duration: ${Math.random() * 12 + 8}s;
//       animation-delay: ${Math.random() * 10}s;
//       opacity: ${Math.random() * 0.5};
//     `;
//     container.appendChild(p);
// }

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

/* ════════════════════════════════════════════════════════════════ */
/*              CABIN CARD CAROUSEL & SELECTION                      */
/* ════════════════════════════════════════════════════════════════ */

/**
 * Get current slide position for a carousel
 */
function getCurrentSlideIndex(element) {
    const track = element.closest('.carousel-wrapper') ?
                  element.closest('.carousel-wrapper').querySelector('.carousel-track') :
                  element.querySelector('.carousel-track');

    if (!track) return 0;

    const transform = window.getComputedStyle(track).transform;
    const matrix = transform.match(/^matrix\((.+)\)$/);
    const translateY = matrix ? parseFloat(matrix[1].split(', ')[5]) : 0;
    const slideHeight = track.offsetHeight;
    return Math.abs(Math.round(translateY / slideHeight));
}

/**
 * Move carousel to specific slide
 */
function moveToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card');
    if (!card) return;

    const track = card.querySelector('.carousel-track');
    const slides = card.querySelectorAll('.carousel-slide');

    if (!track || slides.length === 0) return;

    slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    const offset = -slideIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    const indicators = card.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === slideIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

/**
 * Next slide
 */
function nextSlide(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    const currentIndex = getCurrentSlideIndex(card);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= slides.length) {
        nextIndex = 0;
    }

    moveToSlide(card, nextIndex);
}

/**
 * Previous slide
 */
function prevSlide(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    const currentIndex = getCurrentSlideIndex(card);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
        prevIndex = slides.length - 1;
    }

    moveToSlide(card, prevIndex);
}

/**
 * Go to specific slide by indicator
 */
function goToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card-horizontal');
    if (card) {
        moveToSlide(card, slideIndex);
    }
}

/**
 * Increment room count
 */
function incrementRooms(element) {
    const input = element.closest('.room-selector').querySelector('.room-input');
    if (input) {
        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.max) || 5;
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            updatePriceDisplay(element);
        }
    }
}

/**
 * Decrement room count
 */
function decrementRooms(element) {
    const input = element.closest('.room-selector').querySelector('.room-input');
    if (input) {
        const currentValue = parseInt(input.value) || 1;
        const minValue = parseInt(input.min) || 1;
        if (currentValue > minValue) {
            input.value = currentValue - 1;
            updatePriceDisplay(element);
        }
    }
}

/**
 * Update price display based on room count
 */
function updatePriceDisplay(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const roomInput = card.querySelector('.room-input');
    const priceDisplay = card.querySelector('[id="priceDisplay"]') || card.querySelector('.price-amount span');

    if (roomInput && priceDisplay) {
        const roomCount = parseInt(roomInput.value) || 1;
        const basePrice = parseInt(priceDisplay.getAttribute('data-base-price')) || 0;
        const totalPrice = basePrice * roomCount;

        priceDisplay.textContent = totalPrice.toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
}

/**
 * Add room to booking
 */
function addRoomToBooking(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) {
        console.error('Cabin card not found');
        return;
    }

    const roomTypeId = element.getAttribute('data-room-type-id');
    const maxRooms = element.getAttribute('data-max-rooms');
    const cabinName = card.querySelector('.cabin-name').textContent;
    const roomCount = card.querySelector('.room-input').value;
    const priceElement = card.querySelector('[id="priceDisplay"]') || card.querySelector('.price-amount span');
    const price = priceElement ? priceElement.textContent : '0';

    const bookingData = {
        roomTypeId: roomTypeId,
        cabin: cabinName,
        rooms: parseInt(roomCount),
        maxAvailable: parseInt(maxRooms) || 5,
        pricePerNight: parseInt(priceElement.getAttribute('data-base-price')) || 0,
        totalPrice: parseInt(price.replace(/,/g, ''))
    };

    console.log('Adding to booking:', bookingData);

    // Show confirmation
    showNotification(element, `${roomCount} room(s) in ${cabinName} added to booking!`);

    // Reset room count
    setTimeout(() => {
        card.querySelector('.room-input').value = '1';
    }, 2000);
}

/**
 * Show notification feedback
 */
function showNotification(element, message) {
    const btn = element;
    const originalHTML = btn.innerHTML;

    btn.textContent = '✓ Added!';
    btn.style.background = 'rgba(76, 175, 80, 0.8)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
    }, 2000);
}

/**
 * Initialize all cabin cards
 */
function initializeCabinCards() {
    document.querySelectorAll('.carousel-track').forEach(track => {
        const card = track.closest('.cabin-card');
        if (card) {
            moveToSlide(card, 0);
        }
    });

    document.querySelectorAll('.room-input').forEach(input => {
        input.addEventListener('change', function() {
            updatePriceDisplay(this);
        });
    });
}

// Initialize cabin cards when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCabinCards);
} else {
    initializeCabinCards();
}

// Touch/Swipe support for mobile (VERTICAL CAROUSEL)
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    const carousel = e.target.closest('.carousel-wrapper');
    if (carousel) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, false);

document.addEventListener('touchend', (e) => {
    const carousel = e.target.closest('.carousel-wrapper');
    if (carousel) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(carousel);
    }
}, false);

function handleSwipe(carousel) {
    const minSwipeDistance = 50;
    const distance = touchStartY - touchEndY;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    const track = carousel.querySelector('.carousel-track');

    if (isUpSwipe) {
        nextSlide(track);
    }
    if (isDownSwipe) {
        prevSlide(track);
    }
}
function bookNowWithCurrentParams(btn){
    console.log("Book Now clicked with current params");
    const dateFrom = document.getElementById('dateFromInput').value;
    const dateTo = document.getElementById('dateToInput').value;
    const personCount = document.getElementById('personsCountInput').value;
    const dataCruiseId = btn.dataset.cruiseId;
    const url = `/cruises/${dataCruiseId}?date_from=${dateFrom}&date_to=${dateTo}&persons_count=${personCount}`;
    console.log("Redirecting to:", url);
    window.location.href = url;
}