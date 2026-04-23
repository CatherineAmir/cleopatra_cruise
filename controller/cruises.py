# -*- coding: utf-8 -*-
import ast
from datetime import datetime, date, timedelta
from odoo.osv import expression
from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)
import json as _json

class CruisesController(http.Controller):
    """Controller class to handle HTTP routes."""

    @http.route('/cruises', auth='public', website=True, methods=["GET", "POST"], csrf=False, )
    def index(self, **kw):
        _logger.info("===== /cruises called =====")
        _logger.info("Request params: %s", kw)
        date_from = kw.get('date_from', False)
        rooms_count = int(kw.get('rooms_count', 1))
        try:
            rooms_data = ast.literal_eval(kw.get('rooms_data', "[2]"))
        except Exception as e:
            _logger.error("Failed to parse rooms_data: %s — defaulting to [2]", e)
            rooms_data = [2]
        _logger.info("rooms_data=%s, rooms_count=%s", rooms_data, rooms_count)
        persons_count = sum(rooms_data)
        _logger.info("persons_count=%s", persons_count)
        currency = kw.get('currency', 'EGP')
        _logger.info("currency=%s", currency)
        date_from_str = kw.get('date_from', '')
        date_to_str = kw.get('date_to', '')
        domain = [("available_for_booking", "=", True), ("start_date", '>', date.today())]
        if date_from:
            date_from_dt = datetime.strptime(date_from, "%Y-%m-%d")
            domain = expression.AND([domain, [("start_date", ">=", date_from_dt)]])
            _logger.info("Filtering cruises from date: %s", date_from_dt)

        date_to = kw.get('date_to', False)
        _logger.info("date_to parameter: %s", date_to)
        if date_to:
            # date_to[-2:]="30"

            date_to_dt = datetime.strptime(date_to, "%Y-%m-%d")
            domain = expression.AND([domain, [("start_date", "<=", date_to_dt)]])
            _logger.info("Filtering cruises to date: %s", date_to_dt)
        _logger.info("Search domain: %s", domain)
        cruises = request.env['cruise.cruise'].sudo().search(domain, order="start_date")
        if cruises:
            property_id = cruises.mapped('property_id')[0]
            _logger.info("Found %d cruise(s), property_id=%s", len(cruises), property_id.id)
            data = {
                'cruises': cruises,
                "persons_count": int(persons_count),
                "date_from": date_from_str,
                "date_to": date_to_str,
                "property_id": property_id,
                "rooms_count": rooms_count,
                "rooms_data": rooms_data,
                "currency": currency,
            }
            return request.render('cleopatra_cruise.main_cruise_page', data)

        else:
            _logger.info("No cruises found for the given filters")
            data = {

                "persons_count": int(persons_count),
                "date_from": date_from_str,
                "date_to": date_to_str,
                "cruises":False,
                "rooms_count": rooms_count,
                "rooms_data": rooms_data,
                "currency": currency,
                "no_date_search": False,
            }
            # todo no cruises found for this period
            return request.render('cleopatra_cruise.main_cruise_page', data)

    @http.route('/cruises/<int:cruise_id>', auth='public', website=True, methods=["GET", "POST"], csrf=False, )
    def cruises_cabins(self, cruise_id, **kw):
        _logger.info("===== /cruises/%s (cabins) called =====", cruise_id)
        _logger.info("Request params: %s", kw)
        rooms_count = int(kw.get('rooms_count', 1))
        try:
            rooms_data = ast.literal_eval(kw.get('rooms_data', "[2]"))
        except Exception as e:
            _logger.error("Failed to parse rooms_data: %s — defaulting to [2]", e)
            rooms_data = [2]
        _logger.info("rooms_data=%s, rooms_count=%s", rooms_data, rooms_count)
        persons_count = sum(rooms_data)
        _logger.info("persons_count=%s", persons_count)
        currency = kw.get('currency', 'EGP')
        _logger.info("currency=%s", currency)

        # Get the cruise object
        cruise = request.env['cruise.cruise'].sudo().browse(cruise_id)
        if not cruise.exists():
            _logger.error("Cruise with ID %s not found — redirecting to /cruises", cruise_id)
            return request.redirect('/cruises')

        # Get all room types for this cruise's property
        room_availability = cruise.room_availability_ids.sudo().filtered(lambda r: r.available_for_booking)
        room_types = room_availability.mapped("room_id")
        _logger.info("Cruise '%s': %d room availability record(s), %d room type(s)", cruise.name, len(room_availability), len(room_types))
        data = {
            'cruise': cruise,
            'cruise_id': cruise_id,
            'room_types': room_types,
            "room_availability": room_availability,
            "persons_count": int(persons_count),
            "date_from": kw.get("date_from", ''),
            "date_to": kw.get("date_to", ''),
            "rooms_count":rooms_count,
            "rooms_data": rooms_data,
            "search_action": f"/cruises/{cruise_id}",
            "currency": currency,
            "no_date_search":True,
            "cruise_start_date": cruise.start_date.strftime("%d/%m/%Y") if cruise.start_date else '',
            "cruise_end_date": cruise.end_date.strftime("%d/%m/%Y") if cruise.end_date else '',
        }

        _logger.info("Rendering cabin cards for cruise_id=%s", cruise_id)
        return request.render('cleopatra_cruise.cabin_cards_list', data)


    @http.route("/cruises/<int:cruise_id>/checkout", auth='public', website=True, methods=["GET"], csrf=False)
    def cruises_checkout_page(self, cruise_id, **kw):
        """Render the checkout page with guest form and reservation summary."""
        _logger.info("===== /cruises/%s/checkout (GET) called =====", cruise_id)
        cruise = request.env['cruise.cruise'].sudo().browse(cruise_id)
        countries = request.env['res.country'].sudo().search([], order='name')
        if not cruise.exists():
            _logger.error("Checkout page: cruise_id=%s not found", cruise_id)
        data = {
            'cruise': cruise if cruise.exists() else False,
            'cruise_id': cruise_id,
            'countries': countries,
            "cruise_start_date": cruise.start_date.strftime("%d/%m/%Y") if cruise.start_date else '',
            "cruise_end_date": cruise.end_date.strftime("%d/%m/%Y") if cruise.end_date else '',
        }
        return request.render('cleopatra_cruise.checkout_page', data)

    @http.route("/cruises/<int:cruise_id>/checkout/confirm", auth='public', website=True, methods=["POST"], csrf=False, type='http')
    def cruises_checkout_confirm(self, cruise_id, **kw):
        """Process checkout submission: create partner, reservation and lines."""
        _logger.info("===== /cruises/%s/checkout/confirm (POST) called =====", cruise_id)

        def _json_response(data, status=200):
            return request.make_response(
                _json.dumps(data),
                headers=[('Content-Type', 'application/json')],
                status=status,
            )
        try:
            data = _json.loads(request.httprequest.get_data(as_text=True))
            _logger.info("Checkout raw data: %s", data)
            guest_data = data.get('guest', {})
            bookings = data.get('bookings', {})

            _logger.info("Checkout confirm cruise_id=%s guest=%s bookings=%s", cruise_id, guest_data, bookings)

            # Validate required guest fields
            required_fields = ['first_name', 'last_name', 'email', 'mobile', 'country_id']
            for field in required_fields:
                if not guest_data.get(field):
                    _logger.error("Missing required guest field: %s", field)
                    return _json_response({'success': False, 'error': f'Missing required field: {field}'}, 400)

            cruise = request.env['cruise.cruise'].sudo().browse(cruise_id)
            if not cruise.exists():
                _logger.error("Checkout confirm: cruise_id=%s not found", cruise_id)
                return _json_response({'success': False, 'error': 'Cruise not found.'}, 404)

            # Find or create partner
            partner = request.env['res.partner'].sudo().search([
                ('email', '=', guest_data['email'])
            ], limit=1)

            partner_vals = {
                'name': f"{guest_data['first_name']} {guest_data['last_name']}",
                'email': guest_data['email'],
                'phone': guest_data['mobile'],
                'country_id': int(guest_data['country_id']) if guest_data.get('country_id') else False,
            }

            if partner:
                partner.sudo().write(partner_vals)
                _logger.info("Updated existing partner id=%s email=%s", partner.id, partner.email)
            else:
                partner = request.env['res.partner'].sudo().create(partner_vals)
                _logger.info("Created new partner id=%s email=%s", partner.id, partner.email)

            # Build reservation lines
            reservation_lines = []
            for room_type_id, booking in bookings.items():
                if not booking or booking.get('quantity', 0) <= 0:
                    _logger.info("Skipping room_type_id=%s (no quantity)", room_type_id)
                    continue

                quantity = int(booking.get('quantity', 1))
                adults_distribution = booking.get('roomsAdultsDistribution', [])
                _logger.info("Processing room_type_id=%s qty=%s distribution=%s", room_type_id, quantity, adults_distribution)

                if adults_distribution:
                    # Create one line per room with its own person count
                    for i, adults in enumerate(adults_distribution):
                        persons = str(min(int(adults), 2))  # Model accepts '1' or '2'
                        reservation_lines.append((0, 0, {
                            'room_id': int(room_type_id),
                            'number_of_persons': persons,
                            'number_of_rooms': 1,
                        }))
                else:
                    adults_per_room = str(min(int(booking.get('adultsPerRoom', 2)), 2))
                    reservation_lines.append((0, 0, {
                        'room_id': int(room_type_id),
                        'number_of_persons': adults_per_room,
                        'number_of_rooms': quantity,
                    }))

            if not reservation_lines:
                _logger.error("No reservation lines built — no rooms selected")
                return _json_response({'success': False, 'error': 'No rooms selected.'}, 400)

            _logger.info("Total reservation lines: %d", len(reservation_lines))
            notes = guest_data.get('notes', '')
            # Create reservation
            reservation_vals = {
                'cruise_id': cruise_id,
                'guest_id': partner.id,
                'reservation_state': 'draft',
                'payment_state': 'not_paid',
                'reservation_line_ids': reservation_lines,
                'rate': cruise.batch_id.usd_egp_rate,
                "notes":notes,
            }

            reservation = request.env['cruise.reservation'].sudo().create(reservation_vals)
            _logger.info("Created reservation id=%s ref=%s total=%s", reservation.id, reservation.ref, reservation.total_amount)
            # Store notes as internal note on chatter

            if notes:
                reservation.sudo().message_post(body=f"Guest Notes: {notes}", message_type='comment')
                _logger.info("Posted guest notes on reservation %s", reservation.id)

            _logger.info("Reservation created: %s (ref=%s) total=%s", reservation.id, reservation.ref, reservation.total_amount)

            # let account_currency=EGP for now, we can enhance later to support multiple currencies

            transaction_state=reservation.create_transaction_link()
            state=transaction_state.get('state')
            _logger.info("Transaction state for reservation %s: %s", reservation.id, state)
            error=True
            if state=="success":
                _logger.info("Transaction link created successfully for reservation %s", reservation.id)
                url=transaction_state.get('url',False)
                _logger.info("Payment URL: %s", url)
                if url:
                    return _json_response({'success': True, 'redirect': url}, 202)


            error_message=transaction_state.get('error_message', 'Unknown error during transaction creation')
            _logger.error("Transaction creation failed for reservation %s: %s", reservation.id, error_message)
            return _json_response({'success': False, 'error': error_message}, 500)



        except Exception as e:
            _logger.exception("Checkout confirm error: %s", str(e))
            return _json_response({'success': False, 'error': str(e)}, 500)
