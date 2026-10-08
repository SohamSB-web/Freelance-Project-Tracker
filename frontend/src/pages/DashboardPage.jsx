import React, { useState, useEffect } from 'react';
import { getProjects, updateProject, deleteProject } from '../api';

export default function DashboardPage({ user, onNavigateNewProject }) {
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPipelineValue: 0,
    earnedValue: 0
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProjects();
      setProjects(data.projects || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setActionSuccess('');
      await updateProject(projectId, { status: newStatus });
      setActionSuccess('Project status updated.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update project status.');
    }
  };

  const handleDelete = async (projectId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      setActionSuccess('');
      await deleteProject(projectId);
      setActionSuccess(`Project "${title}" deleted.`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Progress': return 'badge-in-progress';
      case 'Planning': return 'badge-planning';
      case 'Completed': return 'badge-completed';
      case 'On Hold': return 'badge-on-hold';
      default: return 'badge-in-progress';
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Welcome, {user?.name || 'Freelancer'}</h1>
          <p>{user?.title || 'Independent Consultant'} • Phone: {user?.phone}</p>
        </div>
        <button
          id="btn-nav-new-project"
          className="btn btn-primary"
          onClick={onNavigateNewProject}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Project
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      {/* Overview Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Active Contracts</span>
          <span className="metric-value">{summary.activeProjects || 0}</span>
          <span className="metric-sub">Currently in development</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Pipeline</span>
          <span className="metric-value">{formatCurrency(summary.totalPipelineValue)}</span>
          <span className="metric-sub">All active & planned budgets</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Completed Earnings</span>
          <span className="metric-value">{formatCurrency(summary.earnedValue)}</span>
          <span className="metric-sub">{summary.completedProjects || 0} finished milestones</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Engagements</span>
          <span className="metric-value">{summary.totalProjects || 0}</span>
          <span className="metric-sub">Client contracts logged</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <input
            id="search-projects"
            type="text"
            className="form-input"
            placeholder="Search by project name, client, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-tabs">
          {['All', 'In Progress', 'Planning', 'Completed', 'On Hold'].map((status) => (
            <button
              key={status}
              className={`status-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          Loading your freelance workspace...
        </p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No projects found</h3>
              <p>
                {searchTerm || statusFilter !== 'All'
                  ? 'No contracts matched your search filters. Try resetting them.'
                  : 'You have not added any freelance projects yet. Create your first contract!'}
              </p>
              <button className="btn btn-secondary" onClick={onNavigateNewProject}>
                Create New Project
              </button>
            </div>
          ) : (
            filteredProjects.map((proj) => (
              <div key={proj.id} className="project-card">
                <div className="project-card-header">
                  <div>
                    <span className="project-category">{proj.category}</span>
                    <h3 className="project-title">{proj.title}</h3>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(proj.status)}`}>
                    {proj.status}
                  </span>
                </div>

                <p className="project-desc">{proj.description || 'No description specified.'}</p>

                <div className="project-meta-box">
                  <div className="client-info-unit">
                    <div className="client-name">{proj.client_name || 'Client'}</div>
                    <div className="client-company">{proj.client_company || proj.client_email || 'Direct Contract'}</div>
                  </div>
                  <div className="budget-info-unit">
                    <div className="budget-amount">{formatCurrency(proj.budget)}</div>
                    <div className="deadline-text">Due: {proj.deadline}</div>
                  </div>
                </div>

                <div className="project-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Status:</span>
                    <select
                      className="status-select-mini"
                      value={proj.status}
                      onChange={(e) => handleStatusChange(proj.id, e.target.value)}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Planning">Planning</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-outline btn-sm btn-danger"
                    onClick={() => handleDelete(proj.id, proj.title)}
                    title="Delete project"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
