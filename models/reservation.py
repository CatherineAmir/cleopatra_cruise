# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import logging
import sys
_logger = logging.getLogger(__name__)


class Reservation(models.Model):
    _name = 'cruise.reservation'
    _description = 'Cruise Reservation'
    _inherit = 'mail.thread'
    _rec_name = "ref"
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
    ], string='Reservation State', default='draft', tracking=True, compute='_compute_payment_state', store=True)
    payment_state = fields.Selection([
        ('not_paid', 'Not Paid'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
    ], string='Payment State', default='not_paid', tracking=True)
    payment_transaction_state = fields.Selection(string='Payment State', tracking=True,
                                                 related="payment_transaction_id.state", store=True)
    total_amount = fields.Monetary(string='Total Amount', currency_field='currency_id', compute='_compute_total_amount',
                                   store=True, tracking=True)
    secondary_total_amount = fields.Monetary(string='Total Amount in Secondary Currency',
                                             currency_field='secondary_currency_id', compute='_compute_total_amount',
                                             store=True, tracking=True)

    reservation_line_ids = fields.One2many('cruise.reservation_line', 'reservation_id', string='Reservation Lines')
    rate = fields.Float(string='Rate', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Currency', related='batch_id.currency_id', readonly=True)
    secondary_currency_id = fields.Many2one('res.currency', string='Secondary Currency',
                                            related='batch_id.secondary_currency_id', readonly=True, store=True)

    notes = fields.Text(string='Notes')

    payment_transaction_id = fields.Many2one('transaction', string='Payment Transaction', readonly=True)

    @api.depends("cruise_id", "guest_id")
    def _compute_name(self):
        for reservation in self:
            if reservation.cruise_id and reservation.guest_id:
                reservation.name = reservation.cruise_id.name + " - " + reservation.guest_id.name

    @api.depends('reservation_line_ids.total_amount')
    def _compute_total_amount(self):
        for record in self:
            record.total_amount = sum(record.reservation_line_ids.mapped('total_amount'))
            record.secondary_total_amount = sum(record.reservation_line_ids.mapped('total_amount_secondary'))

    @api.depends('payment_transaction_id', 'payment_transaction_id.state')
    def _compute_payment_state(self):
        for record in self:
            if record.payment_transaction_id:
                if record.payment_transaction_id.state == 'paid':
                    record.payment_state = 'paid'
                    record.reservation_state = 'confirmed'
                elif record.payment_transaction_id.state == 'partially_paid':
                    record.payment_state = 'partially_paid'
                    record.reservation_state = 'confirmed'
                else:
                    record.payment_state = 'not_paid'
            else:
                record.payment_state = 'not_paid'

    # @api.model
    # def create(self, vals):
    #     res = super(Reservation, self).create(vals)
    #     if res.ref == 'New':
    #         res.ref = self.env['ir.sequence'].next_by_code('reservation_seq')
    #
    #     return res

    @api.model_create_multi
    def create(self, vals_list):
        res = super(Reservation, self).create(vals_list)
        for record in res:
            if record.ref == 'New':
                record.ref = self.env['ir.sequence'].next_by_code('reservation_seq')
        return res

    def create_transaction_link(self):
        try:
            self.ensure_one()
            if self.payment_transaction_id:
                return{
                    "state": "success",
                    "url": self.payment_transaction_id.payment_link,
                }

            company_id = self.env.company.id
            currency_id = self.batch_id.currency_id.id
            account_manager = self.env['account_manager'].sudo().search(
                [("company_id", "=", company_id), ("currency_id", '=', currency_id)], limit=1)

            if not account_manager:
                account_manager = self.env['account_manager'].sudo().search(
                    [("company_id", "=", company_id)], limit=1)

            if account_manager.currency_id.id == currency_id:
                amount = self.total_amount
            else:
                amount = self.secondary_total_amount

            if account_manager:
                transaction_vals = {
                    "reservation_id": self.ref,
                    "amount": amount,
                    "client_name": self.guest_id.name,
                    "client_email": self.guest_id.email,
                    "client_mobile": self.guest_id.phone,
                    'link_validity': 24,
                    "account_id": account_manager.id,


                }
                transaction_id = self.env['transaction'].sudo().create(transaction_vals)
                self.payment_transaction_id = transaction_id.id
                transaction_id.create_payment_link()

                return {
                    "state": "success",
                    "url": transaction_id.payment_link,

                }

            else:
                return {
                    "state": "error",
                    "error": True,
                    "message": _(
                        (_("No account manager found for the reservation's currency."))
                    )}
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            _logger.error("Error in create_transaction_link %s, %s,%s,%s", e,exc_type, exc_obj, exc_tb)
            return{
                "state": "error",
                "error": True,
                "message": _("An error occurred while creating the payment link. Please try again later.")
            }


class ReservationLine(models.Model):
    _name = 'cruise.reservation_line'
    _description = 'Cruise Reservation Line'

    reservation_id = fields.Many2one('cruise.reservation', string='Reservation', required=True)
    room_id = fields.Many2one('cruise.room_type', string='Room Type', required=True)
    number_of_persons = fields.Selection([
        ('1', '1 Person'),
        ('2', '2 Persons'),
    ], string='Number of Persons', required=True, default="1")

    currency_id = fields.Many2one('res.currency', string='Currency', related='reservation_id.batch_id.currency_id',
                                  readonly=True)
    secondary_currency_id = fields.Many2one('res.currency', string='Secondary Currency',
                                            related='reservation_id.batch_id.secondary_currency_id', readonly=True,
                                            store=True)

    total_amount = fields.Monetary(string='Total Amount', compute='_compute_line_total_amount', store=True,
                                   currency_field='currency_id')
    total_amount_secondary = fields.Monetary(string='Total Amount in Secondary Currency',
                                             compute='_compute_line_total_amount', store=True,
                                             currency_field='secondary_currency_id')
    number_of_rooms = fields.Integer(string='Number of Rooms', default=1)
    number_of_nights = fields.Selection(string='Number of Nights', related='reservation_id.cruise_id.number_of_nights',
                                        store=True)

    @api.constrains('number_of_rooms')
    def _compute_number_of_rooms(self):
        for record in self:
            if record.number_of_rooms < 1:
                raise ValueError(_("Number of rooms must be greater than 1"))
            else:
                pass
        return

    @api.depends('room_id', 'number_of_persons', "reservation_id.batch_id", "number_of_rooms")
    def _compute_line_total_amount(self):
        for record in self:

            if record.reservation_id and record.reservation_id.batch_id and record.room_id and record.number_of_persons:
                try:
                    int(record.number_of_persons)
                except ValueError:
                    raise ValueError('Number of Persons must be an integer.')
                else:
                    batch_id = record.reservation_id.batch_id
                    rate = batch_id.rate_ids.filtered(lambda r: r.room_id.id == record.room_id.id).rate
                    if int(record.number_of_persons) == 1:
                        record.total_amount = rate * int(record.number_of_persons) * record.number_of_rooms * (
                                1 + batch_id.single_supplements) * int(record.number_of_nights)

                    else:
                        record.total_amount = rate * int(record.number_of_persons) * record.number_of_rooms * int(
                            record.number_of_nights)

                    record.total_amount_secondary = record.total_amount * batch_id.usd_egp_rate if batch_id.usd_egp_rate else 0.0

            else:

                record.total_amount = 0.0
