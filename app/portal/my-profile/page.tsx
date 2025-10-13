'use client'
import React, { useState, useEffect } from 'react';
import { Camera, User, Building2, Phone, Mail, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getUserProfile, updateUserProfile, uploadProfileImage, deleteProfileImage } from '@/app/api/dashboard/settings';
import { UserProfile, UpdateProfileData } from '@/types/dashboard/settings';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'member' | 'account'>('personal');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    country: '',
    position: '',
    organization: '',
    phone_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.profile);
      setFormData({
        first_name: response.profile.user.first_name || '',
        last_name: response.profile.user.last_name || '',
        username: response.profile.user.username,
        country: response.profile.user.country || '',
        position: response.profile.member.position || '',
        organization: response.profile.member.organization || '',
        phone_number: response.profile.member.phone_number || '',
        notes: response.profile.member.notes || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      await uploadProfileImage(file);
      await fetchProfile();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Delete profile image?')) return;
    try {
      setImageUploading(true);
      await deleteProfileImage();
      await fetchProfile();
    } catch (error) {
      console.error('Image deletion failed:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(formData);
      await fetchProfile();
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#27aae1' }} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen  py-8">
      <div className="container mx-auto px-0 md:px-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Sticky */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {profile.user.profile_image ? (
                      <img src={profile.user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <User size={48} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white" style={{ backgroundColor: '#27aae1' }}>
                    {imageUploading ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Camera size={18} className="text-white" />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
                  </label>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {profile.user.first_name || profile.user.last_name 
                    ? `${profile.user.first_name} ${profile.user.last_name}`.trim()
                    : profile.user.username}
                </h2>
                <p className="text-sm text-gray-600 mb-1">{profile.member.position || 'No position set'}</p>
                <p className="text-sm text-gray-500 mb-4">{profile.member.organization || 'No organization'}</p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  {profile.user.is_email_verified ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                      <XCircle size={12} />
                      Not Verified
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {profile.roles[0] || 'User'}
                  </span>
                </div>

                {profile.user.profile_image && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={imageUploading}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span className="truncate">{profile.user.email}</span>
                </div>
                {profile.member.phone_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{profile.member.phone_number}</span>
                  </div>
                )}
                {profile.user.country && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{profile.user.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Section Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'personal', label: 'Personal Info' },
                  { id: 'member', label: 'Professional' },
                  { id: 'account', label: 'Account' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeSection === tab.id
                        ? 'text-white border-b-2'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={activeSection === tab.id ? { backgroundColor: '#27aae1', borderColor: '#27aae1' } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                       
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'member' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'account' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Account Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{profile.user.email}</p>
                      </div>
                      {profile.user.is_email_verified ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <button type="button" className="text-sm font-medium" style={{ color: '#27aae1' }}>Verify</button>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Status</p>
                        <p className="text-sm text-gray-600 capitalize">{profile.user.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {profile.user.date_joined ? new Date(profile.user.date_joined).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: '#27aae1' }}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    first_name: profile.user.first_name || '',
                    last_name: profile.user.last_name || '',
                    username: profile.user.username,
                    country: profile.user.country || '',
                    position: profile.member.position || '',
                    organization: profile.member.organization || '',
                    phone_number: profile.member.phone_number || '',
                    notes: profile.member.notes || '',
                  })}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;