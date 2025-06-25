import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Business,
  Assignment,
  CheckCircle,
  Cancel,
  Download,
  Person,
  Schedule,
  AttachFile,
  DataObject,
} from '@mui/icons-material';
import { employeeAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  company_name: string;
  company_ice: string;
  treatment_type: string;
  status: string;
  submission_date: string;
  assigned_to_name: string;
  validated_by_name: string;
  reviewed_by_name: string;
  supporting_documents: string;
  has_payment: boolean;
  submitted_data: any;
}

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequestDetails();
    }
  }, [id]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getRequest(parseInt(id!));
      setRequest(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await employeeAPI.assignToMe(parseInt(id!));
      loadRequestDetails();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const handleValidate = async () => {
    try {
      await employeeAPI.validateRequest(parseInt(id!));
      loadRequestDetails();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async () => {
    try {
      await employeeAPI.rejectRequest(parseInt(id!), { reason: rejectReason });
      setRejectDialogOpen(false);
      setRejectReason('');
      loadRequestDetails();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'submitted': return 'Soumise';
      case 'under_review': return 'En révision';
      case 'rejected': return 'Rejetée';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'submitted': return <Schedule color="info" />;
      case 'under_review': return <Assignment color="warning" />;
      case 'rejected': return <Cancel color="error" />;
      case 'draft': return <Assignment color="disabled" />;
      default: return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des détails de la demande...
        </Typography>
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">
          Demande non trouvée
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/employee/requests')}
          sx={{ mt: 2 }}
        >
          Retour aux demandes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/employee/requests')}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, color: '#667eea', fontWeight: 'bold' }}>
          Demande #{request.id.toString().padStart(3, '0')}
        </Typography>
        <Chip
          icon={getStatusIcon(request.status)}
          label={getStatusText(request.status)}
          color={getStatusColor(request.status) as any}
          size="medium"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Informations de la demande */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                Informations de l'entreprise
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Business /></ListItemIcon>
                      <ListItemText 
                        primary="Nom de l'entreprise" 
                        secondary={request.company_name} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Assignment /></ListItemIcon>
                      <ListItemText 
                        primary="Numéro ICE" 
                        secondary={request.company_ice} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Schedule /></ListItemIcon>
                      <ListItemText 
                        primary="Date de soumission" 
                        secondary={new Date(request.submission_date).toLocaleDateString('fr-FR')} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Assignment /></ListItemIcon>
                      <ListItemText 
                        primary="Type de traitement" 
                        secondary={request.treatment_type} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Données soumises */}
          {request.submitted_data && Object.keys(request.submitted_data).length > 0 && (
            <Card sx={{ mb: 3 }} data-section="submitted-data">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  <DataObject sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Données soumises par l'entreprise
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Vérification requise :</strong> Analysez ces données en corrélation avec le rapport pour valider la conformité.
                  </Typography>
                </Alert>
                
                {/* Données formatées et lisibles */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📊 Résumé des données clés :
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          RC (Registre Commerce) : {request.submitted_data.rc || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: '#e8f4fd', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ICE : {request.submitted_data.ice || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Email contact : {request.submitted_data.email || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Données brutes dans un accordéon */}
                <Box sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f9f9f9', 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f0f0f0' }
                    }}
                    onClick={() => setShowRawData(!showRawData)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      {showRawData ? '▼' : '▶'} Voir les données brutes (JSON)
                    </Typography>
                  </Box>
                  {showRawData && (
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                        {JSON.stringify(request.submitted_data, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Documents et Rapports */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                <AttachFile sx={{ mr: 1, verticalAlign: 'middle' }} />
                Documents et Informations Soumises
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {request.supporting_documents ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Rapport principal de l'entreprise */}
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Document PDF joint :</strong> Veuillez examiner attentivement le rapport soumis par l'entreprise.
                    </Typography>
                  </Alert>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    href={request.supporting_documents}
                    target="_blank"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    📄 Visualiser le Rapport de l'Entreprise
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={request.supporting_documents}
                    download
                    fullWidth
                  >
                    Télécharger le Rapport (PDF)
                  </Button>
                  
                  {/* Aperçu du document dans une iframe si c'est un PDF */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Aperçu du document :
                    </Typography>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '400px', 
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <iframe
                        src={`${request.supporting_documents}#toolbar=1&navpanes=1&scrollbar=1`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Rapport de l'entreprise"
                      />
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>📝 Informations structurées :</strong> L'entreprise a soumis ses données via le formulaire en ligne. 
                      Consultez la section "Données soumises" ci-dessus pour évaluer la demande.
                    </Typography>
                  </Alert>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>⚠️ Aucun document PDF joint :</strong> L'entreprise n'a pas téléchargé de rapport PDF. 
                      L'évaluation doit se baser sur les données du formulaire.
                    </Typography>
                  </Alert>
                  
                  {/* Actions alternatives quand pas de PDF */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        // Faire défiler vers la section des données
                        const dataSection = document.querySelector('[data-section="submitted-data"]');
                        if (dataSection) {
                          dataSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      fullWidth
                    >
                      📊 Consulter les Données Soumises
                    </Button>
                    
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px dashed #dee2e6' }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                        💡 <strong>Note :</strong> L'entreprise a choisi de soumettre ses informations directement via le formulaire 
                        plutôt que de joindre un document PDF séparé.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions et informations */}
        <Grid item xs={12} md={4}>
          {/* Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Check-list de validation */}
              {request.status === 'under_review' && (
                <Alert severity={request.supporting_documents ? "warning" : "info"} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✅ Points à vérifier avant validation :
                  </Typography>
                  <Typography variant="body2" component="div">
                    {request.supporting_documents ? (
                      <>
                        • Le rapport PDF de l'entreprise est complet<br/>
                        • Les données du document correspondent aux exigences<br/>
                        • Les documents justificatifs sont valides<br/>
                        • Le paiement a été effectué
                      </>
                    ) : (
                      <>
                        • Les données soumises via le formulaire sont complètes<br/>
                        • Les informations de l'entreprise sont exactes<br/>
                        • Les données correspondent aux exigences DEEE<br/>
                        • Le paiement a été effectué<br/>
                        • <strong>Note :</strong> Pas de document PDF joint - évaluation basée sur les données du formulaire
                      </>
                    )}
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {request.status === 'submitted' && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Person />}
                      onClick={handleAssignToMe}
                      fullWidth
                    >
                      M'assigner cette demande
                    </Button>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Assignez-vous cette demande pour commencer l'évaluation du rapport.
                      </Typography>
                    </Alert>
                  </>
                )}
                
                {request.status === 'under_review' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleValidate}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      ✅ Valider la demande
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setRejectDialogOpen(true)}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      ❌ Rejeter la demande
                    </Button>
                  </>
                )}
                
                {request.status === 'approved' && (
                  <Alert severity="success">
                    <Typography variant="body2">
                      ✅ Cette demande a été validée avec succès !
                    </Typography>
                  </Alert>
                )}
                
                {request.status === 'rejected' && (
                  <Alert severity="error">
                    <Typography variant="body2">
                      ❌ Cette demande a été rejetée.
                    </Typography>
                  </Alert>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={async () => {
                    try {
                      await employeeAPI.downloadDocuments(request.id);
                      console.log('Téléchargement initié avec succès');
                    } catch (error: any) {
                      console.error('Erreur téléchargement:', error);
                      if (error.response?.status === 404) {
                        alert('Aucun document ou donnée disponible pour cette demande');
                      } else {
                        alert(`Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}`);
                      }
                    }
                  }}
                  fullWidth
                >
                  {request.supporting_documents ? 
                    '📄 Télécharger le rapport PDF' : 
                    '📊 Générer et télécharger le rapport'
                  }
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Assignations */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Assignations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Assigné à" 
                    secondary={request.assigned_to_name || 'Non assigné'} 
                  />
                </ListItem>
                {request.validated_by_name && (
                  <ListItem>
                    <ListItemText 
                      primary="Validé par" 
                      secondary={request.validated_by_name} 
                    />
                  </ListItem>
                )}
                {request.reviewed_by_name && (
                  <ListItem>
                    <ListItemText 
                      primary="Révisé par" 
                      secondary={request.reviewed_by_name} 
                    />
                  </ListItem>
                )}
              </List>

              {/* Paiement */}
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={request.has_payment ? 'Paiement effectué' : 'Paiement en attente'}
                  color={request.has_payment ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>
          ❌ Rejeter la demande #{request?.id.toString().padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Attention :</strong> Le rejet de cette demande sera définitif. L'entreprise devra soumettre une nouvelle demande.
            </Typography>
          </Alert>
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Points d'évaluation du rapport :
          </Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" component="div">
              ❌ <strong>Problèmes identifiés :</strong><br/>
              • Rapport incomplet ou manquant<br/>
              • Données incorrectes ou insuffisantes<br/>
              • Documents justificatifs non conformes<br/>
              • Non-respect des réglementations DEEE<br/>
              • Autres non-conformités
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Commentaires détaillés sur le rejet"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Expliquez en détail les raisons du rejet :&#10;- Quels sont les éléments manquants ou incorrects dans le rapport ?&#10;- Quelles corrections l'entreprise doit-elle apporter ?&#10;- Références aux réglementations non respectées..."
            helperText="Ces commentaires seront envoyés à l'entreprise pour l'aider à corriger sa demande."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRejectDialogOpen(false)} size="large">
            Annuler
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason.trim()}
            size="large"
            startIcon={<Cancel />}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 