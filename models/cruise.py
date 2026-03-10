# -*- coding: utf-8 -*-
from odoo import models, fields, api, Command
from datetime import timedelta


class Cruise(models.Model):
    _name = 'cruise.cruise'
    _description = 'Cruise'
    _inherit = ['mail.thread']
    _order="start_date desc"

    name = fields.Char(string='Name', compute='_compute_name', store=True, tracking=True)
    start_date = fields.Date(string='Start Date', required=True, tracking=True)
    number_of_nights = fields.Selection([
        ('4', '4 Days'),
        ('6', '6 Days'),
    ], string='Number of Nights', tracking=True)
    city = fields.Selection([
        ('luxor', 'Luxor'),
        ('aswan', 'Aswan'),
    ], string='City', required=True, tracking=True)
    end_date_computed = fields.Date(string='End Date', compute='_compute_end_date', store=True)
    start_day = fields.Char(string='Start Day', compute='_compute_start_day', store=True)
    end_day = fields.Char(string='End Day', compute='_compute_end_day', store=True)
    batch_id = fields.Many2one('cruise.batch', string='Batch', compute='_compute_batch_id', store=True)
    room_availability_ids = fields.One2many('cruise.room_availability', 'cruise_id', string='Room Availability')
    reservation_count = fields.Integer(string='Total Reservations', compute='_compute_reservation_count', store=True)
    fully_booked = fields.Boolean(string='Fully Booked', compute='_compute_fully_booked', store=True)

    reservation_ids = fields.One2many("cruise.reservation","cruise_id", string='Reservations')
    available_for_booking=fields.Boolean(string='Available For Booking', default=False, tracking=True)
    @api.depends('start_date', 'city')
    def _compute_name(self):
        for record in self:
            if record.start_date and record.city:
                city_display = dict(record._fields['city'].selection).get(record.city, record.city)
                formatted_date = record.start_date.strftime('%d/%m/%Y')
                record.name = f"{formatted_date} {city_display}"
            else:
                record.name = None

    @api.depends('start_date', 'number_of_nights')
    def _compute_end_date(self):
        for record in self:
            if record.start_date and record.number_of_nights:
                record.end_date_computed = record.start_date + timedelta(days=int(record.number_of_nights))
            else:
                record.end_date_computed = None

    @api.depends('start_date')
    def _compute_start_day(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for record in self:
            if record.start_date:
                record.start_day = days[record.start_date.weekday()]
            else:
                record.start_day = None

    @api.depends('end_date_computed')
    def _compute_end_day(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for record in self:
            if record.end_date_computed:
                record.end_day = days[record.end_date_computed.weekday()]
            else:
                record.end_day = None

    @api.depends('start_date')
    def _compute_batch_id(self):
        for record in self:
            if record.start_date:
                # Find a batch where the start_date falls within the batch's date range
                batch = self.env['cruise.batch'].search([
                    ('start_date', '<=', record.start_date),
                    ('end_date', '>=', record.start_date),
                ], limit=1)
                record.batch_id = batch.id if batch else None
            else:
                record.batch_id = None

    @api.depends('room_availability_ids.reserved_rooms')
    def _compute_reservation_count(self):
        for record in self:
            record.reservation_count = sum(record.room_availability_ids.mapped('reserved_rooms'))

    @api.depends('room_availability_ids.available_rooms')
    def _compute_fully_booked(self):
        for record in self:
            if record.room_availability_ids:
                record.fully_booked = all(room.available_rooms == 0 for room in record.room_availability_ids)
            else:
                record.fully_booked = False

    @api.model_create_multi
    def create(self, vals):

        results = super().create(vals)

        rooms = self.env['cruise.room_type'].search_read([], ['name', 'total_number'])
        print("rooms", rooms)
        for result in results:
            result.room_availability_ids = [Command.create({
                "room_id": room["id"],
                "total_rooms": room["total_number"]
            })
                for room in rooms]
        return results
