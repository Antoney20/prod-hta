'use client';

import { getMediaResources } from '@/app/api/dashboard/content';
import Footer from '@/app/components/layouts/footer';
import Navbar from '@/app/components/layouts/navbar';
import { MediaResource } from '@/types/dashboard/content';
import React, { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaHospital,
  FaShieldAlt,
  FaGavel,
  FaUserShield,
  FaExternalLinkAlt,
  FaSearch,
  FaCalendarAlt,
  FaBookOpen,
  FaChevronRight,
  FaUsers,
  FaHeartbeat,
  FaGlobe,
  FaFilePdf,
  FaChevronLeft,
  FaSpinner,
  FaStar
} from 'react-icons/fa';

const MediaCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources, setResources] = useState<MediaResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getMediaResources();
      setResources(response.results || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: Record<string, any> = {
    'PDF Document': FaFilePdf,
    'Web Resource': FaFileAlt,
    'Database': FaHospital,
    'Web Directory': FaHeartbeat,
    'Draft Bill': FaShieldAlt,
    'Legal Framework': FaUsers,
    'Policy Document': FaUserShield,
    'default': FaFileAlt
  };

  const getIcon = (type: string) => iconMap[type] || iconMap.default;

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length, icon: FaGlobe },
    { id: 'Regulations', name: 'Regulations', count: resources.filter(r => r.category === 'Regulations').length, icon: FaGavel },
    { id: 'Facilities', name: 'Facilities', count: resources.filter(r => r.category === 'Facilities').length, icon: FaHospital },
    { id: 'Tariffs', name: 'Tariffs', count: resources.filter(r => r.category === 'Tariffs').length, icon: FaFileAlt },
    { id: 'Legislation', name: 'Legislation', count: resources.filter(r => r.category === 'Legislation').length, icon: FaShieldAlt },
    { id: 'Privacy', name: 'Privacy', count: resources.filter(r => r.category === 'Privacy').length, icon: FaUserShield },
  ];

  const filteredResources = resources.filter(resource => {
    if (resource.hide_resource) return false;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(resource => resource.featured && !resource.hide_resource).slice(0, 4);

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <FaSpinner className="animate-spin text-6xl text-[#27aae1]" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-[#86cefa] text-white overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="text-center max-w-5xl mx-auto mt-20">
              <div className="inline-flex items-center gap-3 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <FaBookOpen className="text-2xl text-black" />
                <span className="font-semibold text-lg text-black">Media Center</span>
              </div>
              
           
              
              <p className="text-xl md:text-2xl  text-black mb-10 leading-relaxed max-w-4xl mx-auto">
                Access comprehensive resources, regulations, and guidelines for Kenya's Social Health Authority and Universal Health Coverage initiatives.
              </p>

              {/* Search Bar */}
              <div className="max-w-3xl mx-auto">
                <div className="relative group">
                  <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl group-hover:text-[#27aae1] transition-colors" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search resources, regulations, guidelines..."
                    className="w-full pl-16 pr-6 py-5 text-lg text-gray-800 bg-white rounded-2xl border-0 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 placeholder-gray-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h3>
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-[#27aae1] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <IconComponent className="text-lg" />
                    {category.name}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Resources */}
          {selectedCategory === 'all' && featuredResources.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
    
                Featured Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredResources.map((resource) => {
                  const IconComponent = getIcon(resource.type);
                  return (
                    <div key={resource.id} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-[#27aae1]"></div>
                      <div className="absolute top-4 right-4">
                        <FaStar className="text-yellow-400 text-lg" />
                      </div>

                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 rounded-xl">
                            <IconComponent className="text-2xl text-[#27aae1]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{resource.title}</h4>
                            <p className="text-gray-600 text-sm line-clamp-3">{resource.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span className="px-3 py-1 rounded-full text-white bg-[#27aae1] font-medium text-xs">
                            {resource.category}
                          </span>
                          <span className="text-xs">{new Date(resource.date).toLocaleDateString()}</span>
                        </div>

                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#27aae1] text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                        >
                          <FaExternalLinkAlt />
                          Access Resource
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              {selectedCategory === 'all' ? 'All Resources' : `${categories.find(c => c.id === selectedCategory)?.name} Resources`}
              <span className="text-sm font-normal text-gray-500">({filteredResources.length} items)</span>
            </h3>

            <div className="space-y-6">
              {paginatedResources.map((resource) => {
        ;
                return (
                  <div key={resource.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row items-start gap-6">
                        <div className="flex items-start gap-4 flex-1">
                         

                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 mb-3">{resource.title}</h4>
                            <p className="text-gray-700 text-base mb-4 leading-relaxed">{resource.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-900">
                              <span className="px-3 py-1 rounded-full bg-[#27aae1] text-white font-medium">
                                {resource.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt size={12} />
                                {new Date(resource.date).toLocaleDateString()}
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{resource.type}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4 lg:w-auto w-full">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-[#27aae1] text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap"
                          >
                            <FaExternalLinkAlt />
                            Access Resource
                            <FaChevronRight size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredResources.length > itemsPerPage && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronLeft />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#27aae1] text-white shadow-lg'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#27aae1] text-white rounded-xl hover:bg-[#1e8a99] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MediaCenter;