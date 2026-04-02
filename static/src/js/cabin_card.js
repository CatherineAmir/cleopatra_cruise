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