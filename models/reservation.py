# -*- coding: utf-8 -*-
from odoo import models, fields, api,_

class Reservation(models.Model):
    _name = 'cruise.reservation'
    _description = 'Cruise Reservation'
    _inherit = 'mail.thread'
    _rec_name="ref"
    ref = fields.Char('Reservation', copy=False, readonly=True, default='New')
    # name=fields.Char(string='Name',compute='_compute_name', readonly=True, copy=False)
    cruise_id = fields.Many2one('cruise.cruise', string='Cruise', required=True, tracking=True)
    batch_id = fields.Many2one('cruise.batch', string='Batch', related='cruise_id.batch_id', readonly=True)
    guest_id = fields.Many2one('res.partner', string='Guest', required=True, tracking=True)
    guest_email = fields.Char(string='Email', related='guest_id.email', readonly=True)
    guest_phone = fields.Char(string='Phone', related='guest_id.phone', readonly=True)
    guest_country = fields.Many2one('res.country', string='Nationality', related='guest_id.country_id', readonly=True)
    reservation_state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], string='Reservation State', default='draft', tracking=True)
    payment_state = fields.Selection([
        ('not_paid', 'Not Paid'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
    ], string='Payment State', default='not_paid', tracking=True)
    total_amount = fields.Float(string='Total Amount', compute='_compute_total_amount', store=True, tracking=True)
    reservation_line_ids = fields.One2many('cruise.reservation_line', 'reservation_id', string='Reservation Lines')

    @api.depends("cruise_id","guest_id")
    def _compute_name(self):
        for reservation in self:
            if reservation.cruise_id and reservation.guest_id:
                reservation.name = reservation.cruise_id.name+" - "+reservation.guest_id.name
    

    @api.depends('reservation_line_ids.total_amount')
    def _compute_total_amount(self):
        for record in self:
            record.total_amount = sum(record.reservation_line_ids.mapped('total_amount'))

    @api.model
    def create(self, vals):
        res = super(Reservation, self).create(vals)
        if res.ref == 'New':
            res.ref = self.env['ir.sequence'].next_by_code('reservation_seq')

        return res


class ReservationLine(models.Model):
    _name = 'cruise.reservation_line'
    _description = 'Cruise Reservation Line'

    reservation_id = fields.Many2one('cruise.reservation', string='Reservation', required=True)
    room_id = fields.Many2one('cruise.room_type', string='Room Type', required=True)
    number_of_persons = fields.Selection([
        ('1', '1 Person'),
        ('2', '2 Persons'),
    ], string='Number of Persons', required=True,default="1")
    total_amount = fields.Float(string='Total Amount', compute='_compute_line_total_amount', store=True)
    number_of_rooms=fields.Integer(string='Number of Rooms',default=1)
    number_of_nights=fields.Selection(string='Number of Nights',related='reservation_id.cruise_id.number_of_nights',store=True)

    @api.constrains('number_of_rooms')
    def _compute_number_of_rooms(self):
        for record in self:
            if record.number_of_rooms < 1:
                raise ValueError(_("Number of rooms must be greater than 1"))
            else:
                pass
        return


    @api.depends('room_id', 'number_of_persons',"reservation_id.batch_id","number_of_rooms")
    def _compute_line_total_amount(self):
        for record in self:

            if record.reservation_id and record.reservation_id.batch_id and record.room_id and record.number_of_persons:
               try:
                   int(record.number_of_persons)
               except ValueError:
                   raise ValueError('Number of Persons must be an integer.')
               else:
                    batch_id = record.reservation_id.batch_id
                    rate=batch_id.rate_ids.filtered(lambda r: r.room_id.id == record.room_id.id).rate
                    if int(record.number_of_persons)==1:
                        record.total_amount = rate * int(record.number_of_persons) * record.number_of_rooms*(1+batch_id.single_supplements)*int(record.number_of_nights)

                    else:
                        record.total_amount = rate*int(record.number_of_persons)*record.number_of_rooms*int(record.number_of_nights)


            else:

                record.total_amount = 0.0
