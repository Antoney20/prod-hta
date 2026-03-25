"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Member } from '@/types/dashboard/members';
import { getMembers } from '@/app/api/dashboard/members';
import MembersList from './list';
import { useAuth } from '@/app/api/auth';


const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const canEdit = user?.role === 'admin' || user?.role === 'secretariat';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMembers();
      setMembers(response.results || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      member.username.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.organization.toLowerCase().includes(q) ||
      member.first_name?.toLowerCase().includes(q) ||
      member.last_name?.toLowerCase().includes(q) ||
      member.phone_number?.includes(q) ||
      member.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="lg:p-6 p-0 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members Management</h1>
        <p className="text-gray-600 mt-2">View and manage organization members</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members by name, email, organization..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              Showing {filteredMembers.length} of {members.length} members
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          </div>

          <MembersList
            members={filteredMembers}
            onRefresh={fetchMembers}
            canEdit={canEdit}
          />
        </>
      )}

      {!loading && !error && filteredMembers.length === 0 && searchQuery && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No members found</h3>
            <p className="text-gray-500">No members match "{searchQuery}". Try adjusting your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembersPage;