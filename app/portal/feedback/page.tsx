'use client'
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle, AlertCircle, Search, Filter, X, Plus, Eye, MessageCircleMore, Clock, CheckCheck, XCircle, Download } from 'lucide-react';
import { Feedback, FeedbackSubmission } from '@/types/dashboard/feedback';
import { getAllFeedback, submitFeedback, updateFeedbackStatus } from '@/app/api/dashboard/feedback';
import { toast } from 'react-toastify';

const FeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getAllFeedback(params);
      setFeedbacks(data);
    } catch (error) {
      toast.error('Error fetching feedbacks:');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredFeedbacks.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = ['Reference ID', 'Type', 'Subject', 'Message', 'Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredFeedbacks.map(feedback => [
        `"${feedback.reference_number || ''}"`,
        `"${getGrievanceTypeDisplay(feedback.type)}"`,
        `"${feedback.subject || ''}"`,
        `"${feedback.message || ''}"`,
        `"${feedback.status || ''}"`,
        `"${new Date(feedback.created_at).toLocaleDateString()}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedbacks-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (id: string, newStatus: 'new' | 'reviewing' | 'resolved' | 'closed') => {
    try {
      await updateFeedbackStatus(id, newStatus);
      fetchFeedbacks();
    } catch (error) {
      toast.error('Error updating status:');
    }
  };

  return (
    <div className="min-h-screen bg-white lg:p-2 p-0">
      <div className="container  mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Feedback Center</h1>
              <p className="text-gray-700">Manage and review all user feedback submissions</p>
            </div>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-5 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#27aae1' }}
            >
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Submit Feedback
              </div>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', count: feedbacks.length, icon: <MessageSquare size={20} /> },
              { label: 'New', count: feedbacks.filter(f => f.status === 'new').length, icon: <MessageCircleMore size={20} /> },
              { label: 'Reviewing', count: feedbacks.filter(f => f.status === 'reviewing').length, icon: <Clock size={20} /> },
              { label: 'Resolved', count: feedbacks.filter(f => f.status === 'resolved').length, icon: <CheckCheck size={20} /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#27aae1' }}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <p className="text-gray-700 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
              <input
                type="text"
                placeholder="Search by reference ID, subject, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={loading}
            >
              <Download size={18} />
              Export CSV
            </button>
            <div className="flex gap-2 flex-wrap">
              {['all', 'new', 'reviewing', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all capitalize ${
                    statusFilter === status
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  style={statusFilter === status ? { backgroundColor: '#27aae1' } : {}}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin" size={40} style={{ color: '#27aae1' }} />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-700 text-lg">No feedback found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Reference ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium" style={{ color: '#27aae1' }}>
                          {feedback.reference_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" 
                          style={{ backgroundColor: getGrievanceTypeColor(feedback.type).bg, color: getGrievanceTypeColor(feedback.type).text }}>
                          {getGrievanceTypeDisplay(feedback.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {feedback.subject || 'No subject'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-md truncate">
                          {feedback.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={feedback.status}
                          onChange={(e) => handleStatusChange(feedback.id, e.target.value as any)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-gray-900"
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSubmitForm && (
        <FeedbackSubmitModal
          onClose={() => setShowSubmitForm(false)}
          onSuccess={() => {
            setShowSubmitForm(false);
            fetchFeedbacks();
          }}
        />
      )}

      {selectedFeedback && (
        <FeedbackDetailsModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
};

// Helper functions
const getGrievanceTypeDisplay = (type: string) => {
  const types: { [key: string]: string } = {
    'appraisal_complaints': 'Appraisal',
    'claims_benefits': 'Claims & Benefits',
    'healthcare_disputes': 'Healthcare',
    'data_membership': 'Data & Membership',
    'service_quality': 'Service Quality',
    'general': 'General'
  };
  return types[type] || 'General';
};

const getGrievanceTypeColor = (type: string) => {
  const colors: { [key: string]: { bg: string; text: string } } = {
    'appraisal_complaints': { bg: '#f3e8ff', text: '#6b21a8' },
    'claims_benefits': { bg: '#fed7aa', text: '#92400e' },
    'healthcare_disputes': { bg: '#fee2e2', text: '#991b1b' },
    'data_membership': { bg: '#cffafe', text: '#164e63' },
    'service_quality': { bg: '#e0e7ff', text: '#3730a3' },
    'general': { bg: '#f3f4f6', text: '#374151' }
  };
  return colors[type] || colors['general'];
};

// Feedback Submit Modal
interface FeedbackSubmitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FeedbackSubmitModal = ({ onClose, onSuccess }: FeedbackSubmitModalProps) => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ message?: string; submit?: string }>({});
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
  });

  const handleSubmit = async () => {
    setErrors({});

    if (!formData.message.trim()) {
      setErrors({ message: 'Feedback message is required' });
      return;
    }

    try {
      setLoading(true);
      await submitFeedback(formData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setFormData({ type: 'general', subject: '', message: '' });
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to submit feedback' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#27aae1' }}>
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-700">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#27aae1' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Submit Feedback</h3>
                    <p className="text-sm text-white/90">We'd love to hear from you</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  💡 Your feedback is anonymous and helps us improve our platform
                </p>
              </div>

              {/* Grievance Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Feedback Type <span style={{ color: '#27aae1' }}>*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="general">General Feedback</option>
                  <option value="appraisal_complaints">Appraisal Process Complaints</option>
                  <option value="claims_benefits">Claims and Benefits Complaints</option>
                  <option value="healthcare_disputes">Disputes with Healthcare Providers</option>
                  <option value="data_membership">Data and Membership Issues</option>
                  <option value="service_quality">Service Quality and Access Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject <span className="text-gray-700 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Feedback <span style={{ color: '#27aae1' }}>*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  rows={6}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-none ${
                    errors.message ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
                  }`}
                />
                {errors.message && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.message}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errors.submit}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#27aae1' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={20} />
                    Submit Feedback
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Feedback Details Modal
const FeedbackDetailsModal = ({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#27aae1' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Feedback Details</h3>
              <p className="text-sm text-white/90 font-mono mt-1">{feedback.reference_number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Grievance Type */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Feedback Type</label>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium" 
                  style={{ backgroundColor: getGrievanceTypeColor(feedback.type).bg, color: getGrievanceTypeColor(feedback.type).text }}>
                  {getGrievanceTypeDisplay(feedback.type)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{feedback.subject || 'No subject provided'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Message</label>
              <p className="text-gray-900 mt-1 leading-relaxed">{feedback.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</label>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 border border-gray-200 mt-1">
                  <span className="capitalize text-gray-900">{feedback.status}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Submitted</label>
                <p className="text-gray-900 mt-1">{new Date(feedback.created_at).toLocaleString()}</p>
              </div>
            </div>

            {feedback.admin_response && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Admin Response</label>
                <p className="text-gray-900 mt-2">{feedback.admin_response}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;