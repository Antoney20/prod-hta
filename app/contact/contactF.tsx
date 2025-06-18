import React, { useState } from 'react';
import { ArrowRight, Mail, User, Building, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
}

interface GoogleAccount {
  email: string;
  name: string;
  picture?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

function ContactFormSection() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    organization: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const initializeGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const handleGoogleSignIn = (response: any) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const account: GoogleAccount = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
      
      setSelectedAccount(account);
      setFormData({
        ...formData,
        email: account.email,
        fullName: formData.fullName || account.name
      });
    } catch (error) {
      console.error('Error parsing Google account data:', error);
    }
  };

  const promptGoogleAccountSelection = () => {
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogleAuth();
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to One Tap or manual sign-in
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              text: 'select_account',
              width: '100%'
            }
          );
        }
      });
    } else {
      // Fallback if Google API not loaded
      alert('Please load Google API first. Add the Google Identity Services script to your page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no email selected, prompt Google account selection
    if (!formData.email) {
      promptGoogleAccountSelection();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Here you would send the email using the selected Google account
      // This could involve sending through your backend with the user's Gmail API access
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted with Google account:', {
        ...formData,
        senderAccount: selectedAccount
      });
      
      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        organization: '',
        subject: '',
        message: ''
      });
      setSelectedAccount(null);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-[#020e3c]">Send Us a Message</h3>
            <p className="text-gray-600 mb-8">
              Fill out the form below and our team will respond as soon as possible.
            </p>

            {submitStatus === 'success' && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-green-800">Message Sent Successfully!</h4>
                  <p className="text-green-700 text-sm">We'll respond to your email within 24 hours.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-800">Something went wrong</h4>
                  <p className="text-red-700 text-sm">Please try again or contact us directly.</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition pr-12"
                      placeholder="Click submit to select Google account"
                      readOnly
                    />
                    {selectedAccount && (
                      <div className="absolute right-2 top-2">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  {selectedAccount && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      {selectedAccount.picture && (
                        <img 
                          src={selectedAccount.picture} 
                          alt="Profile" 
                          className="w-4 h-4 rounded-full mr-2"
                        />
                      )}
                      <span>Using: {selectedAccount.email}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    💡 We'll prompt you to select your Google account when you submit
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                  placeholder="Your organization (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                  placeholder="What can we help you with?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {!formData.email && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Google Account Required</h4>
                      <p className="text-blue-700 text-sm">
                        Click "Send Message" to select your Google account for sending this email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden div for Google Sign-In button fallback */}
              <div id="google-signin-button" className="hidden"></div>
              
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#1d8fc3] text-white py-3 rounded-md hover:bg-[#1577a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    {formData.email ? 'Send Message' : 'Select Google Account & Send'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactFormSection;