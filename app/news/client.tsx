'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { slugify } from '@/lib/utils'

import newsData from '../data/news.json'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'



const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    'Research': 'bg-blue-100 text-blue-800',
    'Events': 'bg-green-100 text-green-800',
    'Announcements': 'bg-purple-100 text-purple-800',
    'Publications': 'bg-amber-100 text-amber-800',
  }

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
        colors[category] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {category}
    </span>
  )
}

export default function NewsClient() {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const sortedNews = useMemo(() => {
    return [...newsData.newsItems].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [])

  const featuredNews = useMemo(() => {
    return sortedNews.find((item) => item.featured)
  }, [sortedNews])
  
  const regularNews = useMemo(() => {
    return featuredNews 
      ? sortedNews.filter(item => item.id !== featuredNews.id)
      : sortedNews
  }, [sortedNews, featuredNews])
  
  const filteredNews = useMemo(() => {
    if (activeCategory === 'All') {
      return regularNews
    }
    return regularNews.filter(news => news.category === activeCategory)
  }, [regularNews, activeCategory])

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set(sortedNews.map(item => item.category))
    return Array.from(categoriesSet)
  }, [sortedNews])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    sortedNews.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [sortedNews])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-12 bg-gray-50 text-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-4">News, Updates and Stories</h1>
            <p className="text-xl text-gray-900 max-w-3xl">
              Stay updated with the latest developments in healthcare assessment, policy updates, and our ongoing initiatives.
            </p>
          </motion.div>
        </div>
      </section>

      {featuredNews && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="bg-gray-50 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-full">
                  <Image
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#27aae1] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <CategoryBadge category={featuredNews.category} />
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="text-sm text-gray-500 mb-2">{featuredNews.date}</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{featuredNews.title}</h2>
                  <p className="text-gray-600 mb-6">{featuredNews.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      By <span className="font-medium">{featuredNews.author}</span>
                      {featuredNews.authorRole && (
                        <span className="text-gray-500">, {featuredNews.authorRole}</span>
                      )}
                    </div>
                    <Link
                      href={`/news/${slugify(featuredNews.title)}`}
                      className="inline-flex items-center px-5 py-2.5 bg-[#27aae1] text-white rounded-lg hover:bg-[#63C5DA] transition-colors"
                    >
                      Read full story <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-8 flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'All'
                  ? 'bg-[#27aae1] text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              All ({regularNews.length})
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category
                    ? 'bg-[#27aae1] text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {category} ({categoryCounts[category] || 0})
              </button>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredNews.map((news) => {
              const slug = slugify(news.title)

              return (
                <motion.div
                  key={news.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group"
                  variants={itemVariants}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#27aae1] transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{news.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        By <span className="font-medium">{news.author}</span>
                      </div>
                      <Link
                        href={`/news/${slug}`}
                        className="text-[#27aae1] font-medium flex items-center hover:text-[#63C5DA] transition-colors"
                      >
                        Read more <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No news articles found</h3>
              <p className="text-gray-500">
                There are currently no articles in the {activeCategory} category.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer/>
    </main>
  )
}