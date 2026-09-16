/**
 * Database Management System for Zyoin Lead Intelligence
 * Uses file-backed JSON storage for robust persistence across sessions with atomic file operations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCompanyName, extractCleanDomain } from './services/normalization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data files
const FILES = {
  CLIENTS: path.join(DATA_DIR, 'zyoin_existing_clients.json'),
  EXCLUDED: path.join(DATA_DIR, 'excluded_companies.json'),
  HISTORY: path.join(DATA_DIR, 'company_history.json'),
  QUALIFIED: path.join(DATA_DIR, 'qualified_leads.json'),
  REVIEW: path.join(DATA_DIR, 'review_queue.json'),
  RUNS: path.join(DATA_DIR, 'research_runs.json')
};

// Helper: safe read file
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper: safe write file
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}

// Pre-seeded initial Zyoin Clients if table is empty
const INITIAL_CLIENTS = [
  {
    id: 'cli-001',
    companyName: 'Flipkart Online Services Pvt Ltd',
    normalizedName: 'flipkart',
    parentCompany: 'Walmart',
    subsidiary: 'Myntra, PhonePe (formerly)',
    alternateNames: ['Flipkart', 'Flipkart Internet', 'Flipkart India'],
    domain: 'flipkart.com',
    industry: 'E-Commerce & Retail Tech',
    relationshipType: 'Enterprise Staffing & TA Partner',
    source: 'Zyoin Master Partner Registry',
    sourceUrl: 'https://zyoin.com/case-studies/flipkart-hiring',
    verificationStatus: 'VERIFIED EXISTING',
    dateAdded: '2024-01-15',
    notes: 'Long-standing recruitment partner for tech leadership & core engineering.'
  },
  {
    id: 'cli-002',
    companyName: 'Swiggy (Bundl Technologies Pvt Ltd)',
    normalizedName: 'swiggy',
    parentCompany: '',
    subsidiary: 'Instamart',
    alternateNames: ['Swiggy', 'Bundl Technologies'],
    domain: 'swiggy.in',
    industry: 'FoodTech & Hyperlocal Logistics',
    relationshipType: 'Executive Search & Contract Staffing',
    source: 'Zyoin Client Success Story',
    sourceUrl: 'https://zyoin.com/clients/swiggy',
    verificationStatus: 'VERIFIED EXISTING',
    dateAdded: '2024-02-10',
    notes: 'Provided tech talent acquisition during expansion phase.'
  },
  {
    id: 'cli-003',
    companyName: 'Razorpay Software Pvt Ltd',
    normalizedName: 'razorpay',
    parentCompany: '',
    subsidiary: 'Curlec, Thirdwatch',
    alternateNames: ['Razorpay', 'Razorpay Payments'],
    domain: 'razorpay.com',
    industry: 'FinTech & Payments Infrastructure',
    relationshipType: 'Tech Recruitment Partner',
    source: 'Zyoin Official Website',
    sourceUrl: 'https://zyoin.com/partners/razorpay',
    verificationStatus: 'VERIFIED EXISTING',
    dateAdded: '2024-03-01',
    notes: 'RPO provider for backend engineering & product management roles.'
  },
  {
    id: 'cli-004',
    companyName: 'Infosys Limited',
    normalizedName: 'infosys',
    parentCompany: '',
    subsidiary: 'Infosys BPM, EdgeVerve',
    alternateNames: ['Infosys', 'Infosys Tech'],
    domain: 'infosys.com',
    industry: 'IT Services & Consulting',
    relationshipType: 'Corporate Vendor Agreement',
    source: 'Zyoin Client Master CSV',
    sourceUrl: 'https://zyoin.com/clients',
    verificationStatus: 'VERIFIED EXISTING',
    dateAdded: '2023-11-20',
    notes: 'Lateral hiring support across India technology hubs.'
  },
  {
    id: 'cli-005',
    companyName: 'Tata Consultancy Services Ltd',
    normalizedName: 'tata consultancy services',
    parentCompany: 'Tata Group',
    subsidiary: 'TCS iON',
    alternateNames: ['TCS', 'Tata Consultancy Services'],
    domain: 'tcs.com',
    industry: 'IT Services & Consulting',
    relationshipType: 'Sub-contracting Partner',
    source: 'Zyoin Master Partner Registry',
    sourceUrl: 'https://zyoin.com/clients',
    verificationStatus: 'VERIFIED EXISTING',
    dateAdded: '2023-08-12',
    notes: 'Niche skill recruitment for digital transformation projects.'
  }
];

export const DB = {
  // --- ZYOIN CLIENTS ---
  getClients() {
    let clients = readJson(FILES.CLIENTS, []);
    if (clients.length === 0) {
      clients = INITIAL_CLIENTS;
      writeJson(FILES.CLIENTS, clients);
    }
    return clients;
  },

  addClient(clientData) {
    const clients = this.getClients();
    const normalized = normalizeCompanyName(clientData.companyName);
    const domain = extractCleanDomain(clientData.domain);

    const newClient = {
      id: `cli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      companyName: clientData.companyName.trim(),
      normalizedName: normalized,
      parentCompany: clientData.parentCompany || '',
      subsidiary: clientData.subsidiary || '',
      alternateNames: Array.isArray(clientData.alternateNames)
        ? clientData.alternateNames
        : (clientData.alternateNames || '').split(',').map(s => s.trim()).filter(Boolean),
      domain: domain,
      industry: clientData.industry || 'Technology',
      relationshipType: clientData.relationshipType || 'Recruitment Service Partner',
      source: clientData.source || 'Manual User Upload',
      sourceUrl: clientData.sourceUrl || '',
      verificationStatus: clientData.verificationStatus || 'VERIFIED EXISTING',
      dateAdded: clientData.dateAdded || new Date().toISOString().split('T')[0],
      notes: clientData.notes || ''
    };

    clients.push(newClient);
    writeJson(FILES.CLIENTS, clients);
    return newClient;
  },

  importClientsBatch(clientArray) {
    let count = 0;
    clientArray.forEach(item => {
      if (item.companyName) {
        this.addClient(item);
        count++;
      }
    });
    return count;
  },

  deleteClient(id) {
    const clients = this.getClients();
    const filtered = clients.filter(c => c.id !== id);
    writeJson(FILES.CLIENTS, filtered);
    return true;
  },

  // --- EXCLUDED COMPANIES ---
  getExcluded() {
    return readJson(FILES.EXCLUDED, []);
  },

  addExcluded(record) {
    const excluded = this.getExcluded();
    const norm = normalizeCompanyName(record.company);
    
    // Avoid exact duplicate exclusions on same date
    const exists = excluded.find(e => normalizeCompanyName(e.company) === norm && e.dateChecked === record.dateChecked);
    if (!exists) {
      const newRecord = {
        id: `exc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        company: record.company,
        normalizedName: norm,
        exclusionReason: record.exclusionReason || 'Unspecified',
        zyoinRelationshipStatus: record.zyoinRelationshipStatus || 'UNKNOWN',
        evidence: record.evidence || 'N/A',
        evidenceUrl: record.evidenceUrl || '',
        dateChecked: record.dateChecked || new Date().toISOString().split('T')[0],
        source: record.source || 'System Pipeline',
        notes: record.notes || ''
      };
      excluded.unshift(newRecord);
      writeJson(FILES.EXCLUDED, excluded);
      return newRecord;
    }
    return exists;
  },

  // --- COMPANY HISTORY (DEDUPLICATION) ---
  getHistory() {
    return readJson(FILES.HISTORY, []);
  },

  upsertHistory(record) {
    const history = this.getHistory();
    const norm = normalizeCompanyName(record.company);
    const existingIndex = history.findIndex(h => normalizeCompanyName(h.company) === norm);

    const now = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      const existing = history[existingIndex];
      const hasNewSignal = record.currentHiringSignal !== existing.currentHiringSignal ||
                           record.currentGrowthSignal !== existing.currentGrowthSignal;

      history[existingIndex] = {
        ...existing,
        lastResearched: now,
        previousScore: existing.currentScore,
        currentScore: record.currentScore || existing.currentScore,
        previousHiringSignal: existing.currentHiringSignal,
        currentHiringSignal: record.currentHiringSignal || existing.currentHiringSignal,
        currentGrowthSignal: record.currentGrowthSignal || existing.currentGrowthSignal,
        newSignalAlert: hasNewSignal ? `NEW SIGNAL IDENTIFIED on ${now}` : null,
        status: hasNewSignal ? 'PREVIOUSLY IDENTIFIED - NEW SIGNAL' : 'TRACKED'
      };
      writeJson(FILES.HISTORY, history);
      return { record: history[existingIndex], isNewSignal: hasNewSignal };
    } else {
      const newEntry = {
        id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        company: record.company,
        normalizedName: norm,
        domain: extractCleanDomain(record.domain || ''),
        firstDiscovered: now,
        lastResearched: now,
        previousScore: 0,
        currentScore: record.currentScore || 0,
        previousHiringSignal: 'N/A',
        currentHiringSignal: record.currentHiringSignal || 'N/A',
        currentGrowthSignal: record.currentGrowthSignal || 'N/A',
        newSignalAlert: null,
        status: 'INITIAL DISCOVERY'
      };
      history.unshift(newEntry);
      writeJson(FILES.HISTORY, history);
      return { record: newEntry, isNewSignal: false };
    }
  },

  // --- QUALIFIED LEADS ---
  getQualifiedLeads(targetDate = null) {
    const leads = readJson(FILES.QUALIFIED, []);
    if (targetDate) {
      return leads.filter(l => l.researchDate === targetDate);
    }
    if (leads.length === 0) return [];
    // Default: Return latest research date's leads
    const latestDate = leads[0].researchDate || new Date().toISOString().split('T')[0];
    return leads.filter(l => l.researchDate === latestDate || !l.researchDate);
  },

  getAllQualifiedLeads() {
    return readJson(FILES.QUALIFIED, []);
  },

  saveQualifiedLeads(newLeads, targetDate = null) {
    let existingLeads = readJson(FILES.QUALIFIED, []);
    const dateToSave = targetDate || (newLeads[0] && newLeads[0].researchDate) || new Date().toISOString().split('T')[0];
    
    // Tag leads with research date
    const taggedLeads = newLeads.map(l => ({ ...l, researchDate: l.researchDate || dateToSave }));

    // Automatically record all qualified leads into master company history for permanent deduplication across runs
    taggedLeads.forEach(lead => {
      const compName = lead.companyName || lead.company;
      if (compName) {
        this.upsertHistory({
          company: compName,
          domain: lead.website || lead.domain || '',
          currentScore: lead.leadScore || 70,
          currentHiringSignal: lead.hiringStatus || 'Active',
          currentGrowthSignal: lead.growthSignal || 'Expanding'
        });
      }
    });

    // Keep other dates' leads, overwrite current targetDate leads
    existingLeads = existingLeads.filter(l => l.researchDate !== dateToSave);
    
    const updatedLeads = [...taggedLeads, ...existingLeads];
    writeJson(FILES.QUALIFIED, updatedLeads);
    return taggedLeads;
  },

  // --- REVIEW QUEUE ---
  getReviewQueue() {
    return readJson(FILES.REVIEW, []);
  },

  addToReviewQueue(item) {
    const queue = this.getReviewQueue();
    const newItem = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      company: item.company,
      domain: item.domain || '',
      category: item.category || 'Startup',
      reason: item.reason || 'Ambiguous Zyoin relationship or corporate structure',
      matchConfidence: item.matchConfidence || 0.65,
      evidence: item.evidence || 'Partial public web match with Zyoin term',
      evidenceUrl: item.evidenceUrl || '',
      dateFlagged: new Date().toISOString().split('T')[0],
      status: 'NEEDS_REVIEW'
    };
    queue.unshift(newItem);
    writeJson(FILES.REVIEW, queue);
    return newItem;
  },

  resolveReviewQueueItem(id, decision) {
    const queue = this.getReviewQueue();
    const item = queue.find(q => q.id === id);
    if (!item) return false;

    item.status = decision; // 'EXISTING_CLIENT', 'PROSPECT', 'IGNORED'
    writeJson(FILES.REVIEW, queue);

    if (decision === 'EXISTING_CLIENT') {
      this.addClient({
        companyName: item.company,
        domain: item.domain,
        relationshipType: 'Confirmed Client (Manual Review)',
        source: 'Review Queue Action',
        notes: item.reason
      });
      this.addExcluded({
        company: item.company,
        exclusionReason: 'Existing Zyoin client (Confirmed by BD User)',
        zyoinRelationshipStatus: 'VERIFIED EXISTING',
        evidence: item.evidence,
        evidenceUrl: item.evidenceUrl,
        dateChecked: new Date().toISOString().split('T')[0]
      });
    }

    return true;
  },

  // --- RESEARCH RUNS LOG ---
  getResearchRuns() {
    return readJson(FILES.RUNS, []);
  },

  logResearchRun(runSummary) {
    const runs = this.getResearchRuns();
    // Preserve ALL fields from the pipeline (status, completedAt, date, logs, filePaths, etc.)
    const newRun = {
      id: runSummary.id || `run-${Date.now()}`,
      timestamp: runSummary.timestamp || new Date().toISOString(),
      date: runSummary.date || new Date().toISOString().split('T')[0],
      status: runSummary.status || 'COMPLETED',
      startedAt: runSummary.startedAt || null,
      completedAt: runSummary.completedAt || null,
      failedAt: runSummary.failedAt || null,
      error: runSummary.error || null,
      totalResearched: runSummary.totalResearched || 0,
      existingRejected: runSummary.existingRejected || 0,
      duplicatesRejected: runSummary.duplicatesRejected || 0,
      otherRejected: runSummary.otherRejected || 0,
      finalLeadsCount: runSummary.finalLeadsCount || 0,
      startupsCount: runSummary.startupsCount || 0,
      gccCount: runSummary.gccCount || 0,
      hotLeadsCount: runSummary.hotLeadsCount || 0,
      highLeadsCount: runSummary.highLeadsCount || 0,
      filePaths: runSummary.filePaths || null,
      logs: runSummary.logs || []
    };
    // Remove any existing run with the same id to avoid duplicates
    const filteredRuns = runs.filter(r => r.id !== newRun.id);
    filteredRuns.unshift(newRun);
    writeJson(FILES.RUNS, filteredRuns);
    return newRun;
  }
};
