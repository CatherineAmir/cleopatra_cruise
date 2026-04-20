from odoo import fields, models, api


class Transaction(models.Model):
   _inherit='transaction'

   reservation_reference=fields.Many2one('cruise.reservation',string='Reservation')
   client_id=fields.Many2one('res.partner',string='Client',related='reservation_reference.guest_id')