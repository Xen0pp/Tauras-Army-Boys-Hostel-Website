import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 px-4 ${className}`}
        >
            {Icon && (
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
            )}

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {action && (
                <div className="flex justify-center">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
