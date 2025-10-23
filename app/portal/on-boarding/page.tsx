'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, BookOpen, UserPlus, LogIn, LayoutDashboard, User, Settings, FileText, CheckSquare, MessageSquare, LogOut, Play, ExternalLink, CheckCircle } from 'lucide-react';

const FAQOnboardingPage = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'onboarding'>('onboarding');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string[]>(['faq-1']);

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: UserPlus },
    { id: 'navigation', label: 'Site Navigation', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile & Settings', icon: User },
    { id: 'interventions', label: 'Interventions', icon: FileText },
    { id: 'tasks', label: 'Tasks Management', icon: CheckSquare },
    { id: 'discussions', label: 'Discussion Forums', icon: MessageSquare },
  ];

  const faqs = [
    {
      id: 'faq-1',
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple and takes just 2 minutes!',
      steps: [
        'Click "Sign Up" or "Register" button on the login page',
        'Fill in your basic information (name, email, username, password)',
        'Click "Continue" to move to step 2',
        'Add your professional details (position, organization) - optional but recommended',
        'Click "Complete Registration" and you\'re done!'
      ],
      tips: ['Use a strong password with at least 8 characters', 'Your username must be at least 5 characters long', 'Make sure to verify your email address after registering']
    },
    {
      id: 'faq-2',
      category: 'getting-started',
      question: 'How do I log in to my account?',
      answer: 'Logging in is quick and secure:',
      steps: [
        'Go to the login page',
        'Enter your email or username',
        'Enter your password',
        'Click "Sign In"',
        'You\'ll be redirected to your dashboard'
      ],
      tips: ['You can log in with either your email or username', 'If you forget your password, click "Forgot Password" to reset it', 'Your session stays active for security']
    },
    {
      id: 'faq-3',
      category: 'navigation',
      question: 'How do I navigate around the system?',
      answer: 'The system is organized with a sidebar menu for easy navigation:',
      steps: [
        'Dashboard - Your home page with overview of everything',
        'Records - View and manage all records',
        'Calendar & Events - Check upcoming events and deadlines',
        'Resources & Documents - Access important files and documents',
        'Member Directory - Find other members',
        'Task Management - View and manage your tasks',
        'Interventions Tracker - Track proposal progress'
      ],
      tips: ['Click the menu icon (☰) on mobile to open/close the sidebar', 'Your current page is highlighted in the sidebar', 'Use the search feature to find specific content quickly']
    },
    {
      id: 'faq-4',
      category: 'profile',
      question: 'How do I update my profile information?',
      answer: 'Keep your profile up to date with these simple steps:',
      steps: [
        'Click on your profile picture or name in the top right',
        'Select "Profile" from the dropdown menu',
        'Choose which section to edit (Personal Info, Professional, or Account)',
        'Make your changes in the form',
        'Click "Save Changes" at the bottom',
        'You\'ll see a success message when saved'
      ],
      tips: ['You can upload a profile picture by clicking the camera icon', 'Complete your professional details to help others connect with you', 'Update your contact information to stay reachable']
    },
    {
      id: 'faq-5',
      category: 'profile',
      question: 'How do I change my password?',
      answer: 'Keep your account secure by updating your password:',
      steps: [
        'Go to Settings (click your profile, then "Settings")',
        'Scroll to the "Change Password" section',
        'Enter your current password',
        'Enter your new password',
        'Confirm your new password',
        'Click "Update Password"'
      ],
      tips: ['Use a strong password with letters, numbers, and symbols', 'Don\'t reuse passwords from other sites', 'You\'ll stay logged in after changing your password']
    },
    {
      id: 'faq-6',
      category: 'interventions',
      question: 'What are Interventions and how do they work?',
      answer: 'Interventions are proposals for projects or programs. Here\'s how the process works:',
      steps: [
        'Proposals are submitted by members',
        'They go through review stages: Initial → Under Review → Needs Revision or Approved/Rejected',
        'Reviewers can add comments and feedback',
        'You can track the status of proposals in real-time',
        'Once approved, proposals move to implementation tracking'
      ],
      tips: ['Check "My Interventions" to see proposals assigned to you', 'Use filters to find specific proposals quickly', 'Set up notifications to stay updated on changes']
    },
    {
      id: 'faq-7',
      category: 'interventions',
      question: 'How do I view interventions assigned to me?',
      answer: 'Find your assigned interventions easily:',
      steps: [
        'Click "Interventions Tracker" in the sidebar',
        'Select "My Interventions" from the submenu',
        'You\'ll see all proposals assigned to you',
        'Click on any proposal to view full details',
        'Use the status filter to focus on specific stages'
      ],
      tips: ['Assigned interventions show your review progress', 'You can add comments directly on proposals', 'Mark tasks as complete when you finish reviewing']
    },
    {
      id: 'faq-8',
      category: 'tasks',
      question: 'How do I manage my tasks?',
      answer: 'Stay organized with the task management system:',
      steps: [
        'Go to "Task Management" in the sidebar',
        'Click "Task Tracker" to see all your tasks',
        'Tasks are organized by status (New, In Progress, Completed)',
        'Click on a task to view details or update status',
        'You can add notes and track progress percentage'
      ],
      tips: ['Set due dates to prioritize your work', 'Use the priority levels (Low, Medium, High, Urgent)', 'Update progress regularly to keep everyone informed']
    },
    {
      id: 'faq-9',
      category: 'discussions',
      question: 'How do I participate in discussion forums?',
      answer: 'Join conversations and collaborate with others:',
      steps: [
        'Click "Discussion Forums" in the top navigation',
        'Browse available channels or create a new one',
        'Click on a channel to see messages',
        'Type your message in the box at the bottom',
        'Press Enter or click Send to post'
      ],
      tips: ['You can reply to specific messages to start threads', 'Use @mentions to notify specific people', 'Keep discussions relevant to the channel topic']
    },
    {
      id: 'faq-10',
      category: 'getting-started',
      question: 'How do I log out of my account?',
      answer: 'Log out securely when you\'re done:',
      steps: [
        'Click on your profile picture or name in the top right',
        'Select "Logout" from the dropdown menu',
        'You\'ll be redirected to the login page',
        'Your session is now ended securely'
      ],
      tips: ['Always log out on shared computers', 'Your work is automatically saved', 'You can log in again anytime']
    },
  ];

  const onboardingSteps = [
    {
      id: 'step-1',
      title: 'Create Your Account',
      description: 'Get started by creating your free account in just 2 minutes',
      icon: UserPlus,
      steps: [
        'Visit the registration page',
        'Fill in your name, email, and choose a username',
        'Create a strong password',
        'Add your professional information (position, organization)',
        'Click "Complete Registration"'
      ],
      tips: [
        'Use your work email for better collaboration',
        'Choose a username you\'ll remember',
        'Verify your email to unlock all features'
      ]
    },
    {
      id: 'step-2',
      title: 'Complete Your Profile',
      description: 'Help others know who you are and what you do',
      icon: User,
      steps: [
        'Go to Profile from the top menu',
        'Upload a profile picture (click the camera icon)',
        'Fill in your professional details',
        'Add your phone number for better communication',
        'Save your changes'
      ],
      tips: [
        'A complete profile builds trust with team members',
        'Add notes about your areas of expertise',
        'Update your profile regularly'
      ]
    },
    {
      id: 'step-3',
      title: 'Explore the Dashboard',
      description: 'Your dashboard is your command center - learn what\'s available',
      icon: LayoutDashboard,
      steps: [
        'After login, you\'ll see your dashboard',
        'Check the overview cards for quick stats',
        'Review recent activities to stay updated',
        'See your assigned proposals and tasks',
        'Use the sidebar menu to navigate to different sections'
      ],
      tips: [
        'The dashboard shows real-time information',
        'Customize your view by choosing what matters to you',
        'Check your dashboard daily to stay on top of work'
      ]
    },
    {
      id: 'step-4',
      title: 'Manage Your Tasks',
      description: 'Stay organized with the task management system',
      icon: CheckSquare,
      steps: [
        'Go to Task Management in the sidebar',
        'View all tasks assigned to you',
        'Click on a task to see details',
        'Update the status as you progress',
        'Mark tasks complete when done'
      ],
      tips: [
        'Set due dates to prioritize effectively',
        'Add notes to track your progress',
        'Use priority levels to focus on what\'s urgent'
      ]
    },
    {
      id: 'step-5',
      title: 'Track Interventions',
      description: 'Monitor and review intervention proposals',
      icon: FileText,
      steps: [
        'Access Interventions Tracker from the sidebar',
        'View "My Interventions" to see assigned proposals',
        'Click on a proposal to review details',
        'Add comments and feedback',
        'Track the review progress and status'
      ],
      tips: [
        'Check your assigned interventions regularly',
        'Provide constructive feedback to proposers',
        'Use filters to focus on specific status'
      ]
    },
    {
      id: 'step-6',
      title: 'Join Discussions',
      description: 'Collaborate with team members in discussion forums',
      icon: MessageSquare,
      steps: [
        'Click Discussion Forums in the navigation',
        'Browse or join relevant channels',
        'Read ongoing conversations',
        'Post messages to contribute',
        'Reply to others to build discussions'
      ],
      tips: [
        'Use @mentions to notify specific people',
        'Stay on topic within each channel',
        'Be respectful and professional'
      ]
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(prev => 
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-0 xl:px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Help Center</h1>
            <p className="text-gray-600 text-lg">Everything you need to know about using BPTAP Communications Hub</p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'onboarding' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeTab === 'onboarding' ? { backgroundColor: '#fe7105' } : {}}
            >
              <BookOpen size={20} />
              Getting Started Guide
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'faq' ? 'text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeTab === 'faq' ? { backgroundColor: '#27aae1' } : {}}
            >
              <MessageSquare size={20} />
              FAQs
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {activeTab === 'onboarding' ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-2">Welcome to BPTAP!</h2>
              <p className="text-blue-800">Follow these 6 simple steps to get started and make the most of the platform. Each step takes just a few minutes!</p>
            </div>

            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="bg-white rounded-xl border border-gray-200 lg:p-4 p-2 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <div className="hidden  w-12 h-12 rounded-full lg:flex items-center justify-center text-white font-bold text-lg" 
                        style={{ backgroundColor: index % 2 === 0 ? '#fe7105' : '#27aae1' }}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon size={24} className="text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckSquare size={18} style={{ color: '#27aae1' }} />
                          Steps to Follow:
                        </h4>
                        <ol className="space-y-2">
                          {step.steps.map((stepItem, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" 
                                style={{ backgroundColor: '#27aae1' }}>
                                {idx + 1}
                              </span>
                              <span className="mt-0.5">{stepItem}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {step.tips.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-2 text-sm">💡 Pro Tips:</h4>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                                <span className="text-orange-600">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold text-green-900 mb-2">You're All Set!</h3>
              <p className="text-green-800 mb-4">Complete these steps and you'll be a pro at using the system. Need more help? Check out the FAQs below.</p>
              <button
                onClick={() => setActiveTab('faq')}
                className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#27aae1' }}
              >
                Browse FAQs
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategory === 'all' ? { backgroundColor: '#fe7105' } : {}}
              >
                All Topics
              </button>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === cat.id ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: '#27aae1' } : {}}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {filteredFAQs.map(faq => {
                const isExpanded = expandedFAQ.includes(faq.id);
                return (
                  <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                      {isExpanded ? (
                        <ChevronDown size={20} className="flex-shrink-0 text-gray-600" />
                      ) : (
                        <ChevronRight size={20} className="flex-shrink-0 text-gray-600" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5">
                        <p className="text-gray-700 mb-4">{faq.answer}</p>

                        {faq.steps && faq.steps.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Step-by-Step:</h4>
                            <ol className="space-y-2">
                              {faq.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: '#27aae1' }}>
                                    {idx + 1}
                                  </span>
                                  <span className="mt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {faq.tips && faq.tips.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Helpful Tips:</h4>
                            <ul className="space-y-1">
                              {faq.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try different keywords or browse all topics</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQOnboardingPage;