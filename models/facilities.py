# -*- coding: utf-8 -*-
from odoo import models, fields

class Facilities(models.Model):
    _name = 'cruise.facilities'
    _description = 'Cruise Facilities'

    name = fields.Char(string='Name', required=True)
