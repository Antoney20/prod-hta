"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ThematicArea } from "@/types/interventions";

interface InterventionsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  countyFilter: string;
  setCountyFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  thematicAreaFilter: string;
  setThematicAreaFilter: (value: string) => void;
  workflowStageFilter: string;
  setWorkflowStageFilter: (value: string) => void;
  uniqueCounties: string[];
  thematicAreas: ThematicArea[];
  pageSize: number;
  setPageSize: (value: number) => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function InterventionsFilters({
  searchTerm,
  setSearchTerm,
  countyFilter,
  setCountyFilter,
  statusFilter,
  setStatusFilter,
  thematicAreaFilter,
  setThematicAreaFilter,
  workflowStageFilter,
  setWorkflowStageFilter,
  uniqueCounties,
  thematicAreas,
  pageSize,
  setPageSize,
  totalItems,
  currentPage,
  totalPages,
  setCurrentPage,
}: InterventionsFiltersProps) {
  
  const clearAllFilters = () => {
    setSearchTerm("");
    setCountyFilter("");
    setStatusFilter("");
    setThematicAreaFilter("");
  };

  const hasActiveFilters = searchTerm || countyFilter || statusFilter || thematicAreaFilter;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search proposals, submitters, organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={workflowStageFilter || undefined} onValueChange={(value) => setWorkflowStageFilter(value || "")}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by workflow stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="unassigned">Step 1: Unassigned</SelectItem>
              <SelectItem value="needs_categorization">Step 2: Needs Category</SelectItem>
              <SelectItem value="needs_assignment">Step 3: Needs Assignment</SelectItem>
              <SelectItem value="in_progress">Step 4: In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Select value={countyFilter || undefined} onValueChange={(value) => setCountyFilter(value || "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by county" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {uniqueCounties.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value || "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by review status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Review Statuses</SelectItem>
              <SelectItem value="initial">Initial</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={thematicAreaFilter || undefined} onValueChange={(value) => setThematicAreaFilter(value || "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by thematic area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Thematic Areas</SelectItem>
              {thematicAreas
                .filter(area => area.is_active)
                .map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: area.color_code }}
                      />
                      {area.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Pagination and Page Size Row */}
        <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="text-sm text-gray-600">
              Showing {totalItems === 0 ? 0 : startItem}-{endItem} of {totalItems} results
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}