// src/api.js
// Centralized API calls to the backend.
// Uses the CRA proxy (set in package.json) so no CORS issues in dev.

import axios from 'axios';

// Use an environment variable for the API URL in production, or fallback to the proxy in development.
const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: `${API_URL}/api` });

// ── Auth ──────────────────────────────────────

export const getAuthUrl = () =>
  axios.get(`${API_URL}/auth/url`).then((r) => r.data.url);

export const getHealth = () =>
  axios.get(`${API_URL}/health`).then((r) => r.data);

// ── Campaigns ─────────────────────────────────

export const fetchCampaigns = () =>
  api.get('/campaigns').then((r) => r.data.campaigns);

export const createCampaign = (payload) =>
  api.post('/campaigns', payload).then((r) => r.data);

export const updateCampaignStatus = (id, status) =>
  api.patch(`/campaigns/${id}/status`, { status }).then((r) => r.data);

// ── Ad Groups ─────────────────────────────────

export const createAdGroup = (payload) =>
  api.post('/adgroups', payload).then((r) => r.data);

// ── Ads ───────────────────────────────────────

export const createAd = (payload) =>
  api.post('/ads', payload).then((r) => r.data);

// ── Reports ───────────────────────────────────

export const fetchCampaignReport = (startDate, endDate) =>
  api
    .get('/reports/campaigns', { params: { startDate, endDate } })
    .then((r) => r.data.report);
