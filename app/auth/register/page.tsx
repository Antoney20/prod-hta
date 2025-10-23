'use client'
import React, { useState } from 'react';
import { User, Mail, Lock, Building2, Phone, MapPin, Briefcase, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { registerUser, RegisterUserData, RegisterMemberData } from '@/app/api/auth';

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    try {
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
          
          if (Object.keys(errorMap).some(key => ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name'].includes(key))) {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>

        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((num) => (
              <React.Fragment key={num}>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= num ? 'text-white' : 'bg-gray-200 text-gray-600'
                  }`} style={step >= num ? { backgroundColor: '#fe7105' } : {}}>
                    {step > num ? <CheckCircle size={20} /> : num}
                  </div>
                  <span className={`text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-500'}`}>
                    {num === 1 ? 'Account Info' : 'Professional Details'}
                  </span>
                </div>
                {num === 1 && <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-orange-500' : 'bg-gray-200'}`} style={step > 1 ? { backgroundColor: '#fe7105' } : {}} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
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
                        errors.first_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="John"
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
                        errors.last_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Doe"
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
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
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
                      errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="Username.."
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userData.country}
                    onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                        errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
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
                        errors.password_confirm ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password_confirm && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.password_confirm}</p>}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
                style={{ backgroundColor: '#fe7105' }}
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
                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden group-hover:border-blue-400 transition-all">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                          <User size={32} className="text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 p-2 rounded-full shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: '#27aae1' }}>
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Ministry of Health"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={memberData.phone_number}
                    onChange={(e) => setMemberData({ ...memberData, phone_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={memberData.notes}
                  onChange={(e) => setMemberData({ ...memberData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="flex-1 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#27aae1' }}
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
          <a href="/auth/login" className="font-semibold hover:underline" style={{ color: '#27aae1' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;