// src/components/CreateCampaignForm.jsx
import React, { useState } from 'react';
import { createCampaign } from '../api';

const OBJECTIVES = [
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'REACH', label: 'Reach' },
  { value: 'VIDEO_VIEWS', label: 'Video Views' },
  { value: 'WEB_CONVERSIONS', label: 'Web Conversions' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'APP_PROMOTION', label: 'App Promotion' },
];

const BUDGET_MODES = [
  { value: 'BUDGET_MODE_DAY', label: 'Daily Budget' },
  { value: 'BUDGET_MODE_TOTAL', label: 'Lifetime Budget' },
];

export default function CreateCampaignForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    objective: 'TRAFFIC',
    budgetMode: 'BUDGET_MODE_DAY',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await createCampaign({
        ...form,
        budget: Number(form.budget),
      });
      setResult(data);
      if (onCreated) onCreated(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Campaign</h2>
      <p className="subtitle">
        Campaigns are created in <strong>DISABLED</strong> state — safe to test without spending budget.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Campaign Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Summer Sale 2024"
            required
          />
        </div>

        <div className="field">
          <label>Objective</label>
          <select name="objective" value={form.objective} onChange={handleChange}>
            {OBJECTIVES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Budget Mode</label>
            <select name="budgetMode" value={form.budgetMode} onChange={handleChange}>
              {BUDGET_MODES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Budget (USD)</label>
            <input
              name="budget"
              type="number"
              min="50"
              value={form.budget}
              onChange={handleChange}
              placeholder="50"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Campaign →'}
        </button>
      </form>

      {result && (
        <div className="success-box">
          ✅ Campaign created! ID: <code>{result.campaignId}</code>
        </div>
      )}
      {error && (
        <div className="error-box">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
