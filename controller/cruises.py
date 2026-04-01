# -*- coding: utf-8 -*-
from datetime import datetime, date, timedelta
from odoo.osv import expression
from odoo import http
from odoo.http import request
import logging
_logger = logging.getLogger(__name__)


class CruisesController(http.Controller):
    """Controller class to handle HTTP routes."""
    @http.route('/cruises', auth='public', website=True,methods=["GET","POST"],csrf=False,)
    def index(self, **kw):
        print("KW",kw)
        print("datetime",datetime.now())
        print("date",date.today())
        date_from=kw.get('date_from',False)
        persons_count=kw.get('persons_count',2)
        print("persons_count",persons_count)
        domain=[("available_for_booking", "=", True),("start_date",'>',date.today())]
        if date_from:
            date_from=datetime.strptime(date_from,"%Y-%m-%d")
            domain=expression.AND([domain,[("start_date",">=",date_from)]])

        date_to=kw.get('date_to',False)
        if date_to:
            date_to=datetime.strptime(date_to,"%Y-%m-%d")
            domain = expression.AND([domain, [("start_date", "<=", date_to)]])
        print("domain",domain)
        cruises=request.env['cruise.cruise'].sudo().search(domain,order="start_date")
        property_id=cruises.mapped('property_id')[0]
        print("cruises",cruises)
        # if cruises:
            # images=
        data={
            'cruises':cruises,
            "persons_count":int(persons_count),
            "date_from":date_from,
            "date_to":date_to,
            "property_id":property_id,
        }
        print("data",data)
        return request.render('cleopatra_cruise.main_cruise_page',data)

    @http.route('/cruises/<int:cruise_id>', auth='public', website=True, methods=["GET", "POST"], csrf=False, )
    def cruises_cabins(self, cruise_id, **kw):
        print("cruise_id:", cruise_id)
        print("kw", kw)

        # Get the cruise object
        cruise = request.env['cruise.cruise'].sudo().browse(cruise_id)
        if not cruise.exists():
            _logger.warning(f"Cruise with ID {cruise_id} not found")
            return request.redirect('/cruises')

        # Get all room types for this cruise's property
        room_availability=cruise.room_availability_ids.sudo().filtered(lambda r:r.available_for_booking)
        room_types=room_availability.mapped("room_id")
        data = {
            'cruise': cruise,
            'cruise_id': cruise_id,
            'room_types': room_types,
            "room_availability":room_availability,

            "persons_count":kw.get("persons_count",2),
            "date_from":kw.get("date_from",''),
            "date_to":kw.get("date_to",''),
        }
        print("data:", data)
        return request.render('cleopatra_cruise.cabin_cards_list', data)
