// src/components/CampaignList.jsx
import React, { useState } from 'react';
import { updateCampaignStatus } from '../api';

const STATUS_COLORS = {
  ENABLE: '#00c853',
  DISABLE: '#ff6d00',
  DELETE: '#b71c1c',
};

export default function CampaignList({ campaigns, onRefresh }) {
  const [updating, setUpdating] = useState(null);

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="card">
        <h2>Campaigns</h2>
        <p className="empty-state">No campaigns found. Create one above to get started.</p>
      </div>
    );
  }

  const handleToggle = async (campaign) => {
    const newStatus =
      campaign.operation_status === 'ENABLE' ? 'DISABLE' : 'ENABLE';
    setUpdating(campaign.campaign_id);
    try {
      await updateCampaignStatus(campaign.campaign_id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Campaigns ({campaigns.length})</h2>
        <button className="btn-secondary" onClick={onRefresh}>↻ Refresh</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Objective</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.campaign_id}>
              <td>
                <strong>{c.campaign_name}</strong>
                <div className="meta">ID: {c.campaign_id}</div>
              </td>
              <td>{c.objective_type}</td>
              <td>
                ${c.budget} / {c.budget_mode === 'BUDGET_MODE_DAY' ? 'day' : 'total'}
              </td>
              <td>
                <span
                  className="status-badge"
                  style={{ background: STATUS_COLORS[c.operation_status] || '#888' }}
                >
                  {c.operation_status}
                </span>
              </td>
              <td>
                <button
                  className="btn-small"
                  disabled={updating === c.campaign_id}
                  onClick={() => handleToggle(c)}
                >
                  {updating === c.campaign_id
                    ? '...'
                    : c.operation_status === 'ENABLE'
                    ? 'Pause'
                    : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
