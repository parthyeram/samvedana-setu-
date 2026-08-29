import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import LiveMap from './pages/citizen/LiveMap';
import ReportChallenge from './pages/citizen/ReportChallenge';
import MyChallenges from './pages/citizen/MyChallenges';
import ChallengeDetail from './pages/citizen/ChallengeDetail';
import Profile from './pages/citizen/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import MatchingPage from './pages/admin/MatchingPage';
import OrganizationApprovals from './pages/admin/OrganizationApprovals';

import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstituteDirectory from './pages/institution/InstituteDirectory';
import IndustryDirectory from './pages/industry/IndustryDirectory';
import AcceptedCollaborations from './pages/industry/AcceptedCollaborations';
import MatchedChallenges from './pages/institution/MatchedChallenges';
import AcceptChallenge from './pages/institution/AcceptChallenge';
import ProjectDetail from './pages/institution/ProjectDetail';
import MyProjects from './pages/institution/MyProjects';
import IndustryCollaboration from './pages/institution/IndustryCollaboration';

import IndustryDashboard from './pages/industry/IndustryDashboard';
import PotentialCollaborations from './pages/industry/PotentialCollaborations';
import MyInterests from './pages/industry/MyInterests';

import Notifications from './pages/Notifications';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Keep the root URL on the shared four-role login screen. */}
      <Route path="/" element={<Login />} />

      {/* Protected Routes wrapped in Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<CitizenDashboard />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="/report" element={<ReportChallenge />} />
        <Route path="/challenges" element={<MyChallenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verification" element={<VerificationQueue />} />
        <Route path="/admin/matching" element={<MatchingPage />} />
        <Route path="/admin/analytics" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/organizations" element={<OrganizationApprovals />} />

        <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        <Route path="/institution/directory" element={<InstituteDirectory />} />
        <Route path="/institution/matched" element={<MatchedChallenges />} />
        <Route path="/institution/accept/:id" element={<AcceptChallenge />} />
        <Route path="/institution/projects" element={<MyProjects />} />
        <Route path="/institution/collaboration" element={<IndustryCollaboration />} />
        <Route path="/institution/projects/:id" element={<ProjectDetail />} />

        <Route path="/industry/dashboard" element={<IndustryDashboard />} />
        <Route path="/industry/directory" element={<IndustryDirectory />} />
        <Route path="/industry/collaborations" element={<PotentialCollaborations />} />
        <Route path="/industry/interests" element={<MyInterests />} />
        <Route path="/industry/accepted" element={<AcceptedCollaborations />} />
        <Route path="/industry/projects/:id" element={<ProjectDetail />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
