/**
 * Checkout Page Logic
 */

var checkoutBookings = {};
var checkoutSearchParams = {};

document.addEventListener('DOMContentLoaded', function () {
    loadBookingData();
    renderSummary();
    setupFormValidation();
});

/**
 * Load booking data from sessionStorage (saved from cabin page)
 */
function loadBookingData() {
    try {
        var saved = sessionStorage.getItem('cabinBookingState');
        if (saved) {
            checkoutBookings = JSON.parse(saved);
        }

        var params = sessionStorage.getItem('checkoutSearchParams');
        if (params) {
            checkoutSearchParams = JSON.parse(params);
        } else {
            var urlParams = new URLSearchParams(window.location.search);
            checkoutSearchParams = {
                personsCount: urlParams.get('persons_count') || 0,
                roomsCount: urlParams.get('rooms_count') || 0,
                currency: urlParams.get('currency') || 'EGP'
            };
        }
    } catch (e) {
        console.error('Failed to load booking data', e);
    }
}

/**
 * Render reservation summary from booking state
 */
function renderSummary() {
    var container = document.getElementById('checkoutSummaryItems');
    var totalEl = document.getElementById('checkoutTotalPrice');
    if (!container) return;

    var currency = (checkoutSearchParams && checkoutSearchParams.currency) || 'EGP';

    container.innerHTML = '';
    var grandTotal = 0;
    var hasItems = false;

    for (var roomTypeId in checkoutBookings) {
        var booking = checkoutBookings[roomTypeId];
        if (!booking || booking.quantity <= 0) continue;

        hasItems = true;
        grandTotal += booking.totalPrice || 0;

        var distributionStr = '';
        if (booking.roomsAdultsDistribution && booking.roomsAdultsDistribution.length > 0) {
            var totalGuests = booking.roomsAdultsDistribution.reduce(function (a, b) { return a + b; }, 0);
            distributionStr = booking.quantity + ' room(s) • ' + totalGuests + ' guest(s)';
            distributionStr += ' (' + booking.roomsAdultsDistribution.map(function (a, i) {
                return 'R' + (i + 1) + ': ' + a;
            }).join(', ') + ')';
        } else {
            var apr = booking.adultsPerRoom || 2;
            distributionStr = booking.quantity + ' room(s) × ' + apr + ' adult(s)';
        }

        var item = document.createElement('div');
        item.className = 'summary-room-item';
        item.innerHTML =
            '<p class="summary-room-name">' + escapeHtml(booking.name || 'Room') + '</p>' +
            '<p class="summary-room-detail">' + distributionStr + '</p>' +
            '<p class="summary-room-price">' + currency + ' ' + (booking.totalPrice || 0).toLocaleString() + '</p>';

        container.appendChild(item);
    }

    if (!hasItems) {
        container.innerHTML = '<p class="text-muted text-center">No rooms selected. Please go back and select rooms.</p>';
    }

    if (totalEl) {
        totalEl.textContent = currency + ' ' + grandTotal.toLocaleString();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Form validation & Pay Now toggle
 */
function setupFormValidation() {
    var form = document.getElementById('checkoutForm');
    var payBtn = document.getElementById('btnPayNow');

    if (!form || !payBtn) return;

    var requiredFields = form.querySelectorAll('[required]');

    function checkValid() {
        var allFilled = true;
        requiredFields.forEach(function (field) {
            if (field.type === 'checkbox') {
                if (!field.checked) allFilled = false;
            } else if (!field.value.trim()) {
                allFilled = false;
            }
        });
        payBtn.disabled = !allFilled;
    }

    requiredFields.forEach(function (field) {
        field.addEventListener('input', checkValid);
        field.addEventListener('change', checkValid);
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitCheckout();
    });
}

/**
 * Submit checkout
 */
async function submitCheckout() {
    var payBtn = document.getElementById('btnPayNow');
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';

    var payload = {
        guest: {
            first_name: document.getElementById('guestFirstName').value.trim(),
            last_name: document.getElementById('guestLastName').value.trim(),
            email: document.getElementById('guestEmail').value.trim(),
            mobile: document.getElementById('guestMobile').value.trim(),
            country_id: document.getElementById('guestCountry').value,
            notes: document.getElementById('guestNotes').value.trim()
        },
        bookings: checkoutBookings,
        searchParams: checkoutSearchParams
    };

    try {
        var cruiseId = null;
        for (var key in checkoutBookings) {
            if (checkoutBookings[key].cruiseId) {
                cruiseId = checkoutBookings[key].cruiseId;
                break;
            }
        }

        var response = await fetch('/cruises/' + (cruiseId || '0') + '/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        var data = await response.json();
        console.log("dataa", data);

        if (data.success) {
            sessionStorage.removeItem('cabinBookingState');
            sessionStorage.removeItem('cabinBookingPath');
            sessionStorage.removeItem('checkoutSearchParams');

            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert('Booking confirmed!');
            }
        } else {
            alert(data.error || 'Something went wrong. Please try again.');
            payBtn.disabled = false;
            payBtn.innerHTML = '<span class="pay-icon">🔒</span> Pay Now';
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Network error. Please try again.');
        payBtn.disabled = false;
        payBtn.innerHTML = '<span class="pay-icon">🔒</span> Pay Now';
    }
}

/**
 * Terms overlay functions
 */
function openTermsOverlay() {
    var overlay = document.getElementById('termsOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeTermsOverlay() {
    var overlay = document.getElementById('termsOverlay');
    if (overlay) overlay.classList.remove('active');
}

function acceptTermsFromOverlay() {
    var checkbox = document.getElementById('acceptTerms');
    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
    }
    closeTermsOverlay();
}

/**
 * Go back to cabin page preserving state
 */
function goBackToCabin() {
    window.history.back();
}

