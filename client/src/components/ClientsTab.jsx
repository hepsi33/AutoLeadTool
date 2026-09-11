import React, { useState, useEffect } from 'react';
import { Upload, Database, Plus, Search, Trash2, ShieldCheck, CheckCircle2, FileSpreadsheet, RefreshCw, Sparkles, Sliders } from 'lucide-react';

export default function ClientsTab({ onRefreshStats }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Normalization Tester state
  const [testName, setTestName] = useState('');
  const [testDomain, setTestDomain] = useState('');
  const [testResult, setTestResult] = useState(null);

  // New Client Form state
  const [newClient, setNewClient] = useState({
    companyName: '',
    domain: '',
    parentCompany: '',
    industry: 'Technology',
    relationshipType: 'Recruitment Partner',
    notes: ''
  });

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('Processing CSV client list...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/clients/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setUploadMessage(data.message || 'File uploaded successfully.');
      fetchClients();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      setUploadMessage('Error uploading client file.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.companyName.trim()) return;

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      setShowAddModal(false);
      setNewClient({ companyName: '', domain: '', parentCompany: '', industry: 'Technology', relationshipType: 'Recruitment Partner', notes: '' });
      fetchClients();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Are you sure you want to delete this client record?')) return;
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  const handleTestMatch = async () => {
    if (!testName.trim()) return;
    try {
      const res = await fetch('/api/clients/test-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, testDomain })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error('Match test error:', err);
    }
  };

  const filteredClients = clients.filter(c =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.domain && c.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & CSV Import */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Banner */}
        <div className="md:col-span-2 glass-panel p-5 border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Zyoin Client Master Database
                </h2>
                <p className="text-xs text-gray-400">
                  `zyoin_existing_clients` - Used by Exclusion Engine Check A to filter existing partners.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {clients.length} Master Client Records
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
              <Plus className="w-4 h-4" /> Add Single Client Record
            </button>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Exclusion Normalizer Active
            </span>
          </div>
        </div>

        {/* CSV Drag & Drop Upload */}
        <div className="glass-panel p-5 flex flex-col justify-between relative border border-indigo-500/20">
          <h3 className="text-xs font-extrabold uppercase text-gray-300 flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> IMPORT CLIENT CSV / XLSX
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">
            Upload Zyoin's existing client list (CSV format with Company Name, Website, Relationship).
          </p>

          <label className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors block bg-gray-900/40">
            <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs text-gray-300 font-medium block">Click to Browse & Upload CSV</span>
            <span className="text-[10px] text-gray-500 block">Supported: .csv, .xlsx</span>
            <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} className="hidden" />
          </label>

          {uploadMessage && (
            <p className="text-[11px] text-emerald-300 font-mono mt-2">{uploadMessage}</p>
          )}
        </div>
      </div>

      {/* Normalization & Similarity Tester Tool */}
      <div className="glass-panel p-5 border border-indigo-500/20">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" /> NORMALIZATION & MATCHING PREVIEW TESTER
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Test how company variations (e.g. "Acme Technologies Pvt Ltd" vs "ACME") normalize and match against the internal database.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Enter test company name (e.g. Swiggy India Pvt Ltd)"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Test domain (optional: swiggy.in)"
            value={testDomain}
            onChange={(e) => setTestDomain(e.target.value)}
            className="w-full sm:w-60 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
          />
          <button onClick={handleTestMatch} className="btn-secondary text-xs w-full sm:w-auto">
            Test Exclusion Match
          </button>
        </div>

        {testResult && (
          <div className="mt-3 p-3 rounded-lg bg-gray-900/80 border border-gray-800 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-gray-400">Normalized String:</span> <strong className="text-cyan-300">"{testResult.normalizedName}"</strong>
            </div>
            <div>
              <span className="text-gray-400">Match Found:</span> {testResult.matchFound ? (
                <strong className="text-rose-400">MATCHED ("{testResult.matchFound}") → EXCLUDED</strong>
              ) : (
                <strong className="text-emerald-400">NO MATCH FOUND → PASSED</strong>
              )}
            </div>
            <div className="text-gray-400 text-[11px] w-full mt-1">
              Details: {testResult.matchDetails?.reason}
            </div>
          </div>
        )}
      </div>

      {/* Client List Table */}
      <div className="glass-panel overflow-x-auto">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">Showing {filteredClients.length} of {clients.length}</span>
        </div>

        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
            <tr>
              <th className="p-3">Company Name</th>
              <th className="p-3">Normalized Name</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Industry</th>
              <th className="p-3">Relationship Type</th>
              <th className="p-3">Date Added</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-3 font-bold text-white">{client.companyName}</td>
                <td className="p-3 font-mono text-cyan-300">{client.normalizedName}</td>
                <td className="p-3 font-mono text-gray-400">{client.domain || 'N/A'}</td>
                <td className="p-3">{client.industry}</td>
                <td className="p-3 text-indigo-300">{client.relationshipType}</td>
                <td className="p-3 font-mono text-gray-500">{client.dateAdded}</td>
                <td className="p-3">
                  <button onClick={() => handleDeleteClient(client.id)} className="p-1 rounded text-rose-400 hover:bg-rose-950/40">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-md p-6 relative">
            <h2 className="text-lg font-bold text-white mb-4">Add Zyoin Client Record</h2>
            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Pvt Ltd"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Website Domain</label>
                <input
                  type="text"
                  placeholder="e.g. swiggy.in"
                  value={newClient.domain}
                  onChange={(e) => setNewClient({ ...newClient, domain: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Industry</label>
                <input
                  type="text"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Relationship Type</label>
                <input
                  type="text"
                  value={newClient.relationshipType}
                  onChange={(e) => setNewClient({ ...newClient, relationshipType: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Client Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
