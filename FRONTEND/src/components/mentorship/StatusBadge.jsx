import React from 'react';

const STATUS_STYLES = {
    pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        dot: 'bg-yellow-500'
    },
    accepted: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500'
    },
    active: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500'
    },
    declined: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500'
    },
    cancelled: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500'
    },
    completed: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        dot: 'bg-blue-500'
    },
    available: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500'
    },
    full: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500'
    }
};

export default function StatusBadge({ status, showDot = false, className = '' }) {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const styles = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;

    const displayText = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${className}`}>
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            )}
            {displayText}
        </span>
    );
}
