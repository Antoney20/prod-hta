'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Calendar, MessageSquare, Eye, CheckSquare } from 'lucide-react';
import { CreatePollData } from '@/types/dashboard/polls';
import { createPoll } from '@/app/api/dashboard/polls';

export default function CreatePollPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePollData>({
    question: '',
    description: '',
    channel: '',
    is_anonymous: false,
    allow_multiple_choices: false,
    allow_comments: true,
    expires_at: '',
    options: [{ text: '' }, { text: '' }]
  });
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '' }]
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { text };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async () => {
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = formData.options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    try {
      setLoading(true);
      const pollData = {
        ...formData,
        options: validOptions,
        expires_at: formData.expires_at || undefined
      };
      const newPoll = await createPoll(pollData);
      router.push(`/portal/polls/${newPoll.id}`);
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/portal/polls')}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to polls
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">Create Poll</h1>
          <p className="text-gray-600">Gather opinions and feedback from your community</p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="What would you like to ask?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#27aae1' } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add context or details..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': '#27aae1' } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Channel *
                </label>
                <input
                  type="text"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  placeholder="Channel ID"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#27aae1' } as any}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Options</h2>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#27aae1' }}
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-black font-medium text-sm">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#27aae1' } as any}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                  <Calendar className="w-4 h-4" style={{ color: '#27aae1' }} />
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#27aae1' } as any}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" style={{ color: '#27aae1' }} />
                    <div>
                      <p className="font-medium text-black">Anonymous Voting</p>
                      <p className="text-xs text-gray-600">Hide voter identities</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                    className="w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: '#27aae1' }}
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5" style={{ color: '#27aae1' }} />
                    <div>
                      <p className="font-medium text-black">Multiple Choice</p>
                      <p className="text-xs text-gray-600">Allow multiple selections</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allow_multiple_choices}
                    onChange={(e) => setFormData({ ...formData, allow_multiple_choices: e.target.checked })}
                    className="w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: '#27aae1' }}
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5" style={{ color: '#27aae1' }} />
                    <div>
                      <p className="font-medium text-black">Enable Comments</p>
                      <p className="text-xs text-gray-600">Allow discussion</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allow_comments}
                    onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                    className="w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: '#27aae1' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/polls')}
              className="flex-1 px-6 py-3 border border-gray-300 text-black rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#27aae1' }}
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}