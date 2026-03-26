"use client";
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlumniManagement from './AlumniManagement';
import EventManagement from './EventManagement';
import MentorApplicationsManagement from './MentorApplicationsManagement';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('alumni');

    return (
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="alumni">Alumni</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="mentor-applications">Mentor Apps</TabsTrigger>
                </TabsList>

                <TabsContent value="alumni">
                    <AlumniManagement />
                </TabsContent>


                <TabsContent value="events">
                    <EventManagement />
                </TabsContent>


                <TabsContent value="mentor-applications">
                    <MentorApplicationsManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPanel;
