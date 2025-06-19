'use client';

import Footer from '@/app/components/layouts/footer';
import Navbar from '@/app/components/layouts/navbar';
import React, { useState } from 'react';
import {
  FaFileAlt,
  FaHospital,
  FaShieldAlt,
  FaGavel,
  FaUserShield,
  FaExternalLinkAlt,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaEye,
  FaStar,
  FaPlay,
  FaNewspaper,
  FaMicrophone,
  FaVideo,
  FaBookOpen,
  FaTimes,
  FaChevronRight,
  FaUsers,
  FaHeartbeat,
  FaGlobe,
  FaFilePdf
} from 'react-icons/fa';

const MediaCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  const mediaResources = [
    {
      id: 1,
      title: "Social Health Insurance (General) Regulations, 2024",
      description: "Comprehensive regulations governing the implementation of Social Health Insurance in Kenya, outlining the framework for universal health coverage.",
      category: "Regulations",
      type: "PDF Document",
      url: "https://health.go.ke/sites/default/files/2024-01/Social%20Health%20Insurance%20%28General%29%20Regulations%2C%202024.pdf",
      icon: FaFilePdf,
      

      featured: true,
      date: "January 2024",
    
    },
    {
      id: 2,
      title: "Tariffs To The Benefit Package",
      description: "Detailed tariff structure and pricing information for the Social Health Authority benefit packages, ensuring transparent healthcare pricing.",
      category: "Tariffs",
      type: "Web Resource",
      url: "https://sha.go.ke/resources/categories/7",
      icon: FaFileAlt,
    
      featured: true,
      date: "Updated Monthly",
    },
    {
      id: 3,
      title: "Healthcare Facilities Directory",
      description: "Comprehensive directory of accredited healthcare facilities under the Social Health Authority network across Kenya.",
      category: "Facilities",
      type: "Database",
      url: "https://sha.go.ke/resources/categories/3",
      icon: FaHospital,
    
      featured: false,
      date: "Real-time Updates",

    },
    {
      id: 4,
      title: "Hospitals Network",
      description: "Detailed information about hospitals in the SHA network, including specialties, services, and contact information.",
      category: "Facilities",
      type: "Web Directory",
      url: "https://sha.go.ke/resources/categories/4",
      icon: FaHeartbeat,

      featured: false,
      date: "Weekly Updates",
  
    },
    {
      id: 5,
      title: "Draft Quality Healthcare and Patient Safety Bill, 2025",
      description: "Proposed legislation to enhance quality healthcare delivery and patient safety standards across all healthcare facilities in Kenya.",
      category: "Legislation",
      type: "Draft Bill",
      url: "https://www.health.go.ke/index.php/node/1891",
      icon: FaShieldAlt,
      featured: true,
      date: "Draft 2025",
 

    },
    {
      id: 6,
      title: "UHC Regulations",
      description: "Universal Health Coverage regulations establishing the legal framework for equitable access to quality healthcare services.",
      category: "Regulations",
      type: "Legal Framework",
      url: "https://www.health.go.ke/-universal-health-coverage-uhc-regulations",
      icon: FaUsers,
 
      featured: false,
      date: "Current",
     
    },
    {
      id: 7,
      title: "SHA Privacy & Policy Guidelines",
      description: "Data protection and privacy policies governing the handling of personal health information within the Social Health Authority system.",
      category: "Privacy",
      type: "Policy Document",
      url: "https://health.go.ke/sites/default/files/2024-01/Social%20Health%20Insurance%20%28General%29%20Regulations%2C%202024.pdf",
      icon: FaUserShield,
      
      featured: false,
      date: "January 2024",
      
      
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: mediaResources.length, icon: FaGlobe },
    { id: 'Regulations', name: 'Regulations', count: mediaResources.filter(r => r.category === 'Regulations').length, icon: FaGavel },
    { id: 'Facilities', name: 'Facilities', count: mediaResources.filter(r => r.category === 'Facilities').length, icon: FaHospital },
    { id: 'Tariffs', name: 'Tariffs', count: mediaResources.filter(r => r.category === 'Tariffs').length, icon: FaFileAlt },
    { id: 'Legislation', name: 'Legislation', count: mediaResources.filter(r => r.category === 'Legislation').length, icon: FaShieldAlt },
    { id: 'Privacy', name: 'Privacy', count: mediaResources.filter(r => r.category === 'Privacy').length, icon: FaUserShield },
  ];

  const filteredResources = mediaResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = mediaResources.filter(resource => resource.featured);

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-6 py-6 bg-white">

          {/* <div className="bg-gradient-to-r from-[#27aae1] via-[#1e8a99] to-[#fe7105] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <FaNewspaper className="text-xl" />
            <span className="font-medium">Media Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ministry of Health
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              SHA Resources Hub
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Access comprehensive resources, regulations, and guidelines for Kenya's Social Health Authority and Universal Health Coverage initiatives.
          </p>
          
        
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources, regulations, guidelines..."
                className="w-full pl-16 pr-6 py-4 text-lg text-gray-800 bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div> */}

          <div className="container mx-auto px-4 py-12">
   
   <p className="text-xl md:text-2xl max-w-5xl mb-8 leading-relaxed">
            Access comprehensive resources, regulations, and guidelines for Kenya's Social Health Authority and Universal Health Coverage initiatives.
          </p>

              <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h3>
                  <div className="flex flex-wrap gap-4">
                      {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                              <button
                                  key={category.id}
                                  onClick={() => setSelectedCategory(category.id)}
                                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${selectedCategory === category.id
                                          ? 'bg-[#27aae1] text-white shadow-lg scale-105'
                                          : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'}`}
                              >
                                  <IconComponent className="text-lg" />
                                  {category.name}
                                  <span className={`px-2 py-1 rounded-full text-xs ${selectedCategory === category.id
                                          ? 'bg-white/10 text-white'
                                          : 'bg-gray-100 text-gray-900'}`}>
                                      {category.count}
                                  </span>
                              </button>
                          );
                      })}
                  </div>
              </div>

              {selectedCategory === 'all' && (
                  <div className="mb-12">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                          <FaStar className="text-yellow-500" />
                          Featured Resources
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {featuredResources.map((resource) => {
                              const IconComponent = resource.icon;
                              return (
                                  <div key={resource.id} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                                      <div className={`absolute top-0 left-0 w-full h-2 bg-[#27aae1]`}></div>
                                      <div className="absolute top-4 right-4">
                                          <FaStar className="text-yellow-400 text-lg" />
                                      </div>

                                      <div className="p-6">
                                          <div className="flex items-start gap-4 mb-4">
                                              <div className={`p-3 rounded-xl`}>
                                                  <IconComponent className={`text-2xl `} />
                                              </div>
                                              <div className="flex-1">
                                                  <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{resource.title}</h4>
                                                  <p className="text-black text-lg line-clamp-4">{resource.description}</p>
                                              </div>
                                          </div>

                                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                              <span className={`px-3 py-1 rounded-full text-black bg-[#27aae1] font-medium`}>
                                                  {resource.category}
                                              </span>
                                              <span>{resource.date}</span>
                                          </div>



                                          <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#27aae1] text-black rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg`}
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

              {/* All Resources */}
              <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FaBookOpen className="text-[#27aae1]" />
                      {selectedCategory === 'all' ? 'All Resources' : `${categories.find(c => c.id === selectedCategory)?.name} Resources`}
                      <span className="text-sm font-normal text-gray-500">({filteredResources.length} items)</span>
                  </h3>

                  <div className="space-y-6">
                      {filteredResources.map((resource) => {
                          const IconComponent = resource.icon;
                          return (
                              <div key={resource.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                                  <div className="p-6">
                                      <div className="flex flex-col lg:flex-row items-start gap-6">
                                          <div className="flex items-start gap-4 flex-1">
                                              <div className={`p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                                  <IconComponent className={`text-3xl `} />
                                              </div>

                                              <div className="flex-1">


                                                  <p className="text-black text-xl mb-4 leading-relaxed">{resource.description}</p>

                                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-900">
                                                      <span className={`px-3 py-1 rounded-full bg-[#27aae1] font-medium`}>
                                                          {resource.category}
                                                      </span>
                                                      <span className="flex items-center gap-1">
                                                          <FaCalendarAlt size={12} />
                                                          {resource.date}
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
                                                  className={`flex items-center gap-2 px-6  mt-8 py-3 bg-[#27aae1] text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap`}
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
                              } }
                              className="inline-flex items-center gap-2 px-6 py-3 bg-[#27aae1] text-white rounded-xl hover:bg-[#1e8a99] transition-colors"
                          >
                              Clear Filters
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>
      <Footer/>
      </>
  );
};

export default MediaCenter;