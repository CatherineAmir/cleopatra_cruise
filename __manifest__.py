# -*- coding: utf-8 -*-
{
    'name': 'Cleopatra Cruise',
    'version': '1.0',
    'summary': 'Cleopatra Cruise Reservation',
    'description': '''
       Cleopatra Cruise Reservation
    ''',
    'category': 'Uncategorized',
    'author': 'SITA-EGYPT',
    'company': 'SITA-EGYPT',
    'maintainer': 'SITA-EGYPT',
    'website': 'https://www.sita-eg.com',
    'depends': ['base', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'data/sequence.xml',
        'views/batch.xml',
        'views/facilities.xml',
        'views/room_type.xml',
        'views/cruise.xml',
        'views/room_availability.xml',
        'views/reservation.xml',
        'views/menus.xml',
    ],
    'license': 'LGPL-3',
    'installable': True,
    'application': False,
    'auto_install': False,
}