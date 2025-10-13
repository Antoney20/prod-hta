
"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Member } from '@/types/dashboard/members';
import { getMembers } from '@/app/api/dashboard/members';
import MembersList from './list';


const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMembers();
      setMembers(response.results || []);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    
    return (
      member.username.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.organization.toLowerCase().includes(query) ||
      (member.first_name && member.first_name.toLowerCase().includes(query)) ||
      (member.last_name && member.last_name.toLowerCase().includes(query)) ||
      (member.phone_number && member.phone_number.includes(query)) ||
      (member.notes && member.notes.toLowerCase().includes(query))
    );
  });

  // Stats
  const activeMembers = members.filter(member => member.is_active).length;
  const totalMembers = members.length;

  return (
    <div className="lg:p-6 p-0 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Members Management</h1>
          <p className="text-gray-600 mt-2">View and manage organization members</p>
        </div>    
      </div>



      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members by name, email, organization..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading members...</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              Showing {filteredMembers.length} of {totalMembers} members
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          </div>

          <MembersList members={filteredMembers} />
        </>
      )}


      {!loading && !error && filteredMembers.length === 0 && searchQuery && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500">
              No members match your search criteria "{searchQuery}". Try adjusting your search terms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembersPage;