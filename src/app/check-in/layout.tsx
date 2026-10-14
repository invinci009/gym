import React from 'react';

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {children}
    </main>
  );
}
