// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getHealth, getAuthUrl, fetchCampaigns } from './api';
import CreateCampaignForm from './components/CreateCampaignForm';
import CampaignList from './components/CampaignList';
import './App.css';

export default function App() {
  const [health, setHealth] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [authUrl, setAuthUrl] = useState(null);

  // Check auth status on load
  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', hasToken: false }));
  }, []);

  // Load campaigns if authenticated
  const loadCampaigns = useCallback(async () => {
    if (!health?.hasToken) return;
    setLoadingCampaigns(true);
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [health?.hasToken]);

  useEffect(() => {
    if (health?.hasToken) loadCampaigns();
  }, [health?.hasToken, loadCampaigns]);

  // Handle OAuth redirect
  const handleConnect = async () => {
    try {
      const url = await getAuthUrl();
      setAuthUrl(url);
      window.open(url, '_blank');
    } catch {
      alert('Backend not running. Start the server first.');
    }
  };

  const isAuth = health?.hasToken;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">▲</span>
            <span className="logo-text">TikTok Ads <span className="logo-tag">POC</span></span>
          </div>
          <nav className="nav">
            {['campaigns', 'create', 'docs'].map((tab) => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'campaigns' && '📊 '}
                {tab === 'create' && '➕ '}
                {tab === 'docs' && '📖 '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {isAuth ? (
            <div className="auth-badge connected">
              <span className="dot" /> Connected · {health.advertiserId || 'TikTok Ads'}
            </div>
          ) : (
            <button className="btn-connect" onClick={handleConnect}>
              Connect TikTok Ads →
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <main className="main">
        {/* Not connected state */}
        {!isAuth && (
          <div className="auth-prompt">
            <div className="auth-prompt-icon">🎵</div>
            <h1>Connect Your TikTok Ads Account</h1>
            <p>
              This POC demonstrates how Blip can manage TikTok campaigns
              the same way it manages Meta campaigns today.
            </p>
            <div className="steps">
              <div className="step">
                <span className="step-num">1</span>
                <div>
                  <strong>Start the backend</strong>
                  <code>cd backend && npm start</code>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div>
                  <strong>Add credentials to .env</strong>
                  <code>TIKTOK_APP_ID, TIKTOK_APP_SECRET</code>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div>
                  <strong>Authorize via OAuth</strong>
                  <code>Click the button above</code>
                </div>
              </div>
            </div>
            <button className="btn-primary large" onClick={handleConnect}>
              Connect TikTok Ads Account →
            </button>
            {authUrl && (
              <p className="auth-url-hint">
                Opened in new tab. After authorizing, refresh this page.
              </p>
            )}
          </div>
        )}

        {/* Authenticated views */}
        {isAuth && (
          <>
            {activeTab === 'campaigns' && (
              <>
                <div className="page-title">
                  <h1>Campaigns</h1>
                  <p>Your TikTok Ads campaigns, fetched live from the API.</p>
                </div>
                {loadingCampaigns ? (
                  <div className="loading">Loading campaigns...</div>
                ) : (
                  <CampaignList campaigns={campaigns} onRefresh={loadCampaigns} />
                )}
              </>
            )}

            {activeTab === 'create' && (
              <>
                <div className="page-title">
                  <h1>Create Campaign</h1>
                  <p>Campaigns are created paused — no budget is spent until you enable them.</p>
                </div>
                <CreateCampaignForm
                  onCreated={() => {
                    loadCampaigns();
                    setActiveTab('campaigns');
                  }}
                />
              </>
            )}

            {activeTab === 'docs' && <ApiReferenceTab />}
          </>
        )}
      </main>
    </div>
  );
}

// ── Inline API Reference ──────────────────────────────────────────────────────

function ApiReferenceTab() {
  const endpoints = [
    {
      method: 'GET',
      path: '/auth/url',
      description: 'Get TikTok OAuth authorization URL',
      response: '{ url: "https://business-api.tiktok.com/portal/auth?..." }',
    },
    {
      method: 'GET',
      path: '/auth/callback?auth_code=...',
      description: 'OAuth callback — exchanges code for access token',
      response: 'Redirects to frontend with ?auth=success',
    },
    {
      method: 'GET',
      path: '/api/campaigns',
      description: 'List all campaigns for the advertiser',
      response: '{ campaigns: [...] }',
    },
    {
      method: 'POST',
      path: '/api/campaigns',
      description: 'Create a new campaign',
      body: '{ name, objective, budgetMode, budget }',
      response: '{ campaignId: "..." }',
    },
    {
      method: 'PATCH',
      path: '/api/campaigns/:id/status',
      description: 'Enable, disable, or delete a campaign',
      body: '{ status: "ENABLE" | "DISABLE" }',
      response: '{ success: true }',
    },
    {
      method: 'POST',
      path: '/api/adgroups',
      description: 'Create an ad group inside a campaign',
      body: '{ campaignId, name, budget, startTime, endTime, locationIds, ageGroups }',
      response: '{ adGroupId: "..." }',
    },
    {
      method: 'POST',
      path: '/api/ads',
      description: 'Create an ad creative inside an ad group',
      body: '{ adGroupId, name, videoId, adText, cta, landingPageUrl }',
      response: '{ adIds: [...] }',
    },
    {
      method: 'GET',
      path: '/api/reports/campaigns?startDate=&endDate=',
      description: 'Get campaign performance report (impressions, clicks, spend, CTR)',
      response: '{ report: { list: [...] } }',
    },
  ];

  const METHOD_COLORS = {
    GET: '#00c853',
    POST: '#2979ff',
    PATCH: '#ff6d00',
    DELETE: '#d50000',
  };

  return (
    <div className="page-title">
      <h1>API Reference</h1>
      <p>All backend endpoints exposed by this POC.</p>
      <div className="endpoint-list">
        {endpoints.map((ep, i) => (
          <div className="endpoint" key={i}>
            <div className="endpoint-header">
              <span
                className="method-badge"
                style={{ background: METHOD_COLORS[ep.method] }}
              >
                {ep.method}
              </span>
              <code className="endpoint-path">{ep.path}</code>
            </div>
            <p className="endpoint-desc">{ep.description}</p>
            {ep.body && (
              <div className="endpoint-meta">
                <strong>Body:</strong> <code>{ep.body}</code>
              </div>
            )}
            <div className="endpoint-meta">
              <strong>Returns:</strong> <code>{ep.response}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
