/**
 * Automated Persistent Daily Scheduler & Report Generator Engine
 * Runs on backend, independent of browser sessions or user activity.
 * Target Timezone: Asia/Kolkata (IST)
 * Default Schedule: 06:00 AM IST daily
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DB } from '../database.js';
import { checkZyoinRelationship } from './zyoinChecker.js';
import { discoverTargetCompanies } from './discoveryEngine.js';
import { verifyAndEnrichCompany } from './researchVerifier.js';
import { calculateLeadScore } from './scoringEngine.js';
import {
  generateStartupsExcel,
  generateGccExcel,
  generateDailySummaryExcel,
  generateExcludedExcel
} from './excelExporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(process.cwd(), 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Scheduler Settings File
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

export function getSystemSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const defaultSettings = {
        scheduledTime: '06:00',
        timezone: 'Asia/Kolkata',
        dailyTargetLeads: 50,
        autoRunEnabled: true,
        retryAttempts: 3
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
      return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (err) {
    return {
      scheduledTime: '06:00',
      timezone: 'Asia/Kolkata',
      dailyTargetLeads: 50,
      autoRunEnabled: true,
      retryAttempts: 3
    };
  }
}

export function saveSystemSettings(newSettings) {
  const updated = { ...getSystemSettings(), ...newSettings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

/**
 * Format current date in Asia/Kolkata (YYYY-MM-DD)
 */
export function getKolkataDateStr(dateObj = new Date()) {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // returns YYYY-MM-DD
  return formatter.format(dateObj);
}

/**
 * Execute the automated daily research pipeline for a target date
 * @param {string} targetDate YYYY-MM-DD
 * @param {boolean} isForceOverride If true, allows re-running completed dates
 */
export async function executeDailyResearchPipeline(targetDate = getKolkataDateStr(), isForceOverride = false) {
  console.log(`\n=======================================================`);
  console.log(`🤖 AUTOMATED PIPELINE: Starting research for date [${targetDate}]`);
  console.log(` Timezone: Asia/Kolkata | Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`=======================================================\n`);

  const runs = DB.getResearchRuns();
  const existingRun = runs.find(r => r.date === targetDate && r.status === 'COMPLETED');

  if (existingRun && !isForceOverride) {
    console.log(`ℹ️ Daily research for ${targetDate} already COMPLETED. Skipping duplicate execution.`);
    return { status: 'SKIPPED', message: `Research for ${targetDate} was already completed.`, run: existingRun };
  }

  // Record RUNNING status
  const runRecord = {
    id: `run-${Date.now()}`,
    timestamp: new Date().toISOString(),
    date: targetDate,
    status: 'RUNNING',
    startedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    logs: [`[${new Date().toLocaleTimeString()}] Pipeline launched for ${targetDate}.`]
  };

  // Update or insert run record
  let currentLogs = runRecord.logs;

  try {
    // 1. DISCOVER COMPANIES WITH DATE ROTATION & PREVIOUS QUALIFICATION EXCLUSION
    currentLogs.push(`[${new Date().toLocaleTimeString()}] Step 1/5: Discovering high-growth tech startups and expanding GCCs for date [${targetDate}]...`);
    
    const previouslyQualified = new Set();
    const allLeadsInDb = DB.getAllQualifiedLeads();
    allLeadsInDb.forEach(l => {
      if (l.researchDate && l.researchDate < targetDate) {
        previouslyQualified.add((l.companyName || l.company || '').toLowerCase());
      }
    });

    const history = DB.getHistory();
    history.forEach(h => {
      if (h.lastResearched && h.lastResearched < targetDate) {
        previouslyQualified.add((h.company || '').toLowerCase());
      }
    });

    const settings = getSystemSettings();
    const targetGccLimit = settings.targetGccs || 30;
    const targetStartupLimit = settings.targetStartups || 20;

    const rawCandidates = await discoverTargetCompanies(targetDate, 150, previouslyQualified);
    currentLogs.push(`[${new Date().toLocaleTimeString()}] Found ${rawCandidates.length} raw company candidates (Date rotation & deduplication active).`);

    let totalResearched = rawCandidates.length;
    let existingRejected = 0;
    let duplicatesRejected = 0;
    let otherRejected = 0;

    const qualifiedGccs = [];
    const qualifiedStartups = [];

    // 2. VERIFY & EXCLUDE
    currentLogs.push(`[${new Date().toLocaleTimeString()}] Step 2/5: Running 2-level Zyoin Exclusion Engine (Targeting ${targetGccLimit} GCCs + ${targetStartupLimit} Startups)...`);
    for (const raw of rawCandidates) {
      const isGcc = raw.category === 'GCC';
      if (isGcc && qualifiedGccs.length >= targetGccLimit) continue;
      if (!isGcc && qualifiedStartups.length >= targetStartupLimit) continue;

      const compName = raw.companyName || raw.company;
      const zyoinCheck = await checkZyoinRelationship(raw);

      if (zyoinCheck.isExcluded) {
        existingRejected++;
        currentLogs.push(`[${new Date().toLocaleTimeString()}] REJECTED (${zyoinCheck.status}): ${compName} - ${zyoinCheck.reason}`);
        DB.addExcluded({
          company: compName,
          exclusionReason: zyoinCheck.reason,
          zyoinRelationshipStatus: zyoinCheck.status,
          evidence: zyoinCheck.evidence,
          evidenceUrl: zyoinCheck.evidenceUrl,
          dateChecked: targetDate
        });

        if (zyoinCheck.isAmbiguous) {
          DB.addToReviewQueue({
            company: compName,
            domain: raw.website,
            category: raw.category,
            reason: zyoinCheck.reason,
            evidence: zyoinCheck.evidence,
            evidenceUrl: zyoinCheck.evidenceUrl
          });
        }
        continue;
      }

      // VERIFY HIRING & GROWTH SIGNALS
      const enriched = verifyAndEnrichCompany({
        ...raw,
        zyoinRelationshipStatus: zyoinCheck.status,
        zyoinCheckEvidence: zyoinCheck.evidence,
        zyoinCheckUrl: zyoinCheck.evidenceUrl
      });

      if (!enriched.relevantOpenings || enriched.relevantOpenings < 5) {
        otherRejected++;
        DB.addExcluded({
          company: compName,
          exclusionReason: 'Insufficient active hiring (<5 tech openings)',
          zyoinRelationshipStatus: zyoinCheck.status,
          evidence: 'Active requisitions below minimum threshold.',
          evidenceUrl: enriched.hiringEvidenceUrl || '',
          dateChecked: targetDate
        });
        continue;
      }

      // CALCULATE SCORE & PRIORITY
      const scoreResult = calculateLeadScore(enriched);
      const finalLead = {
        ...enriched,
        leadScore: scoreResult.leadScore,
        priority: scoreResult.priority,
        scoreBreakdown: scoreResult.scoreBreakdown,
        researchDate: targetDate
      };

      if (finalLead.leadScore < 55) {
        otherRejected++;
        DB.addExcluded({
          company: compName,
          exclusionReason: `Low lead score (${finalLead.leadScore}/100)`,
          zyoinRelationshipStatus: zyoinCheck.status,
          evidence: 'Score below minimum BD quality threshold (55).',
          evidenceUrl: enriched.hiringEvidenceUrl || '',
          dateChecked: targetDate
        });
        continue;
      }

      // DEDUPLICATION
      const histResult = DB.upsertHistory({
        company: compName,
        domain: raw.website,
        currentScore: finalLead.leadScore,
        currentHiringSignal: finalLead.hiringStatus,
        currentGrowthSignal: finalLead.growthSignal
      });

      if (histResult.isNewSignal) {
        finalLead.newSignalAlert = histResult.record.newSignalAlert;
      }

      if (isGcc) {
        qualifiedGccs.push(finalLead);
        currentLogs.push(`[${new Date().toLocaleTimeString()}] ✅ QUALIFIED GCC (#${qualifiedGccs.length}/${targetGccLimit}): ${compName} - Score ${finalLead.leadScore}`);
      } else {
        qualifiedStartups.push(finalLead);
        currentLogs.push(`[${new Date().toLocaleTimeString()}] ✅ QUALIFIED STARTUP (#${qualifiedStartups.length}/${targetStartupLimit}): ${compName} - Score ${finalLead.leadScore}`);
      }

      if (qualifiedGccs.length >= targetGccLimit && qualifiedStartups.length >= targetStartupLimit) break;
    }

    const qualifiedLeads = [...qualifiedGccs, ...qualifiedStartups];

    // 3. SORT & SAVE QUALIFIED LEADS
    qualifiedLeads.sort((a, b) => b.leadScore - a.leadScore);
    DB.saveQualifiedLeads(qualifiedLeads, targetDate);

    const startups = qualifiedLeads.filter(l => l.category === 'Startup');
    const gccs = qualifiedLeads.filter(l => l.category === 'GCC');
    const hotLeads = qualifiedLeads.filter(l => l.priority === 'HOT');
    const highLeads = qualifiedLeads.filter(l => l.priority === 'HIGH');

    // 4. GENERATE & PERSIST EXCEL FILES TO DISK
    currentLogs.push(`[${new Date().toLocaleTimeString()}] Step 4/5: Generating and persisting Excel report files...`);

    const startupsWb = await generateStartupsExcel(startups, targetDate);
    const gccWb = await generateGccExcel(gccs, targetDate);
    const excludedRecords = DB.getExcluded().filter(e => e.dateChecked === targetDate || e.dateChecked === new Date().toISOString().split('T')[0]);

    const runStats = {
      totalResearched,
      existingRejected,
      duplicatesRejected,
      otherRejected,
      finalLeadsCount: qualifiedLeads.length,
      startupsCount: startups.length,
      gccCount: gccs.length,
      hotLeadsCount: hotLeads.length,
      highLeadsCount: highLeads.length
    };

    const summaryWb = await generateDailySummaryExcel(runStats, qualifiedLeads, targetDate);
    const excludedWb = await generateExcludedExcel(excludedRecords, targetDate);

    // Save report files on disk
    const filePaths = {
      startups: path.join(REPORTS_DIR, `Zyoin_Startups_${targetDate}.xlsx`),
      gcc: path.join(REPORTS_DIR, `Zyoin_GCC_${targetDate}.xlsx`),
      summary: path.join(REPORTS_DIR, `Zyoin_Daily_Lead_Summary_${targetDate}.xlsx`),
      exclusions: path.join(REPORTS_DIR, `Zyoin_Excluded_Companies_${targetDate}.xlsx`)
    };

    await startupsWb.xlsx.writeFile(filePaths.startups);
    await gccWb.xlsx.writeFile(filePaths.gcc);
    await summaryWb.xlsx.writeFile(filePaths.summary);
    await excludedWb.xlsx.writeFile(filePaths.exclusions);

    currentLogs.push(`[${new Date().toLocaleTimeString()}] Step 5/5: Saved 4 Excel reports to disk for ${targetDate}.`);

    // MARK RUN COMPLETED
    const finalRunObj = {
      ...runRecord,
      status: 'COMPLETED',
      completedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      totalResearched,
      existingRejected,
      duplicatesRejected,
      otherRejected,
      finalLeadsCount: qualifiedLeads.length,
      startupsCount: startups.length,
      gccCount: gccs.length,
      hotLeadsCount: hotLeads.length,
      highLeadsCount: highLeads.length,
      filePaths,
      logs: currentLogs
    };

    DB.logResearchRun(finalRunObj);

    console.log(`✅ AUTOMATED PIPELINE SUCCESS: Completed research for ${targetDate} (${qualifiedLeads.length} leads generated)`);
    return { status: 'COMPLETED', run: finalRunObj };
  } catch (err) {
    console.error(`❌ AUTOMATED PIPELINE ERROR for ${targetDate}:`, err);
    const failedRunObj = {
      ...runRecord,
      status: 'FAILED',
      failedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      error: err.message,
      logs: [...currentLogs, `[${new Date().toLocaleTimeString()}] FATAL ERROR: ${err.message}`]
    };
    DB.logResearchRun(failedRunObj);
    return { status: 'FAILED', error: err.message, run: failedRunObj };
  }
}

/**
 * Initialize background cron & boot check
 */
export function initAutomatedScheduler() {
  console.log(`\n=======================================================`);
  console.log(`⏰ AUTOMATED SCHEDULER INITIALIZATION`);
  console.log(` System Timezone: Asia/Kolkata`);
  console.log(` Default Daily Time: 06:00 AM IST`);
  console.log(`=======================================================\n`);

  const todayStr = getKolkataDateStr();
  const runs = DB.getResearchRuns();
  const todayCompleted = runs.find(r => r.date === todayStr && r.status === 'COMPLETED');

  if (!todayCompleted) {
    console.log(`⚡ BOOT CHECK: No completed research found for today [${todayStr}]. Running automated research pipeline now...`);
    executeDailyResearchPipeline(todayStr, false);
  } else {
    console.log(`✅ BOOT CHECK: Research for today [${todayStr}] is ALREADY COMPLETED. Dashboard ready.`);
  }

  // Schedule daily check interval (checks every minute if clock strikes 06:00 IST)
  setInterval(() => {
    const nowKolkata = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const currentDateStr = getKolkataDateStr();
    const settings = getSystemSettings();
    const targetTime = settings.scheduledTime || '06:00';

    const currentHours = new Date(nowKolkata).getHours();
    const currentMinutes = new Date(nowKolkata).getMinutes();

    const [targetH, targetM] = targetTime.split(':').map(Number);

    if (currentHours === targetH && currentMinutes === targetM) {
      const allRuns = DB.getResearchRuns();
      const isAlreadyDone = allRuns.some(r => r.date === currentDateStr && r.status === 'COMPLETED');

      if (!isAlreadyDone) {
        console.log(`⏰ SCHEDULED ALARM TRIGGER: 06:00 AM IST reached for date [${currentDateStr}]. Triggering daily research pipeline...`);
        executeDailyResearchPipeline(currentDateStr, false);
      }
    }
  }, 60000); // Check every 60 seconds
}
