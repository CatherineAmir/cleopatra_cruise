from odoo import fields, models, api
from datetime import datetime, timedelta

class Transaction(models.Model):
   _inherit='transaction'

   reservation_reference=fields.Many2one('cruise.reservation',string='Reservation')
   client_id=fields.Many2one('res.partner',string='Client',related='reservation_reference.guest_id')



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

   @api.model
   def check_link_validity(self):

       order_ids = self.env['transaction'].sudo().search([("state", "not in", ["expired", "done"])])
       for order_id in order_ids:
           link_created = order_id.link_created
           valid_till = order_id.link_validity

           if link_created:
               if link_created + timedelta(hours=valid_till) <= datetime.now():

                   order_id.link_active = False
                   if not order_id.verified_on:
                       order_id.state = 'expired'
                       # override the state of reservation to cancelled if the order is expired and not verified
                       order_id.reservation_reference.reservation_state = 'cancelled'
                       order_id.reservation_reference.payment_state = 'not_paid'


           else:

               order_id.link_active = False
