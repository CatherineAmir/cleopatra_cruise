# -*- coding: utf-8 -*-
from odoo import models, fields, api

class CruiseRoomAvailability(models.Model):
    _name = 'cruise.room_availability'
    _description = 'Cruise Room Availability'

    cruise_id = fields.Many2one('cruise.cruise', string='Cruise', required=True)
    room_id = fields.Many2one('cruise.room_type', string='Room Type', required=True)
    total_rooms = fields.Integer(string='Total Rooms',related='room_id.total_number', store=True, readonly=False)
    reserved_rooms = fields.Integer(string='Reserved Rooms')
    available_rooms = fields.Integer(string='Available Rooms', compute='_compute_available_rooms', store=True)

    @api.depends('total_rooms', 'reserved_rooms')
    def _compute_available_rooms(self):
        for record in self:
            record.available_rooms = record.total_rooms - record.reserved_rooms if record.total_rooms and record.reserved_rooms else record.total_rooms or 0
