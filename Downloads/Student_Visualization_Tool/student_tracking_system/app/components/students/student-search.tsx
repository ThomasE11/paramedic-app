
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, UserPlus, Mail } from 'lucide-react';
import { SearchFilters } from '@/lib/types';
import { BulkEmailDialog } from '@/components/email/bulk-email-dialog';

interface StudentSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onAddStudent: () => void;
  onExport: () => void;
  onBulkEmail: () => void;
  modules: Array<{ id: string; code: string; name: string }>;
  students: any[];
}

export function StudentSearch({
  filters,
  onFiltersChange,
  onAddStudent,
  onExport,
  onBulkEmail,
  modules,
  students
}: StudentSearchProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  return (
    <div className="bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Student Management</h2>
        
        {/* Action buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <Button onClick={onExport} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Export</span>
            <span className="xs:hidden">📊</span>
          </Button>
          <Button onClick={onBulkEmail} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Bulk Email</span>
            <span className="xs:hidden">📧</span>
          </Button>
          <Button onClick={onAddStudent} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Add Student</span>
            <span className="xs:hidden">➕</span>
          </Button>
        </div>
      </div>

      {/* Search form - Mobile optimized */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:gap-4">
        {/* Search input - Full width on all screens */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <Input
            placeholder="Search students by name, email, or ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 rounded-2xl"
          />
        </div>

        {/* Filters row - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Select
            value={filters.moduleId}
            onValueChange={(value) => onFiltersChange({ ...filters, moduleId: value })}
          >
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[200px] bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-white/40 rounded-2xl">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 rounded-2xl">
              <SelectItem value="all">All Modules</SelectItem>
              {modules?.map((module) => (
                <SelectItem key={module?.id} value={module?.id || ''}>
                  {module?.code} - {module?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              onFiltersChange({
                ...filters,
                sortBy: sortBy as 'name' | 'module' | 'email' | 'createdAt',
                sortOrder: sortOrder as 'asc' | 'desc'
              });
            }}
          >
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[150px] bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-white/40 rounded-2xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 rounded-2xl">
              <SelectItem value="firstName-asc">Name A-Z</SelectItem>
              <SelectItem value="firstName-desc">Name Z-A</SelectItem>
              <SelectItem value="email-asc">Email A-Z</SelectItem>
              <SelectItem value="email-desc">Email Z-A</SelectItem>
              <SelectItem value="createdAt-desc">Newest first</SelectItem>
              <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" className="flex-1 sm:flex-none sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-2xl h-10">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Search</span>
            <span className="xs:hidden">🔍</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
