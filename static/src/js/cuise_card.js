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

function bookNowWithCurrentParams(btn){
    console.log("Book Now clicked with current params");
    const dateFrom = document.getElementById('dateFromInput').value;
    const dateTo = document.getElementById('dateToInput').value;
    const personCount = document.getElementById('personsCountInput').value;
    const roomsCount = document.getElementById('roomsCountInput').value;
    const roomsDataInput = document.getElementById('roomsDataInput').value;
    const currency = document.getElementById('currencySelect') ? document.getElementById('currencySelect').value : 'EGP';
    const dataCruiseId = btn.dataset.cruiseId;
    const url = `/cruises/${dataCruiseId}?date_from=${dateFrom}&date_to=${dateTo}&persons_count=${personCount}&rooms_count=${roomsCount}&rooms_data=${encodeURIComponent(roomsDataInput)}&currency=${currency}`;
    console.log("Redirecting to:", url);
    window.location.href = url;
}
