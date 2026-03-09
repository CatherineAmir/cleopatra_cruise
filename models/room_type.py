# -*- coding: utf-8 -*-
from odoo import models, fields

class RoomType(models.Model):
    _name = 'cruise.room_type'
    _description = 'Cruise Room Type'

    name = fields.Char(string='Name', required=True)
    facilities = fields.Many2many('cruise.facilities', string='Facilities')
    total_number = fields.Integer(string='Total Number')
