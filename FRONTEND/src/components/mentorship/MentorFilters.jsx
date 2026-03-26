"use client";

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const EXPERTISE_OPTIONS = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing',
    'Business Development',
    'Entrepreneurship',
    'Finance',
    'Consulting'
];

export default function MentorFilters({ filters, onFilterChange, onClearFilters }) {
    const [showFilters, setShowFilters] = useState(false);

    const handleExpertiseToggle = (expertise) => {
        const current = filters.expertise || [];
        const updated = current.includes(expertise)
            ? current.filter(e => e !== expertise)
            : [...current, expertise];
        onFilterChange({ ...filters, expertise: updated });
    };

    const handleExperienceChange = (type, value) => {
        onFilterChange({
            ...filters,
            [type]: parseInt(value) || 0
        });
    };

    const activeFilterCount =
        (filters.expertise?.length || 0) +
        (filters.minExperience ? 1 : 0) +
        (filters.maxExperience ? 1 : 0) +
        (filters.availability && filters.availability !== 'all' ? 1 : 0);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, company, or position..."
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
                    {/* Expertise Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Expertise Areas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EXPERTISE_OPTIONS.map((expertise) => {
                                const isSelected = filters.expertise?.includes(expertise);
                                return (
                                    <button
                                        key={expertise}
                                        onClick={() => handleExpertiseToggle(expertise)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                                                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {expertise}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Experience Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Years of Experience
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Minimum
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={filters.minExperience || ''}
                                    onChange={(e) => handleExperienceChange('minExperience', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Maximum
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={filters.maxExperience || ''}
                                    onChange={(e) => handleExperienceChange('maxExperience', e.target.value)}
                                    placeholder="50"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Availability Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Availability
                        </label>
                        <div className="flex gap-2">
                            {['all', 'available', 'full'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => onFilterChange({ ...filters, availability: option })}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.availability === option || (!filters.availability && option === 'all')
                                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
