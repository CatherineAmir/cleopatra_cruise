# -*- coding: utf-8 -*-
from datetime import datetime, date, timedelta
from odoo.osv import expression
from odoo import http
from odoo.http import request


class CruisesController(http.Controller):
    """Controller class to handle HTTP routes."""
    @http.route('/cruises', auth='public', website=True,methods=["GET","POST"],csrf=False,)
    def index(self, **kw):
        print("KW",kw)
        print("datetime",datetime.now())
        print("date",date.today())
        date_from=kw.get('date_from',False)
        person_count=kw.get('persons_count',2)
        print("persons_count",person_count)
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
        print("cruises",cruises)
        data={
            'cruises':cruises,
            "person_count":int(person_count),
            "date_from":date_from,
            "date_to":date_to,
        }
        print("data",data)
        return request.render('cleopatra_cruise.main_cruise_page',data)