'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Download,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { NewsletterSubscription } from '@/types/contact';
import { getNewsletterSubscriptions } from '@/app/api/dashboard/contact';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getNewsletterSubscriptions();
      setSubscriptions(response.results);
    } catch (error) {
      console.error('Failed to fetch newsletter subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const exportToCSV = () => {
    const filteredSubs = getFilteredSubscriptions();
    const headers = ['Email', 'Status', 'IP Address', 'Subscribed At', 'Unsubscribed At'];
    const rows = filteredSubs.map(sub => [
      sub.email,
      sub.is_active ? 'Active' : 'Unsubscribed',
      sub.ip_address || 'N/A',
      formatDate(sub.subscribed_at),
      sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredSubscriptions = () => {
    if (filter === 'active') {
      return subscriptions.filter(sub => sub.is_active);
    }
    if (filter === 'unsubscribed') {
      return subscriptions.filter(sub => !sub.is_active);
    }
    return subscriptions;
  };

  const filteredSubscriptions = getFilteredSubscriptions();
  const activeCount = subscriptions.filter(sub => sub.is_active).length;
  const unsubscribedCount = subscriptions.filter(sub => !sub.is_active).length;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading newsletter subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              {subscriptions.length} total ({activeCount} active, {unsubscribedCount} unsubscribed)
            </p>
          </div>
          <Button 
            onClick={exportToCSV}
            disabled={filteredSubscriptions.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'active'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('unsubscribed')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'unsubscribed'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unsubscribed ({unsubscribedCount})
          </button>
        </div>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No subscriptions found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>IP Address</TableHead> */}
                <TableHead>Subscribed At</TableHead>
                <TableHead>Unsubscribed At</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id} className="hover:bg-gray-50">
                  <TableCell>
                    <a 
                      href={`mailto:${subscription.email}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {subscription.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    {subscription.is_active ? (
                      <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-red-700 border-red-300 bg-red-50">
                        <XCircle className="h-3 w-3" />
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  {/* <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {subscription.ip_address || 'N/A'}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(subscription.subscribed_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {subscription.unsubscribed_at ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(subscription.unsubscribed_at)}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEmail(subscription.email)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;