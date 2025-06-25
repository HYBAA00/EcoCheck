import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { certificationAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  treatment_type: string;
  company_name: string;
}

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'En attente';
    case 'approved':
      return 'Approuvé';
    case 'rejected':
      return 'Rejeté';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

export default function CertificationList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await certificationAPI.getRequests();
        setRequests(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des demandes de certification');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Demandes de certification
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/certification-request')}
        >
          Nouvelle demande
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Entreprise</TableCell>
              <TableCell>Type de traitement</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Créé le</TableCell>
              <TableCell>Dernière mise à jour</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.company_name}</TableCell>
                <TableCell>{request.treatment_type}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(request.status)}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {new Date(request.updated_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/certification-request/${request.id}`)}
                    title="Voir les détails"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {request.status === 'pending' && (
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/certification-request/${request.id}/edit`)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune demande de certification trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 