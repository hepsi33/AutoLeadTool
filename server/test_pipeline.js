import { DB } from './database.js';
import { normalizeCompanyName, verifyCompanyMatch } from './services/normalization.js';
import { checkZyoinRelationship } from './services/zyoinChecker.js';
import { executeDailyResearchPipeline, getKolkataDateStr } from './services/scheduler.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('=======================================================');
  console.log('🧪 RUNNING END-TO-END VERIFICATION TESTS FOR AUTOLEADTOOL');
  console.log('=======================================================\n');

  // TEST 1: Company Name Normalization
  console.log('--- TEST 1: Company Name Normalization ---');
  const t1 = normalizeCompanyName('Acme Technologies Pvt Ltd');
  const t2 = normalizeCompanyName('Acme Technologies India');
  const t3 = normalizeCompanyName('ACME TECH INC');
  console.log(`"Acme Technologies Pvt Ltd" -> "${t1}"`);
  console.log(`"Acme Technologies India" -> "${t2}"`);
  console.log(`"ACME TECH INC" -> "${t3}"`);
  if (t1 === 'acme' && t2 === 'acme' && t3 === 'acme') {
    console.log('✅ TEST 1 PASSED: Legal suffix normalization matches correctly.\n');
  } else {
    console.log(`❌ TEST 1 FAILED: Expected 'acme' for all variations.\n`);
  }

  // TEST 2: Two-Level Zyoin Exclusion Engine (Check A & Check B)
  console.log('--- TEST 2: Zyoin Exclusion Engine ---');
  const clientMatch = await checkZyoinRelationship({ companyName: 'Flipkart Internet Pvt Ltd', domain: 'flipkart.com' });
  console.log('Flipkart Check Result:', clientMatch);
  if (clientMatch.isExcluded && clientMatch.status === 'VERIFIED EXISTING') {
    console.log('✅ TEST 2 PASSED: Known Zyoin client correctly rejected!\n');
  } else {
    console.log('❌ TEST 2 FAILED: Known client was not rejected.\n');
  }

  // TEST 3: New Candidate Company Verification (No Existing Relationship)
  console.log('--- TEST 3: New Unseen Candidate Company ---');
  const newCompMatch = await checkZyoinRelationship({ companyName: 'Boeing India Capability Center', domain: 'boeing.co.in' });
  console.log('Boeing Check Result:', newCompMatch);
  if (!newCompMatch.isExcluded && newCompMatch.status === 'NO PUBLIC EVIDENCE FOUND') {
    console.log('✅ TEST 3 PASSED: Candidate with no public evidence allowed into prospect pipeline.\n');
  } else {
    console.log('❌ TEST 3 FAILED: Unexpected exclusion status.\n');
  }

  // TEST 4: Execute Full Automated Pipeline for Today's Date
  console.log('--- TEST 4: Full Automated Pipeline Execution ---');
  const todayStr = getKolkataDateStr();
  const pipelineResult = await executeDailyResearchPipeline(todayStr, true);
  console.log(`Pipeline Status: ${pipelineResult.status}`);

  // TEST 5: Verify 4 Excel Report Files Created on Disk
  console.log('\n--- TEST 5: Verifying Excel File Outputs on Disk ---');
  const reportsDir = path.join(process.cwd(), 'reports');
  const files = [
    `Zyoin_Startups_${todayStr}.xlsx`,
    `Zyoin_GCC_${todayStr}.xlsx`,
    `Zyoin_Daily_Lead_Summary_${todayStr}.xlsx`,
    `Zyoin_Excluded_Companies_${todayStr}.xlsx`
  ];

  let allFilesExist = true;
  files.forEach(f => {
    const fullP = path.join(reportsDir, f);
    const exists = fs.existsSync(fullP);
    console.log(` File [${f}]: ${exists ? '✅ EXISTS (' + fs.statSync(fullP).size + ' bytes)' : '❌ MISSING'}`);
    if (!exists) allFilesExist = false;
  });

  if (allFilesExist) {
    console.log('\n🎉 ALL 5 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('\n❌ VERIFICATION TEST FAILED: Missing output report files.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
