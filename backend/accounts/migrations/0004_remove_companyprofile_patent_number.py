# Generated by Django 5.2.3 on 2025-06-22 21:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_rename_phone_companyprofile_phone_company'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='companyprofile',
            name='patent_number',
        ),
    ]
