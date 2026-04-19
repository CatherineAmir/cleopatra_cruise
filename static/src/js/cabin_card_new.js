/**
 * Cabin Card Booking System - Single Room Type Selection
 * Allows booking from one cabin type only with adult count selection
 */

// Global booking state
var bookingState = {
    bookings: {}, // { roomTypeId: { name, quantity, adultsPerRoom, pricePerRoom, totalPrice, roomsAdultsDistribution: [1,2,1,...] } }
    searchParams: {
        dateFrom: '',
        dateTo: '',
        personsCount: 0
    }
};

/**
 * Initialize booking system
 */
function initializeBookingSystem() {
    console.log('Initializing booking system...');
    updateBookingSummary();
}

/**
 * Get total persons booked across all room types
 */
function getTotalBookedPersons() {
    let totalPersons = 0;
    for (const booking of Object.values(bookingState.bookings)) {
        if (booking.roomsAdultsDistribution && booking.roomsAdultsDistribution.length > 0) {
            totalPersons += booking.roomsAdultsDistribution.reduce((a, b) => a + b, 0);
        } else if (booking.adultsPerRoom) {
            totalPersons += booking.quantity * booking.adultsPerRoom;
        }
    }
    return totalPersons;
}

/**
 * Get total rooms booked across all room types
 */
function getTotalBookedRooms() {
    let totalRooms = 0;
    for (const booking of Object.values(bookingState.bookings)) {
        if (booking.quantity > 0) {
            totalRooms += booking.quantity;
        }
    }
    return totalRooms;
}

/**
 * Get search parameters from page
 */
function getSearchParams() {
    // Try to get from global window object or sessionStorage
    console.log("window.location: ", window.location);
    const params = new URLSearchParams(window.location.search);


    if (params) {
        // console.log("will return search params ");
        return {
            personsCount: params.get('persons_count'),
            roomsCount: params.get('rooms_count'),
            currency: params.get('currency') || 'EGP'
        };
        // return params;
    }

    // Try to parse from sessionStorage
    const stored = sessionStorage.getItem('searchParams');
    if (stored) {
        return JSON.parse(stored);
    }

    // Return default if not found
    return {
        personsCount: 0,
        roomsCount: 0,
        currency: 'EGP'
    };
}

/**
 * Increment room quantity for a specific cabin type
 */
function incrementRoomQty(button, roomTypeId, maxAllowed) {
    const card = button.closest('.cabin-card-horizontal');
    if (!card) return;

    const input = card.querySelector('.room-qty-input');
    if (!input) return;

    // Get search parameters
    const searchParams = getSearchParams();
    const requiredPersons = parseInt(searchParams.personsCount) || 0;
    const requiredRooms = parseInt(searchParams.roomsCount) || 0;
    console.log("requiredPersons: ", requiredPersons);
    console.log("requiredRooms: ", requiredRooms);

    // Check if persons limit reached
    if (requiredPersons > 0) {
        const totalBooked = getTotalBookedPersons();
        console.log("Total booked persons: ", totalBooked);
        if (totalBooked >= requiredPersons) {
            alert(`✗ Maximum persons (${requiredPersons}) already booked. You cannot add more rooms.`);
            // Disable the button
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            return;
        }
    }

    // Check if rooms limit reached
    if (requiredRooms > 0) {
        const totalRoomsBooked = getTotalBookedRooms();
        console.log("Total rooms booked: ", totalRoomsBooked);
        if (totalRoomsBooked >= requiredRooms) {
            alert(`✗ Maximum rooms (${requiredRooms}) already booked. You cannot add more rooms.`);
            // Disable the button
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            return;
        }
    }

    let currentQty = parseInt(input.value) || 0;

    if (currentQty < maxAllowed) {
        currentQty++;
        input.value = currentQty;

        // Show adults selector
        const adultsSelector = card.querySelector('.adults-selector');
        if (adultsSelector) {
            adultsSelector.style.display = currentQty > 0 ? 'block' : 'none';
        }

        // Initialize adults per room if not already set
        // todo changed here

        // if (currentQty > 0 && !bookingState.bookings[roomTypeId]) {
        //     bookingState.bookings[roomTypeId] = {
        //         name: card.querySelector('.cabin-name').textContent.trim(),
        //         quantity: currentQty,
        //         roomsAdultsDistribution: Array(currentQty).fill(2), // Initialize with 2 adults per room
        //         pricePerRoom: 0,
        //         totalPrice: 0
        //     };
        // } else if (bookingState.bookings[roomTypeId]) {
        //     // Update quantity and extend distribution array if needed
        //     bookingState.bookings[roomTypeId].quantity = currentQty;
        //     if (!bookingState.bookings[roomTypeId].roomsAdultsDistribution) {
        //         bookingState.bookings[roomTypeId].roomsAdultsDistribution = Array(currentQty).fill(2);
        //     } else if (bookingState.bookings[roomTypeId].roomsAdultsDistribution.length < currentQty) {
        //         // Add new rooms with default 2 adults
        //         while (bookingState.bookings[roomTypeId].roomsAdultsDistribution.length < currentQty) {
        //             bookingState.bookings[roomTypeId].roomsAdultsDistribution.push(2);
        //         }
        //     }
        // }

        // Update all button states
        updateAllButtonStates();
    }
}

/**
 * Update all button states based on persons limit
 */
function updateAllButtonStates() {
    const searchParams = getSearchParams();
    const requiredPersons = parseInt(searchParams.personsCount) || 0;
    const requiredRooms = parseInt(searchParams.roomsCount) || 0;

    const totalBooked = getTotalBookedPersons();
    const totalRoomsBooked = getTotalBookedRooms();

    const personsLimitReached = requiredPersons > 0 && totalBooked >= requiredPersons;
    console.log("totalBooked", totalBooked)
    console.log("totalRoomsBooked", totalRoomsBooked)
    console.log("personsLimitReached", personsLimitReached)

    const roomsLimitReached = requiredRooms > 0 && totalRoomsBooked >= requiredRooms;
    const limitReached = personsLimitReached || roomsLimitReached;
    console.log("roomsLimitReached", roomsLimitReached)
    console.log("limitReached", limitReached);
    // Update all cabin cards
    document.querySelectorAll('.cabin-card-horizontal').forEach(card => {
        const plusBtn = card.querySelector('.qty-btn.plus');
        const addBtn = card.querySelector('.btn-add-room');
        const configBtn = card.querySelector('.btn-set-adults');
        const minusBtn = card.querySelector('.qty-btn.minus');
        const qtyInput = card.querySelector('.room-qty-input');

        let limitMessage = '';
        if (personsLimitReached && roomsLimitReached) {
            limitMessage = `Max persons (${requiredPersons}) and rooms (${requiredRooms}) reached`;
        } else if (personsLimitReached) {
            limitMessage = `Max persons (${requiredPersons}) reached`;
        } else if (roomsLimitReached) {
            limitMessage = `Max rooms (${requiredRooms}) reached`;
        }

        console.log("limitReached: ", limitReached, " - ", limitMessage);
        console.log("bookingState.bookings", bookingState.bookings);


        if (limitReached) {
            // todo
            // Disable all buttons and interactions when limit is reached
            // if (plusBtn) {
            //     plusBtn.disabled = true;
            //     plusBtn.style.opacity = '0.5';
            //     plusBtn.style.cursor = 'not-allowed';
            //     plusBtn.title = limitMessage;
            //     plusBtn.style.pointerEvents = 'none';
            // }
            // if (addBtn) {
            //     addBtn.disabled = true;
            //     addBtn.style.opacity = '0.5';
            //     addBtn.style.cursor = 'not-allowed';
            //     addBtn.title = limitMessage;
            //     addBtn.style.pointerEvents = 'none';
            // }
            // if (configBtn) {
            //     configBtn.disabled = true;
            //     configBtn.style.opacity = '0.5';
            //     configBtn.style.cursor = 'not-allowed';
            //     configBtn.title = limitMessage;
            //     configBtn.style.pointerEvents = 'none';
            // }
            // // Keep minus button enabled to allow removal
            // if (minusBtn) {
            //     minusBtn.disabled = false;
            //     minusBtn.style.opacity = '1';
            //     minusBtn.style.cursor = 'pointer';
            //     minusBtn.style.pointerEvents = 'auto';
            // }
            // if (qtyInput) {
            //     qtyInput.style.opacity = '0.7';
            //  }
        } else {
            // Enable buttons when limit not reached
            if (plusBtn) {
                plusBtn.disabled = false;
                plusBtn.style.opacity = '1';
                plusBtn.style.cursor = 'pointer';
                plusBtn.style.pointerEvents = 'auto';
                plusBtn.title = '';
            }
            if (addBtn) {
                addBtn.disabled = false;
                addBtn.style.opacity = '1';
                addBtn.style.cursor = 'pointer';
                addBtn.style.pointerEvents = 'auto';
                addBtn.title = '';
            }
            if (configBtn) {
                configBtn.disabled = false;
                configBtn.style.opacity = '1';
                configBtn.style.cursor = 'pointer';
                configBtn.style.pointerEvents = 'auto';
                configBtn.title = '';
            }
            if (minusBtn) {
                minusBtn.disabled = false;
                minusBtn.style.opacity = '1';
                minusBtn.style.cursor = 'pointer';
                minusBtn.style.pointerEvents = 'auto';
            }
            if (qtyInput) {
                qtyInput.style.opacity = '1';
            }
        }
    });
}

/**
 * Decrement room quantity for a specific cabin type
 */
function decrementRoomQty(button, roomTypeId) {
    const card = button.closest('.cabin-card-horizontal');
    if (!card) return;

    const input = card.querySelector('.room-qty-input');
    if (!input) return;

    let currentQty = parseInt(input.value) || 0;

    if (currentQty > 0) {
        currentQty--;
        input.value = currentQty;

        // Hide adults selector
        const adultsSelector = card.querySelector('.adults-selector');
        if (adultsSelector) {
            adultsSelector.style.display = currentQty > 0 ? 'block' : 'none';
        }

        // Clear selection if quantity is 0
        if (currentQty === 0) {
            delete bookingState.bookings[roomTypeId];
            const adultsInfo = card.querySelector('.selected-adults-info');
            if (adultsInfo) adultsInfo.style.display = 'none';
        } else if (bookingState.bookings[roomTypeId]) {
            // Trim distribution array to match quantity
            bookingState.bookings[roomTypeId].quantity = currentQty;
            if (bookingState.bookings[roomTypeId].roomsAdultsDistribution) {
                bookingState.bookings[roomTypeId].roomsAdultsDistribution = bookingState.bookings[roomTypeId].roomsAdultsDistribution.slice(0, currentQty);
            }
        }
    }
}

/**
 * Set adults per room count - Opens modal for individual room selection
 */
function setAdultsPerRoom(button, roomTypeId, adultsCount) {
    const card = button.closest('.cabin-card-horizontal');
    if (!card) return;

    const qty = parseInt(card.querySelector('.room-qty-input').value) || 0;
    if (qty === 0) return;

    // Get search parameters
    const searchParams = getSearchParams();
    const requiredPersons = parseInt(searchParams.personsCount) || 0;

    // Check if persons limit would be exceeded
    if (requiredPersons > 0) {
        const totalBooked = getTotalBookedPersons();
        const estimatedTotal = totalBooked + (qty * 2); // Estimate with 2 adults per room

        if (estimatedTotal > requiredPersons) {
            const warning = `⚠️ Adding ${qty} room(s) may exceed the required ${requiredPersons} persons. Please adjust accordingly.`;
            console.warn(warning);
        }
    }

    // Open the room distribution modal for individual adult selection
    openRoomAdultsDistributionModal(card, roomTypeId, qty);
}

/**
 * Open modal to set individual adults for each room
 */
function openRoomAdultsDistributionModal(card, roomTypeId, roomQuantity) {
    // Initialize adults distribution array if not already set
    if (!bookingState.bookings[roomTypeId]) {
        bookingState.bookings[roomTypeId] = {
            name: card.querySelector('.cabin-name').textContent.trim(),
            quantity: roomQuantity,
            roomsAdultsDistribution: Array(roomQuantity).fill(2), // Default 2 adults per room
            pricePerRoom: 0,
            totalPrice: 0
        };
    } else if (!bookingState.bookings[roomTypeId].roomsAdultsDistribution) {
        bookingState.bookings[roomTypeId].roomsAdultsDistribution = Array(roomQuantity).fill(2);
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'room-adults-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) closeRoomAdultsModal(modalOverlay);
    };

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'room-adults-modal';
    modal.style.cssText = `
        background: linear-gradient(135deg, #0f2540 0%, #0a1c33 100%);
        border: 1px solid rgba(201,168,76,0.3);
        border-radius: 12px;
        padding: 25px;
        width: 90%;
        max-width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        color: white;
    `;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(201,168,76,0.3); padding-bottom: 15px;">
            <h3 style="margin: 0; font-size: 20px; color: #c9a84c;">👥 Guests Distribution</h3>
            <button onclick="this.closest('.room-adults-modal-overlay').remove()" style="background: none; border: none; color: #c9a84c; font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div style="margin-bottom: 20px; padding: 12px; background: rgba(201,168,76,0.08); border-radius: 6px; border-left: 3px solid #c9a84c;">
            <p style="margin: 0; font-size: 13px; color: #d4d4d4;">Select the number of adults for each room in <strong>${bookingState.bookings[roomTypeId].name}</strong></p>
        </div>
        <div class="room-adults-list" style="display: flex; flex-direction: column; gap: 12px;">
    `;

    // Create selector for each room
    for (let i = 0; i < roomQuantity; i++) {
        const currentAdults = bookingState.bookings[roomTypeId].roomsAdultsDistribution[i] || 2;
        html += `
            <div class="room-adult-selector" data-room-index="${i}" style="
                padding: 12px;
                background: rgba(201,168,76,0.08);
                border: 1px solid rgba(201,168,76,0.2);
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <label style="font-size: 14px; color: #c9a84c; font-weight: 600;">Room ${i + 1}:</label>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="adult-count-btn" onclick="setIndividualRoomAdults('${roomTypeId}', ${i}, 1)" style="
                        padding: 8px 12px;
                        background: ${currentAdults === 1 ? 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 100%)' : 'rgba(201,168,76,0.15)'};
                        color: ${currentAdults === 1 ? '#0f2540' : '#c9a84c'};
                        border: 1px solid #c9a84c;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s;
                    ">1 Adult</button>
                    <button type="button" class="adult-count-btn" onclick="setIndividualRoomAdults('${roomTypeId}', ${i}, 2)" style="
                        padding: 8px 12px;
                        background: ${currentAdults === 2 ? 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 100%)' : 'rgba(201,168,76,0.15)'};
                        color: ${currentAdults === 2 ? '#0f2540' : '#c9a84c'};
                        border: 1px solid #c9a84c;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s;
                    ">2 Adults</button>
                </div>
            </div>
        `;
    }

    html += `
        </div>
        <div style="margin-top: 20px; padding: 12px; background: rgba(232,201,122,0.1); border-radius: 6px; border: 1px solid rgba(232,201,122,0.3);">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase;">Total Guests:</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #e8c97a;" id="totalGuestsDisplay">
                ${bookingState.bookings[roomTypeId].roomsAdultsDistribution.reduce((a, b) => a + b, 0)} guests
            </p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="button" onclick="this.closest('.room-adults-modal-overlay').remove()" style="
                flex: 1;
                padding: 12px;
                background: rgba(201,168,76,0.15);
                border: 1px solid rgba(201,168,76,0.3);
                color: #c9a84c;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            ">Cancel</button>
            <button type="button" onclick="confirmRoomAdultsDistribution('${roomTypeId}'); this.closest('.room-adults-modal-overlay').remove();" style="
                flex: 1;
                padding: 12px;
                background: linear-gradient(135deg, #c9a84c 0%, #e8c97a 100%);
                color: #0f2540;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 700;
                transition: all 0.3s;
            ">Confirm</button>
        </div>
    `;

    modal.innerHTML = html;
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

/**
 * Set adults for individual room
 */
function setIndividualRoomAdults(roomTypeId, roomIndex, adultsCount) {
    if (bookingState.bookings[roomTypeId] && bookingState.bookings[roomTypeId].roomsAdultsDistribution) {
        bookingState.bookings[roomTypeId].roomsAdultsDistribution[roomIndex] = adultsCount;

        // Update UI - buttons styling
        const buttons = document.querySelectorAll(`.room-adult-selector[data-room-index="${roomIndex}"] .adult-count-btn`);
        buttons.forEach((btn, idx) => {
            const btnAdults = idx === 0 ? 1 : 2;
            if (btnAdults === adultsCount) {
                btn.style.background = 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 100%)';
                btn.style.color = '#0f2540';
            } else {
                btn.style.background = 'rgba(201,168,76,0.15)';
                btn.style.color = '#c9a84c';
            }
        });

        // Update total guests display
        const totalDisplay = document.getElementById('totalGuestsDisplay');
        if (totalDisplay) {
            const totalGuests = bookingState.bookings[roomTypeId].roomsAdultsDistribution.reduce((a, b) => a + b, 0);
            totalDisplay.textContent = totalGuests + ' guests';
        }
    }
}

/**
 * Confirm room adults distribution
 */
function confirmRoomAdultsDistribution(roomTypeId) {
    if (bookingState.bookings[roomTypeId]) {
        // Calculate total adults
        const totalAdults = bookingState.bookings[roomTypeId].roomsAdultsDistribution.reduce((a, b) => a + b, 0);

        // Update the cabin card display
        const card = document.querySelector(`.cabin-card-horizontal [data-room-id="${roomTypeId}"]`)?.closest('.cabin-card-horizontal');
        if (card) {
            const adultsInfo = card.querySelector('.selected-adults-info');
            if (adultsInfo) {
                const qty = bookingState.bookings[roomTypeId].quantity;
                const distribution = bookingState.bookings[roomTypeId].roomsAdultsDistribution.map((a, i) => `Room ${i + 1}: ${a}🧑`).join(', ');
                adultsInfo.innerHTML = `
                    <div style="font-size: 11px; color: #e8c97a;">
                        <div><strong>${qty} room(s)</strong> = <strong>${totalAdults} total guests</strong></div>
                        <div style="margin-top: 4px; font-size: 10px; color: #c9a84c; max-height: 40px; overflow-y: auto;">${distribution}</div>
                    </div>
                `;
                adultsInfo.style.display = 'block';
            }
        }

        updateBookingSummary();
    }
}

/**
 * Close room adults modal
 */
function closeRoomAdultsModal(overlay) {
    overlay.remove();
}

/**
 * Add room booking to cart
 */
function addRoomToBooking(button, roomTypeId) {
    const card = button.closest('.cabin-card-horizontal');
    if (!card) return;

    const qtyInput = card.querySelector('.room-qty-input');
    const quantity = parseInt(qtyInput.value) || 0;

    if (quantity === 0) {
        alert('Please select at least 1 room');
        return;
    }

    // Check if adults per room is selected
    if (!bookingState.bookings[roomTypeId] || (!bookingState.bookings[roomTypeId].adultsPerRoom && !bookingState.bookings[roomTypeId].roomsAdultsDistribution)) {
        alert('Please select number of adults per room');
        return;
    }

    // Get search parameters
    const searchParams = getSearchParams();
    console.log("Search parameters on add: ", searchParams);
    const requiredPersons = parseInt(searchParams.personsCount) || 0;
    const requiredRooms = parseInt(searchParams.roomsCount) || 0;
    console.log("requiredPersons: ", requiredPersons);
    // Check persons limit
    // if (requiredPersons > 0) {
    //     const totalBooked = getTotalBookedPersons();
    //     console.log("Total booked persons before adding: ", totalBooked);
    //     const newGuests = bookingState.bookings[roomTypeId].roomsAdultsDistribution ?
    //         bookingState.bookings[roomTypeId].roomsAdultsDistribution.reduce((a, b) => a + b, 0) :
    //         (quantity * (bookingState.bookings[roomTypeId].adultsPerRoom || 2));
    //     const totalAfterBooking = totalBooked + newGuests;
    //
    //     if (totalAfterBooking > requiredPersons) {
    //         alert(`✗ Cannot add booking!\n\nRequired persons: ${requiredPersons}\nAlready booked: ${totalBooked}\nAttempting to add: ${newGuests}\nTotal would be: ${totalAfterBooking}\n\nPlease reduce the number of rooms or adults per room.`);
    //         return;
    //     }
    // }
    //
    // // Check rooms limit
    // if (requiredRooms > 0) {
    //     const totalRoomsBooked = getTotalBookedRooms();
    //     const totalRoomsAfterBooking = totalRoomsBooked + quantity;
    //
    //     if (totalRoomsAfterBooking > requiredRooms) {
    //         alert(`✗ Cannot add booking!\n\nRequired rooms: ${requiredRooms}\nAlready booked: ${totalRoomsBooked}\nAttempting to add: ${quantity}\nTotal would be: ${totalRoomsAfterBooking}\n\nPlease reduce the number of rooms.`);
    //         return;
    //     }
    // }

    // Get price
    const priceSpan = card.querySelector('.price-amount span');
    const priceSingleSpan = card.querySelector('.single-price-room span');


    if (!priceSpan) {

    }
    console.log("adults distribution: ", bookingState.bookings[roomTypeId].roomsAdultsDistribution);

    const singlePrice = priceSingleSpan ? parseInt(priceSingleSpan.textContent.replace(/,/g, '')) : null;
    console.log("singlePrice: ", singlePrice);
    let pricePerRoom = priceSpan ? parseInt(priceSpan.textContent.replace(/,/g, '')) : 0;
    const cruiseId = priceSpan ? priceSpan.getAttribute('data-cruise-id') : null;
    // if (quantity ===1) {
    //     pricePerRoom=singlePrice || pricePerRoom;
    // }
    let totalPrice = 0
    for (let adults of bookingState.bookings[roomTypeId].roomsAdultsDistribution){
        console.log("adults: ", adults);
        if (adults === 1){
            console.log("single price will be used for room with 1 adult: ", singlePrice);
            totalPrice+=singlePrice;
        }
        else {
            totalPrice+=pricePerRoom;
        }
    }
    // Store booking data before clearing
    const bookingData = {
        id: roomTypeId,
        name: card.querySelector('.cabin-name').textContent.trim(),
        quantity: quantity,
        adultsPerRoom: bookingState.bookings[roomTypeId].adultsPerRoom || null,
        roomsAdultsDistribution: bookingState.bookings[roomTypeId].roomsAdultsDistribution || [],
        pricePerRoom: totalPrice ,
        totalPrice: totalPrice,
        cruiseId: cruiseId
    };

    // Update booking with stored data
    bookingState.bookings[roomTypeId] = bookingData;

    // Show success
    // showNotification(button, `${quantity} room(s) added to booking!`);
    console.log("Current booking state: ", bookingState);


    checkPersonsLimit();
    // Update summary
    updateBookingSummary();
}


function checkPersonsLimit() {
    const searchParams = getSearchParams();
    const requiredPersons = parseInt(searchParams.personsCount) || 0;
    const requiredRooms = parseInt(searchParams.roomsCount) || 0;
    const totalPersons=getTotalBookedPersons();
    const totalRooms=getTotalBookedRooms();
    console.log("bookingState.bookings in  checkPersonsLimit",bookingState.bookings)
    //
    if (totalPersons > requiredPersons) {
        alert(`✗ Cannot add booking!\n\nRequired persons: ${requiredPersons}\nAlready booked: ${totalPersons}\n`);

        // Attempting to add: ${newGuests}\nTotal would be: ${totalAfterBooking}\n\nPlease reduce the number of rooms or adults per room.`);
        return;
    }
    //
    //
    // if (requiredPersons > 0) {
    //     const totalBooked = getTotalBookedPersons();
    //     console.log("Total booked persons before adding: ", totalBooked);
    //     const newGuests = bookingState.bookings[roomTypeId].roomsAdultsDistribution ?
    //         bookingState.bookings[roomTypeId].roomsAdultsDistribution.reduce((a, b) => a + b, 0) :
    //         (quantity * (bookingState.bookings[roomTypeId].adultsPerRoom || 2));
    //     const totalAfterBooking = totalBooked + newGuests;
    //
    //     if (totalAfterBooking > requiredPersons) {
    //         alert(`✗ Cannot add booking!\n\nRequired persons: ${requiredPersons}\nAlready booked: ${totalBooked}\nAttempting to add: ${newGuests}\nTotal would be: ${totalAfterBooking}\n\nPlease reduce the number of rooms or adults per room.`);
    //         return;
    //     }
    // }
    //
    if (requiredRooms > 0) {
        const totalRoomsBooked = getTotalBookedRooms();
        // const totalRoomsAfterBooking = totalRoomsBooked + quantity;

        if (totalRoomsBooked > requiredRooms) {
            alert(`✗ Cannot add booking!\n\nRequired rooms: ${requiredRooms}\nAlready booked: ${totalRoomsBooked}\nAttempting to add: ${quantity}\nTotal would be: ${totalRoomsAfterBooking}\n\nPlease reduce the number of rooms.`);
            return;
        }
    }

}

/**
 * Show notification feedback
 */
function showNotification(element, message) {
    const btn = element;
    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.background;

    btn.innerHTML = '✓ ' + message;
    btn.style.background = 'rgba(76, 175, 80, 0.8)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = originalBg;
        btn.disabled = false;
    }, 2000);
}

/**
 * Update booking summary card
 */
function updateBookingSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const totalPrice = document.getElementById('totalPrice');

    if (!summaryItems) return;

    // Clear previous items
    summaryItems.innerHTML = '';

    let grandTotal = 0;
    let hasBookings = false;

    // Add each booking to summary
    for (const [roomTypeId, booking] of Object.entries(bookingState.bookings)) {
        if (booking.quantity > 0) {
            hasBookings = true;
            grandTotal += booking.totalPrice;

            const item = document.createElement('div');
            item.className = 'summary-item';
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                background: rgba(201,168,76,0.08);
                border: 1px solid rgba(201,168,76,0.2);
                border-radius: 6px;
            `;

            const details = document.createElement('div');
            details.style.cssText = 'flex: 1;';

            // Build distribution string showing adults for each room
            let distributionStr = '';
            if (booking.roomsAdultsDistribution && booking.roomsAdultsDistribution.length > 0) {
                const totalGuests = booking.roomsAdultsDistribution.reduce((a, b) => a + b, 0);
                distributionStr = `${booking.quantity} room(s) • ${totalGuests} guest(s) (`;
                distributionStr += booking.roomsAdultsDistribution.map((a, i) => `R${i + 1}: ${a}`).join(', ') + ')';
            } else {
                const adultsPerRoom = booking.adultsPerRoom || 2;
                const totalGuests = booking.quantity * adultsPerRoom;
                distributionStr = `${booking.quantity} room(s) × ${adultsPerRoom} adult(s) = ${totalGuests} guest(s)`;
            }

            details.innerHTML = `
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #fff;">${booking.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #c9a84c;">
                    ${distributionStr}
                </p>
            `;

            const price = document.createElement('div');
            price.style.cssText = 'text-align: right;';
            price.innerHTML = `
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #e8c97a;">
                    ${getSearchParams().currency} ${booking.totalPrice.toLocaleString()}
                </p>
                <button type="button" onclick="removeBooking('${roomTypeId}')" style="margin-top: 4px; background: rgba(255,59,48,0.2); border: 1px solid rgba(255,59,48,0.4); color: #ff3b30; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: 600; transition: all 0.3s;">Remove</button>
            `;

            item.appendChild(details);
            item.appendChild(price);
            summaryItems.appendChild(item);
        }
    }

    // Show empty message if no bookings
    if (!hasBookings) {
        summaryItems.innerHTML = '<p class="empty-message" style="color: #999; font-size: 13px; text-align: center; margin: auto;">No rooms selected yet</p>';
    }

    // Update total price
    if (totalPrice) {
        totalPrice.textContent = getSearchParams().currency + ' ' + grandTotal.toLocaleString();
    }

    // Update button states based on current bookings
    updateAllButtonStates();
}

/**
 * Remove a booking from summary
 */
function removeBooking(roomTypeId) {
    if (bookingState.bookings[roomTypeId]) {
        delete bookingState.bookings[roomTypeId];
        updateBookingSummary();

        // Update button states to re-enable if limit is no longer reached
        updateAllButtonStates();

        // Reset the cabin card
        const allCards = document.querySelectorAll('.cabin-card-horizontal');
        allCards.forEach(card => {
            const input = card.querySelector('.room-qty-input');
            if (input && input.getAttribute('data-room-id') == roomTypeId) {
                input.value = 0;
                const adultsSelector = card.querySelector('.adults-selector');
                if (adultsSelector) {
                    adultsSelector.style.display = 'none';
                }
            }
        });
    }
}

/**
 * Clear all bookings
 */
function clearAllBookings() {
    bookingState.bookings = {};
    updateBookingSummary();

    // Reset all cabin cards
    document.querySelectorAll('.room-qty-input').forEach(input => {
        input.value = 0;
    });
    document.querySelectorAll('.adults-selector').forEach(selector => {
        selector.style.display = 'none';
    });
}

/**
 * Proceed to checkout
 */
async function proceedToCheckout() {
    const hasBookings = Object.keys(bookingState.bookings).length > 0;

    if (!hasBookings) {
        alert('Please select at least one room type');
        return;
    }

    console.log("bookingState.bookings ", bookingState.bookings);
    console.log('Proceeding to checkout with:', bookingState.bookings);
    console.log('Search parameters:', getSearchParams());

    // Save booking state and search params for checkout page
    saveBookingStateToSession();
    sessionStorage.setItem('checkoutSearchParams', JSON.stringify(getSearchParams()));

    // Get cruise ID from first booking
    let cruiseId = null;
    for (const booking of Object.values(bookingState.bookings)) {
        if (booking.cruiseId) {
            cruiseId = booking.cruiseId;
            break;
        }
    }

    // Redirect to checkout page
    window.location.href = '/cruises/' + (cruiseId || '0') + '/checkout';
}

/**
 * Initialize carousels for cabin cards
 */
function initializeCarousels() {
    console.log('Initializing carousels...');

    const carousels = document.querySelectorAll('.cabin-card-horizontal');
    console.log('Found ' + carousels.length + ' cabin cards');

    carousels.forEach((card, cardIndex) => {
        const track = card.querySelector('.carousel-track');
        const slides = card.querySelectorAll('.carousel-slide');

        if (track && slides.length > 0) {
            console.log('Carousel ' + cardIndex + ' has ' + slides.length + ' slides');
            track.style.transform = 'translateX(0%)';

            const indicators = card.querySelectorAll('.indicator');
            if (indicators.length > 0) {
                indicators[0].classList.add('active');
            }
        }
    });
}

/**
 * Carousel navigation functions
 */
function getCurrentSlideIndex(element) {
    const track = element.closest('.carousel-wrapper')?.querySelector('.carousel-track') ||
        element.querySelector('.carousel-track');
    if (!track) return 0;

    const transform = window.getComputedStyle(track).transform;
    const matrix = transform.match(/^matrix\((.+)\)$/);
    if (!matrix) return 0;

    const translateX = parseFloat(matrix[1].split(', ')[4]);
    const containerWidth = track.parentElement.offsetWidth;
    return Math.round(-translateX / containerWidth);
}

function moveToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const track = card.querySelector('.carousel-track');
    const slides = card.querySelectorAll('.carousel-slide');

    if (!track || slides.length === 0) return;

    slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    track.style.transform = `translateX(${-slideIndex * 100}%)`;

    const indicators = card.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === slideIndex);
    });
}

function nextSlide(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    let currentIndex = getCurrentSlideIndex(card);
    let nextIndex = (currentIndex + 1) % slides.length;

    moveToSlide(card, nextIndex);
}

function prevSlide(element) {
    const card = element.closest('.cabin-card-horizontal');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    let currentIndex = getCurrentSlideIndex(card);
    let prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;

    moveToSlide(card, prevIndex);
}

function goToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card-horizontal');
    if (card) moveToSlide(card, slideIndex);
}

/**
 * Bootstrap accordion toggle handler
 */
/**
 * Save booking state to sessionStorage before page unload (e.g. search form submit)
 */
function saveBookingStateToSession() {
    try {
        sessionStorage.setItem('cabinBookingState', JSON.stringify(bookingState.bookings));
        // Store the current cruise path to only restore on same cruise
        sessionStorage.setItem('cabinBookingPath', window.location.pathname);
    } catch (e) {
        console.warn('Could not save booking state', e);
    }
}

/**
 * Restore booking state from sessionStorage
 */
function restoreBookingStateFromSession() {
    try {
        const savedPath = sessionStorage.getItem('cabinBookingPath');
        // Only restore if we're on the same cruise cabin page
        if (savedPath && savedPath === window.location.pathname) {
            const saved = sessionStorage.getItem('cabinBookingState');
            if (saved) {
                bookingState.bookings = JSON.parse(saved);
                // Restore UI for each booking
                for (const [roomTypeId, booking] of Object.entries(bookingState.bookings)) {
                    if (booking.quantity > 0) {
                        // Find the card and restore qty input
                        const allCards = document.querySelectorAll('.cabin-card-horizontal');
                        allCards.forEach(card => {
                            const input = card.querySelector('.room-qty-input');
                            const addBtn = card.querySelector('.btn-add-room');
                            if (input && input.getAttribute('data-room-id') == roomTypeId) {
                                input.value = booking.quantity;
                                // Show adults selector
                                const adultsSelector = card.querySelector('.adults-selector');
                                if (adultsSelector) adultsSelector.style.display = 'block';
                                // Restore adults info display
                                const adultsInfo = card.querySelector('.selected-adults-info');
                                if (adultsInfo && booking.roomsAdultsDistribution && booking.roomsAdultsDistribution.length > 0) {
                                    const totalAdults = booking.roomsAdultsDistribution.reduce((a, b) => a + b, 0);
                                    const distribution = booking.roomsAdultsDistribution.map((a, i) => `Room ${i + 1}: ${a}🧑`).join(', ');
                                    adultsInfo.innerHTML = `
                                        <div style="font-size: 11px; color: #e8c97a;">
                                            <div><strong>${booking.quantity} room(s)</strong> = <strong>${totalAdults} total guests</strong></div>
                                            <div style="margin-top: 4px; font-size: 10px; color: #c9a84c; max-height: 40px; overflow-y: auto;">${distribution}</div>
                                        </div>
                                    `;
                                    adultsInfo.style.display = 'block';
                                }
                            }
                        });
                    }
                }
                updateBookingSummary();
                console.log('Restored booking state from session');
            }
        }
    } catch (e) {
        console.warn('Could not restore booking state', e);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeBookingSystem();
    initializeCarousels();
    restoreBookingStateFromSession();

    // Save state before search form submits
    var searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function () {
            saveBookingStateToSession();
        });
    }

    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const targetId = btn.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);
            if (!target) return;

            const isOpen = target.classList.contains('show');
            target.classList.toggle('show', !isOpen);
            btn.classList.toggle('collapsed', isOpen);
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });
});

