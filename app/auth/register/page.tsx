'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { User, Mail, Lock, Building2, Phone, MapPin, Briefcase, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { registerUser, RegisterUserData, RegisterMemberData } from '@/app/api/auth';

const ASSESSMENT_GROUPS = [
  'Artemis Health Networks',
  'Fountain Projects and Research Office',
  'Health Economics Research Unit',
  'KEMRI-Wellcome Trust Research Programme',
  'KAVI-Institute of Clinical Research, University of Nairobi',
  'Kenyatta University',
  'Kenya Medical Training College',
  'Strathmore University',
  'The University of Nairobi - CEMA'
];

const RegisterForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [userData, setUserData] = useState<RegisterUserData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    country: '',
    assessment_group: false,
    assessment_group_name: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [memberData, setMemberData] = useState<RegisterMemberData>({
    position: '',
    organization: '',
    phone_number: '',
    notes: '',
  });

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!userData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Email is invalid';

    if (!userData.username) newErrors.username = 'Username is required';
    else if (userData.username.length < 5) newErrors.username = 'Username must be at least 5 characters';

    if (!userData.password) newErrors.password = 'Password is required';
    else if (userData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!userData.password_confirm) newErrors.password_confirm = 'Please confirm your password';
    else if (userData.password !== userData.password_confirm) newErrors.password_confirm = 'Passwords do not match';

    if (!userData.first_name) newErrors.first_name = 'First name is required';
    if (!userData.last_name) newErrors.last_name = 'Last name is required';

    // only required when the user says they're part of the assessment group
    if (userData.assessment_group && !userData.assessment_group_name) {
      newErrors.assessment_group_name = 'Please select your assessment group';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!memberData.organization) newErrors.organization = 'Organization is required';
    if (!memberData.phone_number) newErrors.phone_number = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleAssessmentGroup = () => {
    setUserData((prev) => {
      const next = !prev.assessment_group;
      return {
        ...prev,
        assessment_group: next,
        // clear the selection when turning the group off
        assessment_group_name: next ? prev.assessment_group_name : '',
      };
    });
    // drop any stale error when toggling off
    setErrors((prev) => {
      if (!prev.assessment_group_name) return prev;
      const n = { ...prev };
      delete n.assessment_group_name;
      return n;
    });
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep2()) return;
      setLoading(true);
      setErrors({});

      const response = await registerUser(userData, memberData, profileImage);

      if (response.success) {
        showToast('success', 'Registration successful! Please wait for verification and check your email.');
        setTimeout(() => router.push('/auth/login'), 1500);
      } else {
        if (response.errors) {
          const errorMap: Record<string, string> = {};
          Object.keys(response.errors).forEach(key => {
            const errorValue = response.errors[key];
            errorMap[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
          });
          setErrors(errorMap);

          if (Object.keys(errorMap).some(key => ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name', 'assessment_group', 'assessment_group_name'].includes(key))) {
            setStep(1);
            showToast('error', 'Please check your account information');
          } else {
            showToast('error', response.message || 'Please check your professional details');
          }
        } else {
          showToast('error', response.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      showToast('error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast('error', 'Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`;
    toast.innerHTML = `
      ${type === 'success'
        ? '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"></line><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"></line></svg>'}
      <span class="${type === 'success' ? 'text-green-800' : 'text-red-800'} font-medium">${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      <main className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl border-2 border-gray-200 rounded-xl py-8 px-6">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/moh-log.png"
              alt="Ministry of Health"
              width={200}
              height={50}
              priority
              className="h-12 w-auto"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2].map((num) => (
                <React.Fragment key={num}>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= num ? 'bg-[#1d70b8] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step > num ? <CheckCircle size={20} /> : num}
                    </div>
                    <span className={`text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-500'}`}>
                      {num === 1 ? 'Account Info' : 'Professional Details'}
                    </span>
                  </div>
                  {num === 1 && <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-[#1d70b8]' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            {step === 1 ? (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={userData.first_name}
                        onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.first_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                        }`}
                        placeholder="First name"
                      />
                    </div>
                    {errors.first_name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.first_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={userData.last_name}
                        onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.last_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                        }`}
                        placeholder="Last name"
                      />
                    </div>
                    {errors.last_name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                      }`}
                      placeholder="Your Email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={userData.username}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                      }`}
                      placeholder="Username.."
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Part of HTA Assessment Group
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAssessmentGroup}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        userData.assessment_group ? 'bg-[#1d70b8]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          userData.assessment_group ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    <span className="text-sm text-gray-700">
                      {userData.assessment_group ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* shown only when the assessment-group toggle is on */}
                {userData.assessment_group && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Group *</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={userData.assessment_group_name ?? ''}
                        onChange={(e) => {
                          setUserData({ ...userData, assessment_group_name: e.target.value });
                          setErrors((prev) => {
                            if (!prev.assessment_group_name) return prev;
                            const n = { ...prev };
                            delete n.assessment_group_name;
                            return n;
                          });
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 ${
                          errors.assessment_group_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                        } ${userData.assessment_group_name ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        <option value="" disabled>Select your assessment group</option>
                        {ASSESSMENT_GROUPS.map((group) => (
                          <option key={group} value={group} className="text-gray-900">
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.assessment_group_name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.assessment_group_name}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={userData.country}
                      onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                      placeholder="Kenya"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={userData.password_confirm}
                        onChange={(e) => setUserData({ ...userData, password_confirm: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.password_confirm ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#27aae1]'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password_confirm && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.password_confirm}</p>}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-lg text-white font-semibold bg-[#1d70b8] hover:bg-[#1d8fc3] transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  Continue to Professional Details
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>

                <div className="flex flex-col items-center mb-8">
                  <label htmlFor="profileImage" className="cursor-pointer group">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden group-hover:border-[#27aae1] transition-all">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                            <User size={32} className="text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 p-2 rounded-full shadow-md group-hover:scale-110 transition-transform bg-[#27aae1]">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Click to upload profile photo<br />
                    <span className="text-gray-400">JPG, PNG or GIF (Max 5MB)</span>
                  </p>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove Photo
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={memberData.position}
                      onChange={(e) => setMemberData({ ...memberData, position: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                      placeholder="e.g., Program Manager"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={memberData.organization}
                      onChange={(e) => setMemberData({ ...memberData, organization: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                      placeholder="e.g., Ministry of Health"
                    />
                  </div>
                  {errors.organization && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.organization}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={memberData.phone_number}
                      onChange={(e) => setMemberData({ ...memberData, phone_number: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                      placeholder="+254 700 000 000"
                      required
                    />
                  </div>
                  {errors.phone_number && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.phone_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={memberData.notes}
                    onChange={(e) => setMemberData({ ...memberData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae1] resize-none"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg text-white font-semibold bg-[#1d70b8] hover:bg-[#1d8fc3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/auth/login" className="font-semibold text-[#1d70b8] hover:text-[#27aae1] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterForm;