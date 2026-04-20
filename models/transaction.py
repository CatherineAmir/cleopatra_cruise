from odoo import fields, models, api


class Transaction(models.Model):
   _inherit='transaction'

   reservation_reference=fields.Many2one('cruise.reservation',string='Reservation')
   client_id=fields.Many2one('res.partner',string='Client',related='reservation_reference.guest_id')

   ('not_processed', 'New'),
   ('done', 'Paid'),
   ('failed', 'Failed'),
   ('pending', 'Pending'),
   ('expired', "Expired"),
   ('refunded', "Refunded"),
   ('partially_refunded', "Partially Refunded"),

   def get_order_state(self):
        res=super(Transaction, self).get_order_state()

        for r in self:
            if r.reservation_reference:
               if r.state:
                    if r.state in ['done']:
                      r.reservation_reference.reservation_state = 'confirmed'
                      r.reservation_reference.payment_state='paid'
                    elif r.state in ['not_processed','pending','failed']:
                       r.reservation_reference.reservation_state = 'draft'
                       r.reservation_reference.payment_state = 'not_paid'

                    elif r.state in ['expired']:
                        r.reservation_reference.reservation_state = 'cancelled'
                        r.reservation_reference.payment_state = 'not_paid'

                    elif r.state in ['refunded','partially_refunded']:

                        r.reservation_reference.reservation_state = 'cancelled'
                        r.reservation_reference.payment_state = 'refunded'

        return res
