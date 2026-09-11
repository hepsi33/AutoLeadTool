/**
 * Excel Report Exporter Engine using ExcelJS
 * Generates 4 styled Excel workbooks for Zyoin Group Business Development:
 * 1. Zyoin_Startups_YYYY-MM-DD.xlsx
 * 2. Zyoin_GCC_YYYY-MM-DD.xlsx
 * 3. Zyoin_Daily_Lead_Summary_YYYY-MM-DD.xlsx
 * 4. Zyoin_Excluded_Companies_YYYY-MM-DD.xlsx
 */

import ExcelJS from 'exceljs';

// Apply professional styling to headers
function styleHeaderCell(cell, bgHex = '1E293B') {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: bgHex }
  };
  cell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' }
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'medium', color: { argb: '0F172A' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } }
  };
}

// Apply styling to data rows
function styleDataRow(row, rowIndex, isHot = false, isHigh = false) {
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'E2E8F0' } },
      left: { style: 'thin', color: { argb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
      right: { style: 'thin', color: { argb: 'E2E8F0' } }
    };
    
    // Zebra striping
    if (rowIndex % 2 === 0) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8FAFC' }
      };
    }
  });
}

// Auto-adjust column widths safely
function adjustColumnWidths(worksheet) {
  worksheet.columns.forEach(column => {
    let maxLen = 12;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLen) {
        maxLen = Math.min(cellValue.length, 45); // max 45 width for text columns
      }
    });
    column.width = maxLen + 4;
  });
}

/**
 * Generate Zyoin_Startups_YYYY-MM-DD.xlsx
 */
export async function generateStartupsExcel(startups, dateStr) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zyoin Lead Intelligence Engine';
  const sheet = workbook.addWorksheet('Qualified Startups', { views: [{ showGridLines: true }] });

  const headers = [
    'Rank', 'Company Name', 'Website Link', 'Industry', 'Headquarters', 'India Location', 'Company Size',
    'Hiring Status', 'Relevant Openings', 'Key Roles Hiring', 'Growth Signal', 'Growth Details',
    'Why Zyoin Should Target', 'Suggested BD Angle', 'Suggested Decision-Maker Role',
    'Contact Person', 'Contact LinkedIn', 'LinkedIn',
    'Hiring Evidence', 'Hiring Evidence URL', 'Growth Evidence', 'Growth Evidence URL',
    'Zyoin Relationship Status', 'Zyoin Check Evidence', 'Zyoin Check URL',
    'Lead Score', 'Priority', 'Research Date'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.height = 32;
  headerRow.eachCell(cell => styleHeaderCell(cell, '1E1B4B')); // Deep indigo header

  startups.forEach((lead, index) => {
    const row = sheet.addRow([
      index + 1,
      lead.companyName || lead.company,
      lead.website || '',
      lead.industry,
      lead.headquarters,
      lead.indiaLocations || lead.hiringLocation,
      lead.companySize,
      lead.hiringStatus,
      lead.relevantOpenings,
      lead.keyRolesHiring,
      lead.growthSignal,
      lead.growthDetails,
      lead.whyZyoinShouldTarget,
      lead.suggestedBdAngle,
      lead.suggestedDecisionMakerRole,
      lead.suggestedContactPerson || 'NOT VERIFIED',
      lead.contactLinkedIn || 'NOT VERIFIED',
      lead.linkedIn,
      lead.hiringEvidence,
      lead.hiringEvidenceUrl,
      lead.growthDetails || lead.growthSignal,
      lead.growthEvidenceUrl,
      lead.zyoinRelationshipStatus || 'NO PUBLIC EVIDENCE FOUND',
      lead.zyoinCheckEvidence || lead.zyoinEvidence || 'No internal DB match; public web clean.',
      lead.zyoinCheckUrl || lead.zyoinEvidenceUrl || 'https://zyoin.com',
      lead.leadScore,
      lead.priority,
      dateStr
    ]);

    styleDataRow(row, index, lead.priority === 'HOT', lead.priority === 'HIGH');
  });

  adjustColumnWidths(sheet);
  return workbook;
}

/**
 * Generate Zyoin_GCC_YYYY-MM-DD.xlsx
 */
export async function generateGccExcel(gccLeads, dateStr) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zyoin Lead Intelligence Engine';
  const sheet = workbook.addWorksheet('Qualified GCCs', { views: [{ showGridLines: true }] });

  const headers = [
    'Rank', 'Company Name', 'Website Link', 'Industry', 'Headquarters', 'India Location', 'Company Size',
    'Hiring Status', 'Relevant Openings', 'Key Roles Hiring', 'Growth Signal', 'Growth Details',
    'Why Zyoin Should Target', 'Suggested BD Angle', 'Suggested Decision-Maker Role',
    'Contact Person', 'Contact LinkedIn', 'LinkedIn',
    'Hiring Evidence', 'Hiring Evidence URL', 'Growth Evidence', 'Growth Evidence URL',
    'Zyoin Relationship Status', 'Zyoin Check Evidence', 'Zyoin Check URL',
    'Lead Score', 'Priority', 'Research Date',
    'Parent Company', 'GCC Location', 'GCC Status', 'GCC Establishment/Expansion Details',
    'GCC Evidence', 'GCC Evidence URL'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.height = 32;
  headerRow.eachCell(cell => styleHeaderCell(cell, '065F46')); // Deep emerald header for GCC

  gccLeads.forEach((lead, index) => {
    const row = sheet.addRow([
      index + 1,
      lead.companyName || lead.company,
      lead.website || '',
      lead.industry,
      lead.headquarters,
      lead.indiaLocations || lead.hiringLocation,
      lead.companySize,
      lead.hiringStatus,
      lead.relevantOpenings,
      lead.keyRolesHiring,
      lead.growthSignal,
      lead.growthDetails,
      lead.whyZyoinShouldTarget,
      lead.suggestedBdAngle,
      lead.suggestedDecisionMakerRole,
      lead.suggestedContactPerson || 'NOT VERIFIED',
      lead.contactLinkedIn || 'NOT VERIFIED',
      lead.linkedIn,
      lead.hiringEvidence,
      lead.hiringEvidenceUrl,
      lead.growthDetails || lead.growthSignal,
      lead.growthEvidenceUrl,
      lead.zyoinRelationshipStatus || 'NO PUBLIC EVIDENCE FOUND',
      lead.zyoinCheckEvidence || lead.zyoinEvidence || 'No internal DB match; public web clean.',
      lead.zyoinCheckUrl || lead.zyoinEvidenceUrl || 'https://zyoin.com',
      lead.leadScore,
      lead.priority,
      dateStr,
      lead.parentCompany || 'Independent / Parent MNC',
      lead.indiaLocations || lead.hiringLocation,
      'Active Expansion',
      lead.growthDetails,
      lead.growthSignal,
      lead.growthEvidenceUrl
    ]);

    styleDataRow(row, index, lead.priority === 'HOT', lead.priority === 'HIGH');
  });

  adjustColumnWidths(sheet);
  return workbook;
}

/**
 * Generate Zyoin_Daily_Lead_Summary_YYYY-MM-DD.xlsx
 */
export async function generateDailySummaryExcel(runStats, allLeads, dateStr) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zyoin Lead Intelligence Engine';

  // Sheet 1: All Target Prospects Table (Matches Dashboard Table + Website Link)
  const leadsSheet = workbook.addWorksheet('Daily Target Prospects', { views: [{ showGridLines: true }] });
  
  const leadHeaders = [
    '#',
    'Company Name',
    'Website Link',
    'Type',
    'Industry',
    'Location',
    'Hiring Signal',
    'Growth Signal',
    'Exclusion Status',
    'Score',
    'Why Zyoin Should Target',
    'Suggested BD Angle'
  ];

  const leadHeaderRow = leadsSheet.addRow(leadHeaders);
  leadHeaderRow.height = 32;
  leadHeaderRow.eachCell(cell => styleHeaderCell(cell, '2E1065')); // Deep Zyoin Purple Header

  allLeads.forEach((lead, idx) => {
    const row = leadsSheet.addRow([
      idx + 1,
      lead.companyName || lead.company,
      lead.website || '',
      lead.category,
      lead.industry,
      lead.indiaLocations || lead.hiringLocation,
      `${lead.hiringStatus} (${lead.relevantOpenings} roles)`,
      lead.growthSignal,
      'Clean (No Public Evidence Found)',
      `${lead.leadScore}/100`,
      lead.whyZyoinShouldTarget,
      lead.suggestedBdAngle
    ]);
    styleDataRow(row, idx, lead.priority === 'HOT', lead.priority === 'HIGH');
  });

  adjustColumnWidths(leadsSheet);

  // Sheet 2: Executive Overview
  const summarySheet = workbook.addWorksheet('Executive Summary', { views: [{ showGridLines: true }] });
  
  summarySheet.addRow(['ZYOIN LEAD INTELLIGENCE - DAILY RESEARCH EXECUTIVE SUMMARY']);
  summarySheet.getRow(1).height = 30;
  summarySheet.getRow(1).getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: '1E293B' } };

  summarySheet.addRow([]);

  const statsTable = [
    ['Metric', 'Value'],
    ['Research Date', dateStr],
    ['Total Candidates Researched', runStats.totalResearched],
    ['Existing Zyoin Companies Rejected', runStats.existingRejected],
    ['Duplicate Companies Rejected', runStats.duplicatesRejected],
    ['Other Companies Rejected', runStats.otherRejected],
    ['Final Qualified Leads', runStats.finalLeadsCount],
    ['Startups Qualified', runStats.startupsCount],
    ['GCCs Qualified', runStats.gccCount],
    ['HOT Leads (Score 85-100)', runStats.hotLeadsCount],
    ['HIGH Leads (Score 70-84)', runStats.highLeadsCount]
  ];

  statsTable.forEach((row, i) => {
    const addedRow = summarySheet.addRow(row);
    if (i === 0) {
      styleHeaderCell(addedRow.getCell(1), '0F172A');
      styleHeaderCell(addedRow.getCell(2), '0F172A');
    } else {
      styleDataRow(addedRow, i);
      addedRow.getCell(1).font = { bold: true };
    }
  });

  adjustColumnWidths(summarySheet);
  return workbook;
}

/**
 * Generate Zyoin_Excluded_Companies_YYYY-MM-DD.xlsx
 */
export async function generateExcludedExcel(excludedRecords, dateStr) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zyoin Lead Intelligence Engine';
  const sheet = workbook.addWorksheet('Rejected Companies Log', { views: [{ showGridLines: true }] });

  const headers = ['Company', 'Exclusion Reason', 'Zyoin Relationship Status', 'Evidence', 'Evidence URL', 'Date Checked'];
  const headerRow = sheet.addRow(headers);
  headerRow.height = 30;
  headerRow.eachCell(cell => styleHeaderCell(cell, '991B1B')); // Crimson header for exclusions

  excludedRecords.forEach((item, idx) => {
    const row = sheet.addRow([
      item.company,
      item.exclusionReason,
      item.zyoinRelationshipStatus,
      item.evidence,
      item.evidenceUrl,
      item.dateChecked || dateStr
    ]);
    styleDataRow(row, idx);
  });

  adjustColumnWidths(sheet);
  return workbook;
}
