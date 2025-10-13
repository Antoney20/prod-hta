'use client'
import React, { useState, useEffect } from 'react';
import { Lock, Smartphone, Trash2, Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, LogOut, Mail, User, Calendar } from 'lucide-react';
import { getUserSettings, changePassword, getActiveDevices, logoutDevice, logoutAllDevices, deleteAccount } from '@/app/api/dashboard/settings';
import { UserSettings, DeviceSession, ChangePasswordData } from '@/types/dashboard/settings';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [deleteForm, setDeleteForm] = useState({ password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, devicesRes] = await Promise.all([
        getUserSettings(),
        getActiveDevices(),
      ]);
      setSettings(settingsRes.settings);
      setDevices(devicesRes.devices);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };


const handleChangePassword = async () => {
  try {
    setSubmitting(true);
    
    await changePassword(passwordForm);

    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });

    showMessage('success', 'Password changed successfully');
    toast.success('Password changed successfully');
  } catch (error: any) {
    const errorMessage = error?.message || 'Failed to change password';

    showMessage('error', errorMessage);
    toast.error(errorMessage);
  } finally {
    setSubmitting(false);
  }
};



  const handleLogoutDevice = async (sessionKey: string) => {
    if (!confirm('Logout from this device?')) return;
    try {
      await logoutDevice({ session_key: sessionKey });
      showMessage('success', 'Device logged out successfully');
      await fetchData();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to logout device');
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Logout from all other devices?')) return;
    try {
      await logoutAllDevices();
      showMessage('success', 'Logged out from all devices');
      await fetchData();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to logout all devices');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      setSubmitting(true);
      await deleteAccount(deleteForm);
      window.location.href = '/auth/login';
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete account');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#fe7105' }} />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-0 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your security, devices, and account preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#fe710510' }}>
                <User size={20} style={{ color: '#fe7105' }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base text-gray-900">{settings.account.email}</p>
                  <div className="mt-1">
                    {settings.account.is_email_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    ) : (
                      <button className="text-xs font-medium" style={{ color: '#27aae1' }}>Verify Email</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-base text-gray-900">{settings.account.username}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className="text-base text-gray-900 capitalize">{settings.account.status}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-base text-gray-900">
                    {settings.account.date_joined ? new Date(settings.account.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#27aae110' }}>
                <Lock size={20} style={{ color: '#27aae1' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1"
                
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={submitting || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: '#27aae1' }}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Active Devices */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fe710510' }}>
                  <Smartphone size={20} style={{ color: '#fe7105' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active Devices & Sessions</h2>
                  <p className="text-sm text-gray-600">{devices.length} active session(s)</p>
                </div>
              </div>
              {devices.length > 1 && (
                <button
                  onClick={handleLogoutAll}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <LogOut size={16} />
                  Logout All Others
                </button>
              )}
            </div>

            <div className="space-y-3">
              {devices.map((device, index) => (
                <div key={device.session_key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gray-100">
                      <Smartphone size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {device.is_current ? 'Current Device' : `Device ${index + 1}`}
                        </p>
                        {device.is_current && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires: {new Date(device.expire_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!device.is_current && (
                    <button
                      onClick={() => handleLogoutDevice(device.session_key)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-white rounded-xl border-2 border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-50">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">Warning: This action cannot be undone</p>
                  <p className="text-sm text-red-700">
                    Deleting your account will permanently remove all your data, including profile information, 
                    proposals, and activity history. This action is irreversible.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm your password to delete account
              </label>
              <input
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm({ password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                placeholder="Enter your password"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={submitting || !deleteForm.password}
                className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Deleting Account...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;