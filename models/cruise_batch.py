from odoo import models, fields

class CruiseBatch(models.Model):
    _name = 'cruise.batch'
    _description = 'Cruise Batch'

    name = fields.Char(string='Name', required=True)
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')