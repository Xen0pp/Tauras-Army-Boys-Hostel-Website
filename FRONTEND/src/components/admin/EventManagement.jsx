"use client";
import React, { useState } from 'react';
import { useGetEvent } from '@/hooks/tanstack/useEvents';
import { useUpdateEvent, useDeleteEvent } from '@/hooks/tanstack/useAdminEvents';
import { useCreateEvent } from '@/hooks/tanstack/useEvents';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';

const EventManagement = () => {
    const { data, isLoading } = useGetEvent();
    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();
    const deleteEvent = useDeleteEvent();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent.mutateAsync(id);
                enqueueSnackbar('Event deleted successfully', { variant: 'success' });
            } catch (error) {
                enqueueSnackbar('Failed to delete event', { variant: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateEvent.mutateAsync({ id: editingId, data: formData });
                enqueueSnackbar('Event updated successfully', { variant: 'success' });
            } else {
                const dataToSubmit = {
                    ...formData,
                    imageUrl: formData.imageUrl || '/assets/event.png',
                };
                await createEvent.mutateAsync(dataToSubmit);
                enqueueSnackbar('Event created successfully', { variant: 'success' });
            }
            setEditingId(null);
            setFormData({});
            setShowForm(false);
        } catch (error) {
            enqueueSnackbar('Operation failed', { variant: 'error' });
        }
    };

    const events = data?.results || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Event Management</h2>
                <Button onClick={() => { setEditingId(null); setFormData({}); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Event Name *"
                            required
                            value={formData.eventName || formData.event_name || ''}
                            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="date"
                            placeholder="Date *"
                            required
                            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Location *"
                            required
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Event Type"
                            value={formData.eventType || ''}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="px-4 py-2 border rounded"
                        />
                    </div>
                    <textarea
                        placeholder="Description *"
                        required
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Event Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : events.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center">No events found</td></tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4">{event.eventName || event.event_name}</td>
                                    <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{event.location}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => { setEditingId(event.id); setFormData(event); setShowForm(true); }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(event.id)}
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

export default EventManagement;
