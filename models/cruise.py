# -*- coding: utf-8 -*-
from odoo import models, fields, api, Command
from datetime import timedelta
import logging
_logger = logging.getLogger(__name__)

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
    end_date = fields.Date(string='End Date', compute='_compute_end_date', store=True)
    start_day = fields.Char(string='Start Day', compute='_compute_start_day', store=True)
    end_day = fields.Char(string='End Day', compute='_compute_end_day', store=True)
    batch_id = fields.Many2one('cruise.batch', string='Batch', compute='_compute_batch_id', store=True)
    property_id = fields.Many2one('cruise.property', string='Property', related='batch_id.property_id', store=True, readonly=True)
    room_availability_ids = fields.One2many('cruise.room_availability', 'cruise_id', string='Room Availability')
    reservation_count = fields.Integer(string='Total Reservations', compute='_compute_reservation_count', store=True)
    fully_booked = fields.Boolean(string='Fully Booked', compute='_compute_fully_booked', store=True)

    reservation_ids = fields.One2many("cruise.reservation","cruise_id", string='Reservations',domain="[('reservation_state','in',['confirmed','draft'])]")
    available_for_booking=fields.Boolean(string='Available For Booking', default=False, tracking=True)

    def action_view_reservations(self):
        return {
            'name': 'Reservations',
            'type': 'ir.actions.act_window',
            'res_model': 'cruise.reservation',
            'view_mode': 'list,form',
            'domain': [('cruise_id', '=', self.id), ('reservation_state', 'in', ['confirmed','draft'])],
        }


    def update_booking_availability(self):
        for cruise in self:
            reservation_ids=cruise.reservation_ids.filtered(lambda r: r.reservation_state in ['confirmed','draft'])
            reservation_model=self.env["cruise.reservation_line"].sudo()
            reservation_lines=reservation_model.read_group(domain=[("reservation_id",'in',reservation_ids.ids)],fields=['room_id','number_of_rooms'],groupby=['room_id'])
            for line in reservation_lines:
                room_id=line['room_id'][0] if line['room_id'] else None
                reserved_rooms=line['number_of_rooms']
                room_availability=cruise.room_availability_ids.filtered(lambda r: r.room_id.id == room_id)
                if room_availability:
                    room_availability.reserved_rooms=reserved_rooms
                    room_availability.available_rooms=room_availability.total_rooms-reserved_rooms
                else:
                    _logger.error("No room availability record found for room_id {} in cruise_id {}".format(room_id,cruise.id))



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
                record.end_date = record.start_date + timedelta(days=int(record.number_of_nights))
            else:
                record.end_date = None

    @api.depends('start_date')
    def _compute_start_day(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for record in self:
            if record.start_date:
                record.start_day = days[record.start_date.weekday()]
            else:
                record.start_day = None

    @api.depends('end_date')
    def _compute_end_day(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for record in self:
            if record.end_date:
                record.end_day = days[record.end_date.weekday()]
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

        for result in results:
            result.room_availability_ids = [Command.create({
                "room_id": room["id"],
                "total_rooms": room["total_number"]
            })
                for room in rooms]
        return results


    def get_rate_in_egp_minimum(self, persons, currency='EGP'):
        room_rate_min=self.batch_id.rate_ids[0]
        if room_rate_min:
            room_rate_min=room_rate_min.rate
            print("room_rate_min",room_rate_min)
            exchange = self.batch_id.usd_egp_rate if currency == 'EGP' else 1
            room_rate_egp=round(room_rate_min * int(self.number_of_nights) * int(persons) * exchange, 2)

            return room_rate_egp
        else:
            return 0


    def get_room_rate_in_egp(self, persons, room_id, currency='EGP'):
        room_rate=self.batch_id.rate_ids.filtered(lambda r: r.room_id == room_id)[0]
        if room_rate:
            room_rate=room_rate.rate
            print("persons",persons)
            exchange = self.batch_id.usd_egp_rate if currency == 'EGP' else 1
            if int(persons)==1:
                print("")
                room_rate_egp = round(
                    room_rate * int(self.number_of_nights) * int(persons) * exchange, 2)*(1+self.batch_id.single_supplements)
                return room_rate_egp
            else:
                room_rate_egp = round(
                    room_rate * int(self.number_of_nights) * int(persons) * exchange, 2)

                return room_rate_egp
        else:
            return 0


    def get_room_max_availability(self,room_id):
        room_availability=self.room_availability_ids.filtered(lambda r: r.room_id == room_id)[0]
        if room_availability:
            av=room_availability.available_rooms
            print("av",av)
            return av
        else:
            _logger.error("No available rooms for room_id {} for cruise_id".format(room_id,self.id))
            return 0

