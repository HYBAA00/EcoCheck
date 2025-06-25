import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { authorityAPI } from '../../services/api';

interface Document {
  id: number | string;
  title: string;
  description: string;
  file_type: string;
  file_size: number;
  last_modified: string;
  category: string;
  access_level: string;
  version: string;
  author: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, categoryFilter, accessFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (accessFilter) params.append('access_level', accessFilter);

      const response = await authorityAPI.getDocuments(params.toString());
      setDocuments(response.data.results || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des documents:', err);
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      await authorityAPI.downloadDocument(document.id.toString());
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Erreur lors du téléchargement du document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'success';
      case 'restricted': return 'warning';
      case 'confidential': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'report': return '📊';
      case 'regulation': return '⚖️';
      case 'certificate': return '📜';
      case 'procedure': return '📖';
      case 'technical_report': return '🔬';
      case 'environmental_study': return '🌱';
      case 'authorization': return '✅';
      case 'invoice': return '💰';
      case 'contract': return '📋';
      default: return '📄';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Documents en Lecture Seule
      </Typography>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher des documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Catégorie"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="technical_report">Rapports Techniques</MenuItem>
                  <MenuItem value="environmental_study">Études Environnementales</MenuItem>
                  <MenuItem value="authorization">Autorisations</MenuItem>
                  <MenuItem value="certificate">Certificats</MenuItem>
                  <MenuItem value="invoice">Factures</MenuItem>
                  <MenuItem value="contract">Contrats</MenuItem>
                  <MenuItem value="other">Autres</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Niveau d'accès</InputLabel>
                <Select
                  value={accessFilter}
                  label="Niveau d'accès"
                  onChange={(e) => setAccessFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="restricted">Restreint</MenuItem>
                  <MenuItem value="confidential">Confidentiel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={loadDocuments}
              >
                Filtrer
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {documents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {documents.filter(d => d.access_level === 'public').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents publics
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {documents.filter(d => d.access_level === 'restricted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents restreints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                {new Set(documents.map(d => d.category)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catégories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des documents */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Liste des Documents
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Taille</TableCell>
                    <TableCell>Accès</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Modifié le</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucun document trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((document) => (
                      <TableRow key={document.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {getCategoryIcon(document.category)}
                            </Typography>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {document.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {document.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Par: {document.author}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={document.category}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFileSize(document.file_size)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {document.file_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={document.access_level}
                            size="small"
                            color={getAccessLevelColor(document.access_level) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            v{document.version}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(document.last_modified)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Télécharger">
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(document)}
                                color="primary"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Aperçu">
                              <IconButton
                                size="small"
                                color="default"
                                disabled
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Documents; 