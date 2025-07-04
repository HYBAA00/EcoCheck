# Generated by Django 5.2.3 on 2025-06-22 20:21

import certifications.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('certifications', '0002_dailyinfo'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='certificate',
            name='expiry_date',
            field=models.DateField(default=certifications.models.default_expiry_date, verbose_name="Date d'expiration"),
        ),
        migrations.AddField(
            model_name='certificate',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Actif'),
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Montant')),
                ('fees', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Frais de traitement')),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Montant total')),
                ('payment_method', models.CharField(choices=[('card', 'Carte bancaire'), ('bank_transfer', 'Virement bancaire'), ('cash', 'Espèces'), ('check', 'Chèque')], max_length=20, verbose_name='Méthode de paiement')),
                ('status', models.CharField(choices=[('pending', 'En attente'), ('completed', 'Payé'), ('failed', 'Échec'), ('refunded', 'Remboursé'), ('cancelled', 'Annulé')], default='pending', max_length=20)),
                ('transaction_id', models.CharField(blank=True, max_length=100, null=True, unique=True, verbose_name='ID de transaction')),
                ('payment_date', models.DateTimeField(blank=True, null=True, verbose_name='Date de paiement')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('payment_details', models.JSONField(default=dict, verbose_name='Détails du paiement')),
                ('receipt_url', models.URLField(blank=True, null=True, verbose_name='URL du reçu')),
                ('certification_request', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='certifications.certificationrequest')),
            ],
            options={
                'verbose_name': 'Paiement',
                'verbose_name_plural': 'Paiements',
            },
        ),
        migrations.CreateModel(
            name='RequestHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('created', 'Créée'), ('submitted', 'Soumise'), ('assigned', 'Assignée'), ('under_review', 'En révision'), ('payment_required', 'Paiement requis'), ('payment_received', 'Paiement reçu'), ('approved', 'Approuvée'), ('rejected', 'Rejetée'), ('certificate_issued', 'Certificat émis'), ('cancelled', 'Annulée')], max_length=30)),
                ('description', models.TextField(verbose_name='Description')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('additional_data', models.JSONField(default=dict, verbose_name='Données supplémentaires')),
                ('certification_request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='certifications.certificationrequest')),
                ('performed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Effectué par')),
            ],
            options={
                'verbose_name': 'Historique de demande',
                'verbose_name_plural': 'Historiques de demandes',
                'ordering': ['-timestamp'],
            },
        ),
    ]
