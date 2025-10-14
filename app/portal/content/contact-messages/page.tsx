'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Download,
  MoreVertical,
  Building2,
  Calendar
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
import type { ContactSubmission } from '@/types/contact';
import { getContactSubmissions } from '@/app/api/dashboard/contact';

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getContactSubmissions();
      setMessages(response.results);
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
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

  const handleReply = (message: ContactSubmission) => {
    const subject = encodeURIComponent(`Re: ${message.subject}`);
    const body = encodeURIComponent(`\n\n---\nOriginal Message:\nFrom: ${message.full_name}\nSubject: ${message.subject}\nMessage: ${message.message}`);
    window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Organization', 'Subject', 'Message', 'IP Address'];
    const rows = messages.map(msg => [
      formatDate(msg.created_at),
      msg.full_name,
      msg.email,
      msg.organization || 'N/A',
      msg.subject,
      msg.message.replace(/"/g, '""'), // Escape quotes
      msg.ip_address || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contact-messages-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading contact messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
        <Button 
          onClick={exportToCSV}
          disabled={messages.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contact messages found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="w-[250px]">Subject</TableHead>
                <TableHead className="w-[300px]">Message</TableHead>
                {/* <TableHead>IP Address</TableHead> */}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(message.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {message.full_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`mailto:${message.email}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {message.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    {message.organization ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {message.organization}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 line-clamp-2">
                      {message.subject}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {message.message}
                    </p>
                  </TableCell>
                  {/* <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {message.ip_address || 'N/A'}
                    </Badge>
                  </TableCell> */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleReply(message)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Reply via Email
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

export default ContactMessagesPage;