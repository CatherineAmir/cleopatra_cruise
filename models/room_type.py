# -*- coding: utf-8 -*-
from odoo import models, fields, api

class RoomType(models.Model):
    _name = 'cruise.room_type'
    _description = 'Cruise Room Type'

    name = fields.Char(string='Name', required=True)
    facilities = fields.Many2many('cruise.facilities', string='Facilities')
    total_number = fields.Integer(string='Total Number')
    area= fields.Char(string='Area')
    media_ids = fields.One2many('media', 'unit_id', string='Media')
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
            'domain': [('unit_id', '=', self.id)],
            'context': {'default_unit_id': self.id},
        }
