import fs from 'fs';
import path from 'path';
import { executeDailyResearchPipeline } from './services/scheduler.js';
import { DB } from './database.js';

async function runMultiDayVerificationTest() {
  console.log('=======================================================');
  console.log('🧪 MULTI-DAY DISCOVERY ENGINE VERIFICATION TEST');
  console.log(' Testing 5 Consecutive Working Days (Deduplication Check)');
  console.log('=======================================================\n');

  // Reset test database for clean run
  const dataDir = path.join(process.cwd(), 'server', 'data');
  fs.writeFileSync(path.join(dataDir, 'qualified_leads.json'), '[]', 'utf8');
  fs.writeFileSync(path.join(dataDir, 'company_history.json'), '[]', 'utf8');
  fs.writeFileSync(path.join(dataDir, 'research_runs.json'), '[]', 'utf8');

  const workingDays = [
    '2026-09-14', // Monday
    '2026-09-15', // Tuesday
    '2026-09-16', // Wednesday
    '2026-09-17', // Thursday
    '2026-09-18'  // Friday
  ];

  const dailyCompanyLists = {};
  let totalDuplicatesFound = 0;

  for (let i = 0; i < workingDays.length; i++) {
    const dateStr = workingDays[i];
    console.log(`\n📅 --- WORKING DAY ${i + 1} [${dateStr}] ---`);
    
    const result = await executeDailyResearchPipeline(dateStr, true);
    const leads = DB.getQualifiedLeads(dateStr);
    const companyNames = leads.map(l => l.companyName || l.company);
    dailyCompanyLists[dateStr] = companyNames;

    console.log(`✅ Qualified Leads Count: ${companyNames.length}`);
    console.log(`📋 Sample Top 5 Companies:`, companyNames.slice(0, 5));

    // Check overlap with prior working days
    if (i > 0) {
      const prevDate = workingDays[i - 1];
      const prevNames = dailyCompanyLists[prevDate];
      const overlap = companyNames.filter(name => prevNames.includes(name));

      console.log(`🔍 Overlap Check with Previous Working Day [${prevDate}]:`);
      console.log(`   Consecutive Duplicate Count: ${overlap.length}`);
      
      if (overlap.length > 0) {
        console.log(`   ⚠️ Duplicates Detected:`, overlap);
        totalDuplicatesFound += overlap.length;
      } else {
        console.log(`   ✅ 100% FRESH DATA! Zero repeated entries from ${prevDate}.`);
      }
    }
  }

  console.log('\n=======================================================');
  console.log('📊 MULTI-DAY VERIFICATION SUMMARY RESULTS');
  console.log('=======================================================');
  
  workingDays.forEach((day, idx) => {
    const count = dailyCompanyLists[day] ? dailyCompanyLists[day].length : 0;
    console.log(` Day ${idx + 1} [${day}]: ${count} qualified target companies`);
  });

  if (totalDuplicatesFound === 0) {
    console.log('\n🎉 TEST SUCCESS: Discovery engine produces 100% fresh data every working day with ZERO consecutive duplicates!');
    process.exit(0);
  } else {
    console.log(`\n❌ TEST FAILED: Found ${totalDuplicatesFound} duplicate company entries across consecutive working days.`);
    process.exit(1);
  }
}

runMultiDayVerificationTest().catch(err => {
  console.error('Fatal multi-day test error:', err);
  process.exit(1);
});
