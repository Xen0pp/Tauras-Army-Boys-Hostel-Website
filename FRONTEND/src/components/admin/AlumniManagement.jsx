"use client";
import React, { useState } from 'react';
import { useGetUsers } from '@/hooks/tanstack/useUsers';
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/tanstack/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';

const AlumniManagement = () => {
    const { data, isLoading } = useGetUsers('15'); // Role 15 for Alumni
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this alumni?')) {
            try {
                await deleteUser.mutateAsync(id);
                enqueueSnackbar('Alumni deleted successfully', { variant: 'success' });
            } catch (error) {
                enqueueSnackbar('Failed to delete alumni', { variant: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateUser.mutateAsync({ id: editingId, data: formData });
                enqueueSnackbar('Alumni updated successfully', { variant: 'success' });
            } else {
                const defaultImage = '/assets/pfp.png';
                const dataToSubmit = {
                    ...formData,
                    role: { id: '15', name: 'Alumni' },
                    avatar: formData.avatar || defaultImage,
                    profileImage: formData.profileImage || defaultImage,
                };
                await createUser.mutateAsync(dataToSubmit);
                enqueueSnackbar('Alumni created successfully', { variant: 'success' });
            }
            setEditingId(null);
            setFormData({});
            setShowForm(false);
        } catch (error) {
            enqueueSnackbar('Operation failed', { variant: 'error' });
        }
    };

    const alumni = data?.results || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Alumni Management</h2>
                <Button onClick={() => { setEditingId(null); setFormData({}); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Alumni
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="First Name *"
                            required
                            value={formData.firstName || ''}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name *"
                            required
                            value={formData.lastName || ''}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            required
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Current Company"
                            value={formData.currentCompany || ''}
                            onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="url"
                            placeholder="LinkedIn URL"
                            value={formData.linkedin || ''}
                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="url"
                            placeholder="Profile Image URL"
                            value={formData.avatar || formData.profileImage || ''}
                            onChange={(e) => setFormData({ ...formData, avatar: e.target.value, profileImage: e.target.value })}
                            className="px-4 py-2 border rounded col-span-2"
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border rounded"
                        rows="3"
                    />
                    <div className="flex gap-2">
                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                        <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({}); setShowForm(false); }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">LinkedIn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Company</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : alumni.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">No alumni found</td></tr>
                        ) : (
                            alumni.map((person) => (
                                <tr key={person.id}>
                                    <td className="px-6 py-4">
                                        {person.avatar || person.profileImage ? (
                                            <img src={person.avatar || person.profileImage} alt={person.firstName} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                                {(person.firstName || person.first_name || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{person.firstName || person.first_name} {person.lastName || person.last_name}</td>
                                    <td className="px-6 py-4">{person.email}</td>
                                    <td className="px-6 py-4">
                                        {person.linkedin ? (
                                            <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">{person.currentCompany || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => { setEditingId(person.id); setFormData(person); setShowForm(true); }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(person.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlumniManagement;
