# -*- coding: utf-8 -*-
from odoo import models, fields, api

class Property(models.Model):
    _name = 'cruise.property'
    _description = 'Cruise Property'

    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Description')
    media_ids = fields.One2many('media', 'property_id', string='Media')
    facilities = fields.Many2many('cruise.facilities', string='Facilities')
    data_html = fields.Html(string='More Data')
    additional_html = fields.Html(string='Additional Information')
    media_count = fields.Integer(string='Media Count', compute='_compute_media_count')

    @api.depends('media_ids')
    def _compute_media_count(self):
        for record in self:
            record.media_count = len(record.media_ids)

    def action_open_media(self):
        return {
            'name': 'Media',
            'view_type': 'form',
            'view_mode': 'kanban,list,form',
            'res_model': 'media',
            'type': 'ir.actions.act_window',
            'domain': [('property_id', '=', self.id)],
            'context': {'default_property_id': self.id},
        }




