import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);
export const getMe = () => api.get('/auth/me');
export const getPendingOrganizations = () => api.get('/auth/pending-organizations');
export const approveOrganization = (id, status) => api.patch(`/auth/${id}/organization-approval`, { status });
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/password', data);
export const getOrganizationMembers = (params) => api.get('/auth/organization-members', { params });

// Challenges
export const getChallenges = (params) => api.get('/challenges', { params });
export const getLiveMapChallenges = () => api.get('/challenges/live-map');
export const getChallenge = (id) => api.get(`/challenges/${id}`);
export const createChallenge = (data) => api.post('/challenges', data);
export const updateChallengeStatus = (id, data) => api.patch(`/challenges/${id}/status`, data);
export const analyzeChallenge = (data) => api.post('/challenges/analyze', data);

// Projects  
export const getProjects = (params) => api.get('/projects', { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProjectStatus = (id, data) => api.patch(`/projects/${id}/status`, data);
export const updateProjectDetails = (id, data) => api.patch(`/projects/${id}/details`, data);
export const addTeamMember = (id, data) => api.post(`/projects/${id}/team`, data);
export const createMilestone = (id, data) => api.post(`/projects/${id}/milestones`, data);
export const updateMilestone = (id, milestoneId, data) => api.patch(`/projects/${id}/milestones/${milestoneId}`, data);
export const addTestingRecord = (id, data) => api.post(`/projects/${id}/testing`, data);
export const addOutcome = (id, data) => api.post(`/projects/${id}/outcomes`, data);
export const submitApproval = (id, data) => api.post(`/projects/${id}/approvals`, data);
export const getProjectApprovalRequests = () => api.get('/projects/approval-requests/pending');
export const getProjectTracking = () => api.get('/projects/tracking');
export const decideProjectOrganizationApproval = (id, data) => api.patch(`/projects/${id}/organization-approval`, data);

// Institutions
export const getMatchedChallenges = () => api.get('/institutions/matched-challenges');
export const getInstitutions = () => api.get('/institutions');
export const declineChallenge = (id, data) => api.post(`/institutions/decline/${id}`, data);
export const acceptChallenge = (id, data) => api.post(`/institutions/accept/${id}`, data);
export const requestChallengeInfo = (id) => api.post(`/institutions/request-info/${id}`);

// Industry
export const getCollaborations = () => api.get('/industry/collaborations');
export const getIndustryPartners = (challengeId) => api.get(`/industry/partners/${challengeId}`);
export const getIndustryDirectory = () => api.get('/industry/directory');
export const requestIndustrySupport = (challengeId, data) => api.post(`/industry/request/${challengeId}`, data);
export const submitInterest = (data) => api.post('/industry/interest', data);
export const getMyInterests = () => api.get('/industry/my-interests');
export const respondToIndustryInterest = (id, status) => api.patch(`/industry/interests/${id}`, { status });

// Matching
export const runMatching = (id) => api.post(`/matching/run/${id}`);
export const getMatchingResults = (id) => api.get(`/matching/results/${id}`);
export const confirmMatch = (id, data) => api.post(`/matching/confirm/${id}`, data);
export const previewMatches = (data) => api.post('/matching/preview', data);
export const notifyOrganization = (challengeId, data) => api.post(`/matching/notify/${challengeId}`, data);

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead = () => api.patch('/notifications/read-all');

// Analytics
export const getAnalyticsOverview = () => api.get('/analytics/overview');

export default api;
