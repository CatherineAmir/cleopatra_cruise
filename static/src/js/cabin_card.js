/**
 * Initialize all cabin cards
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
 * Get current slide position for a carousel
 */
function getCurrentSlideIndex(element) {
    const track = element.closest('.carousel-wrapper') ?
                  element.closest('.carousel-wrapper').querySelector('.carousel-track') :
                  element.querySelector('.carousel-track');

    if (!track) return 0;

    const transform = window.getComputedStyle(track).transform;
    // Parse matrix to get translateX value
    const matrix = transform.match(/^matrix\((.+)\)$/);
    if (!matrix) return 0;

    const translateX = parseFloat(matrix[1].split(', ')[4]); // Index 4 is translateX in matrix()

    // Get the parent container width (100% of carousel)
    const containerWidth = track.parentElement.offsetWidth;

    // Calculate current index based on translateX
    const slideIndex = Math.round(-translateX / containerWidth);
    return Math.max(0, slideIndex);
}

/**
 * Move carousel to specific slide
 */
function moveToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card-horizontal') || element.closest('.cabin-card');
    if (!card) {
        console.error('Card not found');
        return;
    }

    const track = card.querySelector('.carousel-track');
    const slides = card.querySelectorAll('.carousel-slide');
    const wrapper = card.querySelector('.carousel-wrapper');

    if (!track || slides.length === 0) {
        console.error('Track or slides not found');
        return;
    }

    slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));

    // Use wrapper width for more accurate calculation
    const containerWidth = wrapper ? wrapper.offsetWidth : 100;
    const offset = -slideIndex * 100;

    console.log('Moving to slide ' + slideIndex + ' of ' + slides.length + ', offset: ' + offset + '%');

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

/**
 * Initialize carousel for all cabin cards on page load
 */
function initializeCarousels() {
    console.log('Initializing cabin card carousels...');

    // Initialize all carousels
    const carousels = document.querySelectorAll('.cabin-card-horizontal');
    console.log('Found ' + carousels.length + ' cabin cards');

    carousels.forEach((card, cardIndex) => {
        const track = card.querySelector('.carousel-track');
        const slides = card.querySelectorAll('.carousel-slide');
        const wrapper = card.querySelector('.carousel-wrapper');

        if (track && slides.length > 0) {
            console.log('Carousel ' + cardIndex + ' has ' + slides.length + ' slides');

            // Log slide images
            slides.forEach((slide, slideIndex) => {
                const img = slide.querySelector('img');
                console.log('  Slide ' + slideIndex + ': ' + (img ? 'Has image' : 'No image'));
            });

            if (wrapper) {
                console.log('Carousel wrapper dimensions: ' + wrapper.offsetWidth + 'x' + wrapper.offsetHeight);
            }
            console.log('Track dimensions: ' + track.offsetWidth + 'x' + track.offsetHeight);

            // Ensure carousel starts at first slide
            track.style.transform = 'translateX(0%)';

            // Update indicators
            const indicators = card.querySelectorAll('.indicator');
            if (indicators.length > 0) {
                console.log('Found ' + indicators.length + ' indicators');
                indicators[0].classList.add('active');
            }
        } else {
            console.warn('Carousel ' + cardIndex + ' missing track or slides. Track: ' + !!track + ', Slides: ' + (slides ? slides.length : 0));
        }
    });

    console.log('Carousel initialization complete');
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeCarousels);

// Also initialize after a short delay to catch dynamically loaded content
setTimeout(initializeCarousels, 1000);

/**
 * Auto-play carousel option (commented out by default)
 */
function startAutoPlay(carouselElement, interval = 5000) {
    setInterval(() => {
        nextSlide(carouselElement);
    }, interval);
}

document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.getAttribute('data-bs-target');
                var target = document.querySelector(targetId);
                if (!target) return;

                var isOpen = target.classList.contains('show');

                if (isOpen) {
                    target.classList.remove('show');
                    btn.classList.add('collapsed');
                    btn.setAttribute('aria-expanded', 'false');
                } else {
                    target.classList.add('show');
                    btn.classList.remove('collapsed');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    });