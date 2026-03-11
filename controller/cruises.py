# -*- coding: utf-8 -*-
from datetime import datetime,date

from odoo import http
from odoo.http import request


class CruisesController(http.Controller):
    """Controller class to handle HTTP routes."""
    @http.route('/cruises', auth='public', website=True)
    def index(self, **kw):
        print("datetime",datetime.now())
        print("date",date.today())
        cruises=request.env['cruise.cruise'].sudo().search([("available_for_booking", "=", True),("start_day",'>',date.today())],order="start_day desc",limit=3)
        print("cruises",cruises)
        data={
            'cruises':cruises
        }
        return request.render('cleopatra_cruise.main_cruise_page',data)