"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FileText,
  Newspaper,
  Users,
  Video,
  Mail,
  Bell
} from 'lucide-react';

interface ContentCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  color: string;
}

const ContentPage: React.FC = () => {
  const router = useRouter();

  const contentCards: ContentCard[] = [
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: <FileText className="h-8 w-8" />,
      href: '/portal/content/faqs',
      color: 'text-blue-600'
    },
    {
      title: 'News Articles',
      description: 'Create and manage news content',
      icon: <Newspaper className="h-8 w-8" />,
      href: '/portal/content/news',
      color: 'text-green-600'
    },
    {
      title: 'Governance',
      description: 'Manage governance members and profiles',
      icon: <Users className="h-8 w-8" />,
      href: '/portal/content/team',
      color: 'text-purple-600'
    },
    {
      title: 'Media Resources',
      description: 'Upload and organize media content',
      icon: <Video className="h-8 w-8" />,
      href: '/portal/content/media',
      color: 'text-orange-600'
    },
    {
      title: 'Contact Messages',
      description: 'View and respond to user contact form messages',
      icon: <Mail className="h-8 w-8" />,
      href: '/portal/content/contact-messages',
      color: 'text-red-600'
    },
    {
      title: 'Subscriptions',
      description: 'Manage user email subscriptions and preferences',
      icon: <Bell className="h-8 w-8" />,
      href: '/portal/content/subscriptions',
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="lg:p-6 p-0 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        {/* <p className="text-gray-600 mt-2">Manage all your website content in one place</p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentCards.map((card) => (
          <Card
            key={card.title}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(card.href)}
          >
            <CardHeader>
              <div className={`${card.color} mb-4`}>
                {card.icon}
              </div>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {card.count !== undefined && (
                <div className="text-2xl font-bold text-gray-700">
                  {card.count} items
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentPage;
