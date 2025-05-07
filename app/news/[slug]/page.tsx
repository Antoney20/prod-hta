import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import NewsDetailClient from './client'
import newsData from "../../data/news.json"
import { slugify } from '@/lib/utils'

type Props = {
    params: Promise<{slug: string}>; 
  };

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
  
      const { slug } = await params;
  
  
  const newsItem = newsData.newsItems.find(
    item => slugify(item.title) === slug
  )
  
  if (!newsItem) {
    return {
      title: 'News - Not Found',
      description: 'The requested news article could not be found.',
    }
  }
  
  return {
    title: newsItem.title,
    description: newsItem.excerpt,
    openGraph: {
      title: newsItem.title,
      description: newsItem.excerpt,
      images: [
        {
          url: newsItem.image,
          width: 1200,
          height: 630,
          alt: newsItem.title,
        },
      ],
      type: 'article',
      publishedTime: newsItem.date,
      authors: [newsItem.author],
      tags: newsItem.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: newsItem.title,
      description: newsItem.excerpt,
      images: [newsItem.image],
    }
  }
}

const  NewsDetailPage  = async ({ params }: Props) => {



    const { slug } = await params;

  
  const newsItem = newsData.newsItems.find(
    item => slugify(item.title) === slug
  )
  
  if (!newsItem) {
    notFound()
  }
  
  return <NewsDetailClient newsItem={newsItem} />
}

export default NewsDetailPage