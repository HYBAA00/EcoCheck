import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API - Erreur 401, token invalide');
      localStorage.removeItem('token');
      // Ne pas faire de redirection directe, laisser React Router gérer cela
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Correction ici : utilisation d'email au lieu de username
  login: (credentials: { email: string; password: string }) =>
  api.post('/auth/login/', {
    username: credentials.email, // transformer ici
    password: credentials.password,
  }),

  register: (userData: any) => api.post('/accounts/register/', userData),
  getProfile: () => api.get('/accounts/profile/'),
  updateProfile: (data: any) => api.put('/accounts/profile/', data),
};

export const certificationAPI = {
  createRequest: (data: any) => api.post('/certifications/requests/', data),
  createRequestWithFiles: (formData: FormData) => {
    return api.post('/certifications/requests/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getRequests: () => api.get('/certifications/requests/'),
  getRequest: (id: number) => api.get(`/certifications/requests/${id}/`),
  updateRequest: (id: number, data: any) => api.patch(`/certifications/requests/${id}/`, data),
  deleteRequest: (id: number) => api.delete(`/certifications/requests/${id}/`),
  approveRequest: (id: number) => api.post(`/certifications/requests/${id}/approve/`),
  rejectRequest: (id: number, data: any) => api.post(`/certifications/requests/${id}/reject/`, data),
  resubmitRequest: (id: number, data: any) => api.post(`/certifications/requests/${id}/resubmit/`, data),
  getEnterpriseStats: () => api.get('/certifications/requests/enterprise_stats/'),
  getRecentRequests: () => api.get('/certifications/requests/recent/'),
  downloadCertificate: (id: number) => api.get(`/certifications/requests/${id}/download_certificate/`),
  downloadRejectionReport: (id: number) => api.get(`/certifications/requests/${id}/download_rejection_report/`),
};

export const certificateAPI = {
  getCertificates: () => api.get('/certifications/certificates/'),
  getCertificate: (id: number) => api.get(`/certifications/certificates/${id}/`),
  getCertificateByRequest: (requestId: number) => api.get(`/certifications/certificates/by_request/?request_id=${requestId}`),
  downloadCertificate: (id: number) => {
    return api.get(`/certifications/certificates/${id}/download/`, {
      responseType: 'blob',
    }).then(response => {
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `certificat_${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Créer un lien de téléchargement et cliquer dessus
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  viewCertificate: (id: number) => api.get(`/certifications/certificates/${id}/view/`),
  shareCertificate: (id: number) => api.post(`/certifications/certificates/${id}/share/`),
  getEnterpriseStats: () => api.get('/certifications/certificates/enterprise_stats/'),
  getExpiringSoon: () => api.get('/certifications/certificates/expiring_soon/'),
};

export const paymentAPI = {
  getPayments: () => api.get('/certifications/payments/'),
  getPayment: (id: number) => api.get(`/certifications/payments/${id}/`),
  getPaymentByRequest: (requestId: number) => api.get(`/certifications/payments/by_request/?request_id=${requestId}`),
  createPayment: (data: any) => api.post('/certifications/payments/create_payment/', data),
  processPayment: (id: number, data: any) => api.post(`/certifications/payments/${id}/process/`, data),
  getReceipt: (id: number) => api.get(`/certifications/payments/${id}/receipt/`),
  refundPayment: (id: number, data: any) => api.post(`/certifications/payments/${id}/refund/`, data),
  getEnterpriseStats: () => api.get('/certifications/payments/enterprise_stats/'),
  getMonthlySummary: () => api.get('/certifications/payments/monthly_summary/'),
};

export const historyAPI = {
  getHistory: () => api.get('/certifications/history/'),
  getHistoryByRequest: (requestId: number) => api.get(`/certifications/history/by_request/?request_id=${requestId}`),
};

export const dailyInfoAPI = {
  getDailyInfo: () => api.get('/certifications/daily-info/'),
  createDailyInfo: (data: any) => api.post('/certifications/daily-info/', data),
  updateDailyInfo: (id: number, data: any) => api.patch(`/certifications/daily-info/${id}/`, data),
  deleteDailyInfo: (id: number) => api.delete(`/certifications/daily-info/${id}/`),
  getEnterpriseStats: () => api.get('/certifications/daily-info/enterprise_stats/'),
};

export const lawAPI = {
  getLaws: () => api.get('/laws/'),
  getLaw: (id: number) => api.get(`/laws/${id}/`),
};

export const treatmentTypeAPI = {
  getTreatmentTypes: () => api.get('/treatment-types/'),
  getTreatmentType: (id: number) => api.get(`/treatment-types/${id}/`),
};

// Legacy APIs - keeping for backward compatibility
export const certificationsAPI = {
  getStats: () => api.get('/certifications/requests/stats/'),
  getRecentRequests: () => api.get('/certifications/requests/recent/'),
  approveRequest: (id: number) => api.post(`/certifications/requests/${id}/approve/`),
  rejectRequest: (id: number, data: any) => api.post(`/certifications/requests/${id}/reject/`, data),
  assignRequest: (id: number, employeeId: number) => 
    api.post(`/certifications/requests/${id}/assign/`, { employee_id: employeeId }),
};

export const adminAPI = {
  // Gestion des utilisateurs
  getEnterprises: () => api.get('/accounts/companies/'),
  getEmployees: () => api.get('/accounts/employees/'),
  getAuthorities: () => api.get('/accounts/authorities/'),
  updateUserStatus: (id: number, isActive: boolean) => 
    api.patch(`/accounts/users/${id}/`, { is_active: isActive }),
  
  // Nouvelles APIs admin
  getDashboardStats: () => api.get('/regulations/admin/dashboard/stats/'),
  getUsers: (params?: any) => api.get('/regulations/admin/users/', { params }),
  getUser: (id: number) => api.get(`/regulations/admin/users/${id}/`),
  createUser: (data: any) => api.post('/regulations/admin/users/', data),
  updateUser: (id: number, data: any) => api.patch(`/regulations/admin/users/${id}/`, data),
  toggleUserActive: (id: number) => api.post(`/regulations/admin/users/${id}/toggle_active/`),
  resetUserPassword: (id: number) => api.post(`/regulations/admin/users/${id}/reset_password/`),
  
  // Types de traitement
  getTreatmentTypes: () => api.get('/regulations/admin/treatment-types/'),
  createTreatmentType: (data: any) => api.post('/regulations/admin/treatment-types/', data),
  updateTreatmentType: (id: number, data: any) => api.patch(`/regulations/admin/treatment-types/${id}/`, data),
  deleteTreatmentType: (id: number) => api.delete(`/regulations/admin/treatment-types/${id}/`),
  getTreatmentTypeStats: () => api.get('/regulations/admin/treatment-types/statistics/'),
  
  // Lois et réglementations
  getLaws: () => api.get('/regulations/admin/laws/'),
  createLaw: (data: any) => api.post('/regulations/admin/laws/', data),
  updateLaw: (id: number, data: any) => api.patch(`/regulations/admin/laws/${id}/`, data),
  deleteLaw: (id: number) => api.delete(`/regulations/admin/laws/${id}/`),
  
  // Structures de frais
  getFeeStructures: () => api.get('/regulations/admin/fee-structures/'),
  createFeeStructure: (data: any) => api.post('/regulations/admin/fee-structures/', data),
  updateFeeStructure: (id: number, data: any) => api.patch(`/regulations/admin/fee-structures/${id}/`, data),
  deleteFeeStructure: (id: number) => api.delete(`/regulations/admin/fee-structures/${id}/`),
  
  // Cycles de validation
  getValidationCycles: () => api.get('/regulations/admin/validation-cycles/'),
  createValidationCycle: (data: any) => api.post('/regulations/admin/validation-cycles/', data),
  updateValidationCycle: (id: number, data: any) => api.patch(`/regulations/admin/validation-cycles/${id}/`, data),
  deleteValidationCycle: (id: number) => api.delete(`/regulations/admin/validation-cycles/${id}/`),
  setDefaultCycle: (id: number) => api.post(`/regulations/admin/validation-cycles/${id}/set_as_default/`),
  
  // Configuration système
  getSystemConfigs: () => api.get('/regulations/admin/system-config/'),
  updateSystemConfig: (id: number, data: any) => api.patch(`/regulations/admin/system-config/${id}/`, data),
  getConfigCategories: () => api.get('/regulations/admin/system-config/categories/'),
  
  // Logs d'audit
  getAuditLogs: (params?: any) => api.get('/regulations/admin/audit-logs/', { params }),
  getAuditStats: () => api.get('/regulations/admin/audit-logs/statistics/'),
  
  // Métriques système
  getSystemMetrics: (params?: any) => api.get('/regulations/admin/metrics/', { params }),
  generateDailyMetrics: () => api.post('/regulations/admin/metrics/generate/'),

  // Notifications admin
  getNotifications: () => api.get('/regulations/admin/notifications/'),
  getUnreadNotificationsCount: () => api.get('/regulations/admin/notifications/unread_count/'),
  getRecentNotifications: () => api.get('/regulations/admin/notifications/recent/'),
  markNotificationAsRead: (id: number) => api.post(`/regulations/admin/notifications/${id}/mark_as_read/`),
  dismissNotification: (id: number) => api.post(`/regulations/admin/notifications/${id}/dismiss/`),
  markAllNotificationsAsRead: () => api.post('/regulations/admin/notifications/mark_all_as_read/'),
  createNotification: (data: any) => api.post('/regulations/admin/notifications/create_notification/', data),
  deleteNotification: (id: number) => api.delete(`/regulations/admin/notifications/${id}/`),
  
  // Export de données
  exportData: (data: any) => {
    return api.post('/regulations/admin/exports/export/', data, {
      responseType: 'blob',
    }).then(response => {
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `export_${Date.now()}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Créer un lien de téléchargement et cliquer dessus
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
};

// APIs pour les employés
export const employeeAPI = {
  // Dashboard et statistiques
  getDashboardStats: () => api.get('/certifications/employee/requests/dashboard_stats/'),
  
  // Gestion des demandes
  getRequests: (params?: any) => api.get('/certifications/employee/requests/', { params }),
  getRequest: (id: number) => api.get(`/certifications/employee/requests/${id}/`),
  assignToMe: (id: number) => api.post(`/certifications/employee/requests/${id}/assign_to_me/`),
  validateRequest: (id: number) => api.post(`/certifications/employee/requests/${id}/validate_request/`),
  rejectRequest: (id: number, data: any) => api.post(`/certifications/employee/requests/${id}/reject_request/`, data),
  generateCertificate: (id: number) => api.post(`/certifications/employee/requests/${id}/generate_certificate/`),
  approveAndGenerate: (id: number) => api.post(`/certifications/employee/requests/${id}/approve_and_generate/`),
  downloadDocuments: (id: number) => {
    // Pour les téléchargements, nous devons gérer la réponse différemment
    return api.get(`/certifications/employee/requests/${id}/download_documents/`, {
      responseType: 'blob',
    }).then(response => {
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `rapport_demande_${id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Créer un lien de téléchargement et cliquer dessus
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Formulaires dynamiques
  getDynamicForms: () => api.get('/certifications/employee/dynamic-forms/'),
  getDynamicForm: (id: number) => api.get(`/certifications/employee/dynamic-forms/${id}/`),
  getFormByTreatmentType: (treatmentType: string) => 
    api.get(`/certifications/employee/dynamic-forms/by_treatment_type/?treatment_type=${treatmentType}`),
  createDynamicForm: (data: any) => api.post('/certifications/employee/dynamic-forms/', data),
  updateDynamicForm: (id: number, data: any) => api.patch(`/certifications/employee/dynamic-forms/${id}/`, data),
  deleteDynamicForm: (id: number) => api.delete(`/certifications/employee/dynamic-forms/${id}/`),
  
  // Checklist des lois
  getLawChecklists: () => api.get('/certifications/employee/law-checklists/'),
  getLawChecklist: (id: number) => api.get(`/certifications/employee/law-checklists/${id}/`),
  getLawsByTreatmentType: (treatmentType: string) => 
    api.get(`/certifications/employee/law-checklists/by_treatment_type/?treatment_type=${treatmentType}`),
  createLawChecklist: (data: any) => api.post('/certifications/employee/law-checklists/', data),
  updateLawChecklist: (id: number, data: any) => api.patch(`/certifications/employee/law-checklists/${id}/`, data),
  deleteLawChecklist: (id: number) => api.delete(`/certifications/employee/law-checklists/${id}/`),
  
  // Archives
  getArchives: () => api.get('/certifications/employee/archives/'),
  getArchive: (id: number) => api.get(`/certifications/employee/archives/${id}/`),
  createArchive: (data: any) => api.post('/certifications/employee/archives/', data),
  archiveRequestDocuments: (requestId: number) => 
    api.post('/certifications/employee/archives/archive_request_documents/', { certification_request_id: requestId }),
  
  // Rapports de refus
  getRejectionReports: () => api.get('/certifications/rejection-reports/'),
  getRejectionReport: (id: number) => api.get(`/certifications/rejection-reports/${id}/`),
  createRejectionReport: (data: any) => api.post('/certifications/rejection-reports/', data),
  
  // Certificats
  getCertificates: () => api.get('/certifications/certificates/'),
  getCertificate: (id: number) => api.get(`/certifications/certificates/${id}/`),
  
  // Documents justificatifs
  getSupportingDocuments: () => api.get('/certifications/supporting-documents/'),
  getSupportingDocument: (id: number) => api.get(`/certifications/supporting-documents/${id}/`),
  getSupportingDocumentsByRequest: (requestId: number) => 
    api.get(`/certifications/supporting-documents/by_request/?request_id=${requestId}`),
  createSupportingDocument: (data: FormData) => 
    api.post('/certifications/supporting-documents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadMultipleSupportingDocuments: (data: FormData) => 
    api.post('/certifications/supporting-documents/upload_multiple/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteSupportingDocument: (id: number) => api.delete(`/certifications/supporting-documents/${id}/`),
  
  // Historique
  getHistory: () => api.get('/certifications/history/'),
  getHistoryByRequest: (requestId: number) => 
    api.get(`/certifications/history/by_request/?request_id=${requestId}`),
};

// APIs pour les autorités
export const authorityAPI = {
  // Dashboard et statistiques
  getCertificateStats: () => api.get('/certifications/authority/certificates/statistics/'),
  getRequestStats: () => api.get('/certifications/authority/requests/statistics/'),
  getAuditStats: () => api.get('/certifications/authority/companies/audit_report/'),
  
  // Consultation des certificats
  getCertificates: (params?: string) => api.get(`/certifications/authority/certificates/${params ? `?${params}` : ''}`),
  getCertificate: (id: number) => api.get(`/certifications/authority/certificates/${id}/`),
  validateCertificate: (id: number) => api.post(`/certifications/authority/certificates/${id}/validate/`),
  revokeCertificate: (id: number, data: any) => api.post(`/certifications/authority/certificates/${id}/revoke/`, data),
  exportCertificates: (params?: string) => {
    return api.get(`/certifications/authority/certificates/export/${params ? `?${params}` : ''}`, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'certificats_export.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Audit des demandes
  getRequests: (params?: string) => api.get(`/certifications/authority/requests/${params ? `?${params}` : ''}`),
  getRequest: (id: number) => api.get(`/certifications/authority/requests/${id}/`),
  exportRequests: (params?: string) => {
    return api.get(`/certifications/authority/requests/export/${params ? `?${params}` : ''}`, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'demandes_export.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Journal d'audit
  getAuditEntries: (params?: string) => api.get(`/certifications/authority/companies/audit_entries/${params ? `?${params}` : ''}`),
  getAuditEntry: (id: number) => api.get(`/certifications/authority/companies/audit_entries/${id}/`),
  exportAuditLog: (params?: string) => {
    return api.get(`/certifications/authority/companies/audit_entries/export/${params ? `?${params}` : ''}`, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'journal_audit.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Rapports d'audit
  generateAuditReport: (params?: any) => api.post('/certifications/authority/audit-reports/generate_report/', params),
  getAuditReports: () => api.get('/certifications/authority/audit-reports/'),
  getAuditReport: (id: number) => api.get(`/certifications/authority/audit-reports/${id}/`),
  downloadAuditReport: (id: number) => {
    return api.get(`/certifications/authority/audit-reports/${id}/download/`, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = `rapport_audit_${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Export des historiques
  exportHistoricalData: (params?: any) => {
    return api.post('/certifications/authority/exports/historical/', params, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'export_historique.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Documents en lecture seule
  getDocuments: (params?: string) => api.get(`/certifications/authority/companies/documents/${params ? `?${params}` : ''}`),
  getDocument: (id: number) => api.get(`/certifications/authority/companies/documents/${id}/`),
  downloadDocument: (id: number) => {
    return api.get(`/certifications/authority/companies/documents/${id}/download/`, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document_${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },
  
  // Rapport de conformité
  getComplianceReport: () => api.get('/certifications/authority/compliance/report/'),
  generateComplianceReport: (params?: any) => api.post('/certifications/authority/compliance/generate/', params),
  downloadComplianceReport: () => {
    return api.get('/certifications/authority/compliance/download/', {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'rapport_conformite.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    });
  },

  // Endpoints pour les notifications admin
  getNotifications: () => api.get('/regulations/admin/notifications/'),
  getUnreadNotificationsCount: () => api.get('/regulations/admin/notifications/unread_count/'),
  getRecentNotifications: () => api.get('/regulations/admin/notifications/recent/'),
  markNotificationAsRead: (id: number) => api.post(`/regulations/admin/notifications/${id}/mark_as_read/`),
  dismissNotification: (id: number) => api.post(`/regulations/admin/notifications/${id}/dismiss/`),
  markAllNotificationsAsRead: () => api.post('/regulations/admin/notifications/mark_all_as_read/'),
  createNotification: (data: any) => api.post('/regulations/admin/notifications/create_notification/', data),
  deleteNotification: (id: number) => api.delete(`/regulations/admin/notifications/${id}/`),
};

export default api;
