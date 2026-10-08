import React, { useState, useEffect } from 'react';
import { getProjects, createProject } from '../api';

export default function NewProjectPage({ onBackToDashboard }) {
  const [existingClients, setExistingClients] = useState([]);
  const [isNewClient, setIsNewClient] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [description, setDescription] = useState('');

  // Client fields
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing clients for dropdown selection
    async function fetchClients() {
      try {
        const data = await getProjects();
        if (data.clients && data.clients.length > 0) {
          setExistingClients(data.clients);
          setClientId(data.clients[0].id);
          setIsNewClient(false);
        }
      } catch (err) {
        console.warn('Could not pre-load clients:', err);
      }
    }
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }

    if (!deadline) {
      setError('Please set a project deadline date.');
      return;
    }

    if (isNewClient && !clientName.trim()) {
      setError('Client name is required.');
      return;
    }

    try {
      setLoading(true);
      await createProject({
        title: title.trim(),
        category,
        budget: Number(budget) || 0,
        deadline,
        status,
        description: description.trim(),
        clientId: isNewClient ? null : clientId,
        clientName: isNewClient ? clientName.trim() : null,
        clientCompany: isNewClient ? clientCompany.trim() : null,
        clientEmail: isNewClient ? clientEmail.trim() : null
      });

      onBackToDashboard();
    } catch (err) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-page-container">
        <div className="form-card">
          <div className="form-header">
            <h1>New Freelance Project</h1>
            <p>Log a new contract, set deadlines, and configure client invoicing details.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="proj-title">Project Title *</label>
              <input
                id="proj-title"
                type="text"
                className="form-input"
                placeholder="e.g. Next.js SaaS Web App"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="proj-category">Category</label>
                <select
                  id="proj-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Backend API">Backend API</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-status">Initial Status</label>
                <select
                  id="proj-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="proj-budget">Agreed Budget (USD)</label>
                <input
                  id="proj-budget"
                  type="number"
                  min="0"
                  step="50"
                  className="form-input"
                  placeholder="2500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-deadline">Target Deadline *</label>
                <input
                  id="proj-deadline"
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="proj-desc">Scope & Deliverables</label>
              <textarea
                id="proj-desc"
                rows="3"
                className="form-textarea"
                placeholder="Key project milestones, repository link, or deliverables summary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Client Section */}
            <div className="form-section-title">Client Information</div>

            {existingClients.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="radio"
                    name="clientType"
                    checked={!isNewClient}
                    onChange={() => setIsNewClient(false)}
                  />
                  Select Existing Client
                </label>
                <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="radio"
                    name="clientType"
                    checked={isNewClient}
                    onChange={() => setIsNewClient(true)}
                  />
                  Add New Client
                </label>
              </div>
            )}

            {!isNewClient && existingClients.length > 0 ? (
              <div className="form-group">
                <label className="form-label" htmlFor="existing-client">Client</label>
                <select
                  id="existing-client"
                  className="form-select"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  {existingClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-name">Client Name *</label>
                    <input
                      id="client-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Elena Rostova"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required={isNewClient}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="client-company">Company / Organization</label>
                    <input
                      id="client-company"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Horizon Labs"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="client-email">Client Contact Email</label>
                  <input
                    id="client-email"
                    type="email"
                    className="form-input"
                    placeholder="elena@horizonlabs.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBackToDashboard}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                id="btn-save-project"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving Project...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
