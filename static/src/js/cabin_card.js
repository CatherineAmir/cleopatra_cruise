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

    // Get room count from the room selector button's data attribute
    const roomButton = card.querySelector('.btn-room-selector');
    const roomCount = roomButton ? parseInt(roomButton.getAttribute('data-selected-count')) || 0 : 0;

    if (roomCount === 0) {
        showNotification(element, 'Please select at least 1 room');
        return;
    }

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

    // Reset room count to 0 (unselected state)
    setTimeout(() => {
        if (roomButton) {
            roomButton.setAttribute('data-selected-count', '0');
            roomButton.querySelector('.room-selector-text').textContent = 'Select Rooms';
        }
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

/**
 * Room Distribution Modal Functions
 */

// Store modal context
var roomDistributionContext = {
    allRoomTypes: [],
    totalRoomsNeeded: 0,
    roomsData: {},
    currentRoom: null
};

/**
 * Open room distribution modal
 */
function openRoomDistributionModal(button, roomTypeId) {
    console.log('Opening room distribution modal for room type:', roomTypeId);

    const overlay = document.getElementById('roomDistributionOverlay');
    if (!overlay) {
        console.error('Room distribution overlay not found');
        return;
    }

    // Get all room types from the page
    const allRoomCards = document.querySelectorAll('.cabin-card-horizontal');
    roomDistributionContext.allRoomTypes = [];
    roomDistributionContext.roomsData = {};

    allRoomCards.forEach(card => {
        const typeId = card.querySelector('.btn-room-selector').getAttribute('data-room-type-id');
        const typeName = card.querySelector('.cabin-name').textContent.trim();
        const available = parseInt(card.querySelector('.btn-room-selector').getAttribute('data-available')) || 0;

        roomDistributionContext.allRoomTypes.push({
            id: typeId,
            name: typeName,
            available: available
        });

        // Initialize rooms data for this type
        roomDistributionContext.roomsData[typeId] = 0;
    });

    // Get required rooms from search
    const requiredRooms = parseInt(button.getAttribute('data-required')) || 1;
    roomDistributionContext.totalRoomsNeeded = requiredRooms;
    roomDistributionContext.currentRoom = roomTypeId;

    // Render modal content
    renderRoomDistributionModal();

    // Show overlay
    overlay.classList.add('open');
}

/**
 * Render room distribution modal content
 */
function renderRoomDistributionModal() {
    const body = document.getElementById('roomDistributionBody');
    if (!body) return;

    let html = `
        <div class="distribution-info">
            <p class="info-text">You need to select <strong>${roomDistributionContext.totalRoomsNeeded} room(s)</strong> total</p>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%; background: linear-gradient(135deg, #c9a84c, #e8c97a);"></div>
                </div>
                <span class="progress-text"><span id="selectedCount">0</span>/${roomDistributionContext.totalRoomsNeeded}</span>
            </div>
        </div>

        <div class="room-types-list">
    `;

    roomDistributionContext.allRoomTypes.forEach(roomType => {
        const selected = roomDistributionContext.roomsData[roomType.id] || 0;
        const isAvailable = roomType.available > 0;
        const disabled = !isAvailable || (selected === 0 && getTotalSelected() >= roomDistributionContext.totalRoomsNeeded);

        html += `
            <div class="room-type-selector" data-room-id="${roomType.id}">
                <div class="room-type-header">
                    <h3 class="room-type-name">${roomType.name}</h3>
                    <span class="room-type-availability">${roomType.available} available</span>
                </div>

                <div class="room-type-controls">
                    <button type="button" class="room-control-btn minus" onclick="decrementRoomSelection('${roomType.id}')" ${disabled || selected === 0 ? 'disabled' : ''}>
                        <i class="fa fa-minus"></i>
                    </button>

                    <div class="room-count-display">
                        <span class="selected-count">${selected}</span>
                        <span class="total-count">/ ${roomType.available}</span>
                    </div>

                    <button type="button" class="room-control-btn plus" onclick="incrementRoomSelection('${roomType.id}')" ${disabled ? 'disabled' : ''}>
                        <i class="fa fa-plus"></i>
                    </button>
                </div>

                <div class="room-adults-info" ${selected === 0 ? 'style="display:none;"' : ''}>
                    <p>Guests in selected rooms:</p>
                    <div class="adults-list" id="adults-${roomType.id}">
                        ${generateAdultsDisplay(selected)}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    body.innerHTML = html;

    // Update progress
    updateRoomDistributionProgress();
}

/**
 * Generate adults display for rooms
 */
function generateAdultsDisplay(count) {
    let html = '';
    if (count === 0) return html;

    // Get room data from search bar if available
    const roomsData = window.rooms || [2]; // Default: [2] adults per room

    for (let i = 0; i < count; i++) {
        const adults = roomsData[i] || 2;
        html += `<span class="adult-badge">${adults} Adult${adults > 1 ? 's' : ''}</span>`;
    }
    return html;
}

/**
 * Increment room selection
 */
function incrementRoomSelection(roomTypeId) {
    const roomType = roomDistributionContext.allRoomTypes.find(r => r.id === roomTypeId);
    if (!roomType) return;

    const total = getTotalSelected();
    if (total < roomDistributionContext.totalRoomsNeeded) {
        roomDistributionContext.roomsData[roomTypeId] = (roomDistributionContext.roomsData[roomTypeId] || 0) + 1;

        // Check if exceeds available
        if (roomDistributionContext.roomsData[roomTypeId] > roomType.available) {
            roomDistributionContext.roomsData[roomTypeId] = roomType.available;
        }

        renderRoomDistributionModal();
    }
}

/**
 * Decrement room selection
 */
function decrementRoomSelection(roomTypeId) {
    const current = roomDistributionContext.roomsData[roomTypeId] || 0;
    if (current > 0) {
        roomDistributionContext.roomsData[roomTypeId] = current - 1;
        renderRoomDistributionModal();
    }
}

/**
 * Get total selected rooms
 */
function getTotalSelected() {
    return Object.values(roomDistributionContext.roomsData).reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Update progress bar
 */
function updateRoomDistributionProgress() {
    const total = getTotalSelected();
    const percentage = (total / roomDistributionContext.totalRoomsNeeded) * 100;

    const progressFill = document.getElementById('progressFill');
    const selectedCount = document.getElementById('selectedCount');

    if (progressFill) progressFill.style.width = Math.min(percentage, 100) + '%';
    if (selectedCount) selectedCount.textContent = total;
}

/**
 * Confirm room distribution
 */
function confirmRoomDistribution() {
    const total = getTotalSelected();

    if (total !== roomDistributionContext.totalRoomsNeeded) {
        alert(`Please select exactly ${roomDistributionContext.totalRoomsNeeded} room(s)`);
        return;
    }

    // Update the button with selection info
    const currentButton = document.querySelector(`.btn-room-selector[data-room-type-id="${roomDistributionContext.currentRoom}"]`);
    if (currentButton) {
        const selectedCount = roomDistributionContext.roomsData[roomDistributionContext.currentRoom] || 0;
        currentButton.setAttribute('data-selected-count', selectedCount);

        const textSpan = currentButton.querySelector('.room-selector-text');
        if (textSpan) {
            textSpan.textContent = selectedCount > 0 ? `${selectedCount} Room${selectedCount > 1 ? 's' : ''} Selected` : 'Select Rooms';
        }
    }

    console.log('Room distribution confirmed:', roomDistributionContext.roomsData);
    closeRoomDistributionModal();
}

/**
 * Close room distribution modal
 */
function closeRoomDistributionModal() {
    const overlay = document.getElementById('roomDistributionOverlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
}
