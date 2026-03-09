from odoo import models, fields,api
from odoo.exceptions import UserError, ValidationError, AccessError, MissingError

class CruiseBatch(models.Model):
    _name = 'cruise.batch'
    _description = 'Cruise Batch'
    _inherit = 'mail.thread'

    name = fields.Char(string='Name', required=True, tracking=True)
    start_date = fields.Date(string='Start Date', tracking=True)
    end_date = fields.Date(string='End Date', tracking=True)

    description = fields.Html(string='Description', copy=True)
    currency_id = fields.Many2one('res.currency', string='Currency', tracking=True)
    single_supplements = fields.Float(string='Single Supplement', default=0.7, copy=True, tracking=True)
    rate_ids = fields.One2many('cruise.batch_rate', 'batch_id', string='Rates', copy=True)

    @api.constrains('start_date', 'end_date')
    def _check_start_date(self):
        for batch in self:
            if batch.start_date and batch.end_date and batch.start_date > batch.end_date:
                raise ValidationError("End date must be After start date")


class CruiseBatchRate(models.Model):
    _name = 'cruise.batch_rate'
    _description = 'Cruise Batch Rate'

    batch_id = fields.Many2one('cruise.batch', string='Batch', required=True)
    room_id = fields.Many2one('cruise.room_type', string='Room', required=True)
    currency_id = fields.Many2one('res.currency', string='currency',related='batch_id.currency_id', readonly=True)
    rate=fields.Monetary(string='Rate',required=True,currency_field='currency_id')