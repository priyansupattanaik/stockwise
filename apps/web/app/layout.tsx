'use client';

import React from 'react';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/use-settings-store';
import { Sidebar } from '../components/layout/sidebar';
import { Header } from '../components/layout/header';
import { ErrorBoundary } from '../components/ui/error-boundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useSettingsStore();

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <title>Stockwise | Stock Market Analysis & AI Workspace</title>
        <meta
          name="description"
          content="Institutional-grade stock market quantitative analytics platform."
        />
      </head>
      <body className="min-h-screen bg-background text-foreground flex antialiased">
        <QueryClientProvider client={queryClient}>
          {/* Main App Layout */}
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <ErrorBoundary fallbackTitle="Page Layout Error">
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
