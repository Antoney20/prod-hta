'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/utils'

import newsData from '../../data/news.json'

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    'General': 'bg-blue-100 text-blue-800',
    'Events': 'bg-green-100 text-green-800',
    'Announcements': 'bg-[#1338BE]/10 text-[#1338BE]',
    'Policy': 'bg-gray-100 text-gray-800',
  }
  
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
      {category}
    </span>
  )
}

const NewsCard = ({ news, index }: { news: typeof newsData.newsItems[0]; index: number }) => {
  const slug = slugify(news.title)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover transition-transform group-hover:scale-105 duration-300"
        />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={news.category} />
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm text-gray-500 mb-2">{news.date}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1338BE] transition-colors line-clamp-2">
          <Link href={`/news/${slug}`}>
            {news.title}
          </Link>
        </h3>
        <p className="text-gray-700 mb-4 line-clamp-3">{news.excerpt}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            By <span className="font-medium">{news.author}</span>
          </div>
          <Link href={`/news/${slug}`} className="text-[#1338BE] font-medium flex items-center hover:text-[#63C5DA] transition-colors">
            Read more <span className='sr-only'> about {news.title} </span> <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function NewsSection() {
  const featuredNews = newsData.newsItems.filter((item: { featured: any }) => item.featured)
  
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">News, Updates & Stories</h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Stay in the updated with the latest developments in healthcare assessment, policy updates, and our ongoing initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {featuredNews.slice(-3).reverse().map((news, index) => (
            <NewsCard key={news.id} news={news} index={index} />
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button asChild className="bg-[#1338BE] hover:bg-[#63C5DA] text-white px-8 py-3 rounded-md">
            <Link href="/news">
              Browse All Updates <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}