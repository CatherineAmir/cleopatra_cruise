# -*- coding: utf-8 -*-
from odoo import models, fields

class Facilities(models.Model):
    _name = 'cruise.facilities'
    _description = 'Cruise Facilities'

    name = fields.Char(string='Name', required=True)
    icon = fields.Char(string='Icon', help='Font Awesome icon class (e.g., fa-snowflake-o, fa-utensils, fa-swimming-pool, fa-masks, fa-anchor) or emoji')
