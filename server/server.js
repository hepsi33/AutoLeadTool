import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { DB } from './database.js';
import { normalizeCompanyName, verifyCompanyMatch } from './services/normalization.js';
import {
  initAutomatedScheduler,
  executeDailyResearchPipeline,
  getKolkataDateStr,
  getSystemSettings,
  saveSystemSettings
} from './services/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, 'uploads') });
const REPORTS_DIR = path.join(process.cwd(), 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Start Automated Background Scheduler on backend startup
initAutomatedScheduler();

// ==========================================
// 1. PIPELINE & STATUS ENDPOINTS
// ==========================================

// Get current date status in Asia/Kolkata
app.get('/api/research/status', (req, res) => {
  const todayStr = getKolkataDateStr();
  const runs = DB.getResearchRuns();
  const todayRun = runs.find(r => r.date === todayStr);

  if (todayRun) {
    res.json({
      todayDate: todayStr,
      status: todayRun.status,
      isSearching: todayRun.status === 'RUNNING',
      progressPercent: todayRun.progressPercent || (todayRun.status === 'COMPLETED' ? 100 : 0),
      currentCount: todayRun.currentCount || todayRun.finalLeadsCount || 0,
      step: todayRun.status === 'RUNNING' ? 'Running research & scoring engine...' : 'Research Complete',
      logs: todayRun.logs || [],
      run: todayRun
    });
  } else {
    res.json({
      todayDate: todayStr,
      status: 'NOT_STARTED',
      isSearching: false,
      run: null
    });
  }
});

// Manual Run / Override Trigger
app.post('/api/research/run', (req, res) => {
  const isForce = req.query.force === 'true' || req.body.force === true;
  const todayStr = getKolkataDateStr();

  executeDailyResearchPipeline(todayStr, isForce).catch(err => {
    console.error('Pipeline error:', err);
  });

  res.json({ status: 'RUNNING', message: 'Research pipeline launched in background.' });
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
  res.json(getSystemSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = saveSystemSettings(req.body);
  res.json({ message: 'Settings saved successfully', settings: updated });
});

// ==========================================
// 2. DASHBOARD STATS & LEADS
// ==========================================

app.get('/api/stats', (req, res) => {
  const todayStr = getKolkataDateStr();
  const qualifiedLeads = DB.getQualifiedLeads();
  const existingClients = DB.getClients();
  const excluded = DB.getExcluded();
  const reviewQueue = DB.getReviewQueue().filter(r => r.status === 'NEEDS_REVIEW');
  const runs = DB.getResearchRuns();
  const todayRun = runs.find(r => r.date === todayStr && r.status === 'COMPLETED');

  const startups = qualifiedLeads.filter(l => l.category === 'Startup');
  const gccs = qualifiedLeads.filter(l => l.category === 'GCC');
  const hotLeads = qualifiedLeads.filter(l => l.priority === 'HOT');
  const highLeads = qualifiedLeads.filter(l => l.priority === 'HIGH');

  res.json({
    dateToday: todayStr,
    runStatus: todayRun ? 'COMPLETED' : (runs.length > 0 ? runs[0].status : 'NOT_STARTED'),
    lastRunTimestamp: todayRun ? todayRun.completedAt : (runs.length > 0 ? runs[0].timestamp : null),
    totalQualifiedLeads: qualifiedLeads.length,
    startupsCount: startups.length,
    gccCount: gccs.length,
    hotLeadsCount: hotLeads.length,
    highLeadsCount: highLeads.length,
    totalClientsCount: existingClients.length,
    totalExcludedCount: excluded.length,
    excludedZyoinRelationshipsCount: excluded.filter(e => e.exclusionReason.includes('Zyoin') || e.zyoinRelationshipStatus.includes('EXISTING')).length,
    needsReviewCount: reviewQueue.length
  });
});

app.get('/api/leads', (req, res) => {
  const category = req.query.category;
  const priority = req.query.priority;
  const search = req.query.search;

  let leads = DB.getQualifiedLeads();

  if (category && category !== 'ALL') {
    leads = leads.filter(l => l.category === category);
  }
  if (priority && priority !== 'ALL') {
    leads = leads.filter(l => l.priority === priority);
  }
  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l =>
      (l.companyName || l.company || '').toLowerCase().includes(q) ||
      (l.industry || '').toLowerCase().includes(q) ||
      (l.indiaLocations || '').toLowerCase().includes(q)
    );
  }

  res.json(leads);
});

// ==========================================
// 3. ARCHIVED REPORTS & FILE DOWNLOADS
// ==========================================

app.get('/api/reports/archive', (req, res) => {
  const runs = DB.getResearchRuns();
  const completedRuns = runs.filter(r => r.status === 'COMPLETED');

  // Return list of available dates with their metrics
  const archive = completedRuns.map(r => ({
    date: r.date,
    completedAt: r.completedAt,
    finalLeadsCount: r.finalLeadsCount,
    startupsCount: r.startupsCount,
    gccCount: r.gccCount,
    hotLeadsCount: r.hotLeadsCount,
    highLeadsCount: r.highLeadsCount,
    filesAvailable: {
      startups: fs.existsSync(path.join(REPORTS_DIR, `Zyoin_Startups_${r.date}.xlsx`)),
      gcc: fs.existsSync(path.join(REPORTS_DIR, `Zyoin_GCC_${r.date}.xlsx`)),
      summary: fs.existsSync(path.join(REPORTS_DIR, `Zyoin_Daily_Lead_Summary_${r.date}.xlsx`)),
      exclusions: fs.existsSync(path.join(REPORTS_DIR, `Zyoin_Excluded_Companies_${r.date}.xlsx`))
    }
  }));

  res.json(archive);
});

app.get('/api/reports/download/:date/:type', (req, res) => {
  const { date, type } = req.params;
  let filename = '';

  if (type === 'startups') filename = `Zyoin_Startups_${date}.xlsx`;
  else if (type === 'gcc') filename = `Zyoin_GCC_${date}.xlsx`;
  else if (type === 'summary') filename = `Zyoin_Daily_Lead_Summary_${date}.xlsx`;
  else if (type === 'exclusions') filename = `Zyoin_Excluded_Companies_${date}.xlsx`;
  else return res.status(400).json({ error: 'Invalid report type' });

  const filePath = path.join(REPORTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `File ${filename} not found in persistent report archive.` });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.sendFile(filePath);
});

// Legacy direct export endpoints
app.get('/api/export/startups', (req, res) => {
  const todayStr = getKolkataDateStr();
  res.redirect(`/api/reports/download/${todayStr}/startups`);
});

app.get('/api/export/gcc', (req, res) => {
  const todayStr = getKolkataDateStr();
  res.redirect(`/api/reports/download/${todayStr}/gcc`);
});

app.get('/api/export/summary', (req, res) => {
  const todayStr = getKolkataDateStr();
  res.redirect(`/api/reports/download/${todayStr}/summary`);
});

app.get('/api/export/exclusions', (req, res) => {
  const todayStr = getKolkataDateStr();
  res.redirect(`/api/reports/download/${todayStr}/exclusions`);
});

// ==========================================
// 4. CLIENT MASTER DATABASE ENDPOINTS
// ==========================================

app.get('/api/clients', (req, res) => {
  res.json(DB.getClients());
});

app.post('/api/clients', (req, res) => {
  if (!req.body.companyName) {
    return res.status(400).json({ error: 'Company Name is required' });
  }
  const newClient = DB.addClient(req.body);
  res.json({ message: 'Client added successfully', client: newClient });
});

app.delete('/api/clients/:id', (req, res) => {
  DB.deleteClient(req.params.id);
  res.json({ message: 'Client deleted successfully' });
});

app.post('/api/clients/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, 'utf8');

  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      fs.unlinkSync(filePath);

      const clientsToAdd = [];
      results.data.forEach(row => {
        const compName = row['Company Name'] || row['Company'] || row['company_name'] || row['Company name'];
        if (compName) {
          clientsToAdd.push({
            companyName: compName,
            domain: row['Website'] || row['Domain'] || row['website'] || '',
            relationshipType: row['Relationship'] || row['Relationship Type'] || 'Uploaded Partner List',
            notes: row['Notes'] || row['notes'] || ''
          });
        }
      });

      const count = DB.importClientsBatch(clientsToAdd);
      res.json({ message: `Successfully imported ${count} clients into Zyoin Master Database.` });
    },
    error: (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: `CSV Parse Error: ${err.message}` });
    }
  });
});

app.post('/api/clients/test-match', (req, res) => {
  const { testName, testDomain } = req.body;
  if (!testName) return res.status(400).json({ error: 'testName is required' });

  const existingClients = DB.getClients();
  let matchFound = null;

  for (const client of existingClients) {
    const resMatch = verifyCompanyMatch(
      { name: testName, domain: testDomain },
      { name: client.companyName, domain: client.domain, parentCompany: client.parentCompany, altNames: client.alternateNames }
    );
    if (resMatch.isMatch || resMatch.isAmbiguous) {
      matchFound = { client, matchResult: resMatch };
      break;
    }
  }

  res.json({
    testName,
    normalizedName: normalizeCompanyName(testName),
    matchFound: matchFound ? matchFound.client.companyName : null,
    matchDetails: matchFound ? matchFound.matchResult : { isMatch: false, reason: 'No match found' }
  });
});

// ==========================================
// 5. REVIEW QUEUE & EXCLUSIONS
// ==========================================

app.get('/api/review-queue', (req, res) => {
  res.json(DB.getReviewQueue());
});

app.post('/api/review-queue/:id/decision', (req, res) => {
  const { decision } = req.body;
  const success = DB.resolveReviewQueueItem(req.params.id, decision);
  if (!success) return res.status(404).json({ error: 'Item not found' });
  res.json({ message: `Item marked as ${decision}` });
});

app.get('/api/exclusions', (req, res) => {
  res.json(DB.getExcluded());
});

// Serve production frontend assets (Unified Single URL Server)
const CLIENT_DIST = fs.existsSync(path.join(process.cwd(), 'client', 'dist'))
  ? path.join(process.cwd(), 'client', 'dist')
  : path.resolve(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ZYOIN LEAD INTELLIGENCE BACKEND RUNNING`);
  console.log(` Listening on PORT: ${PORT}`);
  console.log(` Timezone: Asia/Kolkata`);
  console.log(` Server-Side Daily Research Engine Active`);
  console.log(`=======================================================`);
});
