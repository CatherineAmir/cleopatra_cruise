from odoo import models, fields,api

class Media(models.Model):
    _name = 'media'
    _description = 'Media details'

    name = fields.Char(string="Name", required=False,default="New")

    pro_unit = fields.Selection(
        [('property', 'Property'),
         ('unit', 'Unit')], string='Content refer to',default='unit')
    select = fields.Selection(
        [('image_url', 'Image Url'),
         ('image', 'Image'),
         ('video', 'Video'),
         ('doc', 'Document'),
         ('url', 'url')], string='Media Type',default='image')
    image = fields.Image(string="Image", attachment=True, max_width=1920, max_height=1920)
    unit_id = fields.Many2one('cruise.room_type', string="Room Type")
    property_id = fields.Many2one('cruise.property', string="Property")
    description = fields.Html(string="Description")
    text_description = fields.Text(string="Text Description")

    # @api.model
    # def create(self, vals):
    #     res = super(Media, self).create(vals)
    #     if res.name == 'New':
    #         res.name = self.env['ir.sequence'].next_by_code('media_seq')
    #
    #     return res

    @api.model_create_multi
    def create(self, vals_list):
        res = super(Media, self).create(vals_list)
        for record in res:
            if record.name == 'New':
                record.name = self.env['ir.sequence'].next_by_code('media_seq')
        return res

