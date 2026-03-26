'use client';

import { DemoSidebar } from "../../components/portal/layout/demoSidebar";
import { ThemeProvider } from "next-themes";
export default function StartDemo() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex min-h-screen bg-background">
                <DemoSidebar />
                    
            </div>
        </ThemeProvider>
    );
}
