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
        'views/media_views.xml',
        'views/property.xml',
        'views/menus.xml',
        'templates/cruise_card.xml',
        'templates/main_cruise_page.xml',
        'templates/search_bar.xml',
    ],

    'web.assets_frontend': [
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        # 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/js/bootstrap-datepicker.min.js',
        # 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/css/bootstrap-datepicker.min.css',
        # 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/css/bootstrap-datepicker3.min.css',
        # 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/css/bootstrap-datepicker3.min.css',
        'cleopatra_cruise/static/src/css/style.css',
        'cleopatra_cruise/static/src/js/script.js',
        # 'booking_engine/static/xml/search_main_template.xml',
        # "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        # "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    ],
    'license': 'LGPL-3',
    'installable': True,
    'application': False,
    'auto_install': False,
}
