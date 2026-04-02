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

function bookNowWithCurrentParams(btn){
    console.log("Book Now clicked with current params");
    const dateFrom = document.getElementById('dateFromInput').value;
    const dateTo = document.getElementById('dateToInput').value;
    const personCount = document.getElementById('personsCountInput').value;
    const roomsCount = document.getElementById('roomsCountInput').value;
    const roomsDataInput = document.getElementById('roomsDataInput').value;
    const dataCruiseId = btn.dataset.cruiseId;
    const url = `/cruises/${dataCruiseId}?date_from=${dateFrom}&date_to=${dateTo}&persons_count=${personCount}&rooms_count=${roomsCount}&rooms_data=${encodeURIComponent(roomsDataInput)}`;
    console.log("Redirecting to:", url);
    window.location.href = url;
}
