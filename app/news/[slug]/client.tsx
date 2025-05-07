'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { slugify } from '@/lib/utils'
import newsData from "../../data/news.json"
import Navbar from '@/app/components/layouts/navbar'


interface NewsItem {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  authorRole?: string
  featured: boolean
  date: string
  category: string
  image: string
  tags: string[]
}

interface NewsDetailClientProps {
  newsItem: NewsItem
}

const NewsDetailClient = ({ newsItem }: NewsDetailClientProps) => {
  const formattedDate = new Date(newsItem.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient bg-gray-50 text-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href="/news"
              className="inline-flex items-center   border border-black/30 hover:border-black/60 rounded-lg px-4 py-2 transition-colors mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
            
            <div className="flex items-center space-x-3 mb-4">
              <span className=" bg-[#1338BE] text-white px-3 py-1 rounded-full text-sm font-medium">
                {newsItem.category}
              </span>
              {newsItem.featured && (
                <span className="bg-[#1338BE] text-white  px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold  mb-6 max-w-4xl">
              {newsItem.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-white/90 gap-6 mb-8">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>
                  By <span className="font-medium text-white">{newsItem.author}</span>
                  {newsItem.authorRole && (
                    <span className="text-white/90">, {newsItem.authorRole}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Featured Image */}
      {/* <motion.div 
        className="relative h-64 md:h-96 lg:h-[500px] w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Image
          src={newsItem.image}
          alt={newsItem.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
        />
      </motion.div> */}
      
      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <article className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
              </article>
              
              {/* Tags Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-[#1338BE]" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {newsItem.tags.map((tag) => (
                    <Link 
                      key={tag} 
                      href={`/news?tag=${encodeURIComponent(tag)}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Share This Article</h3>
                <div className="flex space-x-4">
                  <button className="bg-[#1da1f2] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="bg-[#0077b5] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                    </svg>
                  </button>
                  <button className="bg-[#3b5998] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Sidebar */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 pb-4 border-b border-gray-200">Recent Articles</h3>
                <div className="space-y-6">
                  {newsData.newsItems
                    .filter(item => item.id !== newsItem.id)
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.id} className="flex items-start">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <span className="text-xs text-gray-500 block mb-1">{item.date}</span>
                          <Link 
                            href={`/news/${slugify(item.title)}`}
                            className="font-medium hover:text-[#1338BE] transition-colors line-clamp-2"
                          >
                            {item.title}
                          </Link>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 pb-4 border-b border-gray-200">Categories</h3>
                <div className="space-y-2">
                  {['Research', 'Events', 'Announcements', 'Publications'].map((category) => (
                    <Link 
                      key={category}
                      href={`/news?category=${category}`}
                      className="flex justify-between items-center py-2 hover:text-[#1338BE] transition-colors"
                    >
                      <span>{category}</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {newsData.newsItems.filter(item => item.category === category).length}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": newsItem.title,
            "datePublished": newsItem.date,
            "dateModified": newsItem.date,
            "author": {
              "@type": "Person",
              "name": newsItem.author,
            },
            "publisher": {
              "@type": "Organization",
              "name": "Health Technology Assessment Kenya",
              "logo": {
                "@type": "ImageObject",
                "url": "https://hta-chi.vercel.app/images/logo.png",
              },
            },
            "description": newsItem.excerpt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://hta-chi.vercel.app/news/${slugify(newsItem.title)}`
            }
          }),
        }}
      />
    </main>
  )
}

export default NewsDetailClient