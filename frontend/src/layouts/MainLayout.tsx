import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Skiper39 } from '@/components/CrowdCanvas';

export function MainLayout() {
  return (
    <div className="relative flex min-h-screen flex-col" style={{ zIndex: 10, position: "relative" }}>
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>

      {/* Footer and Crowd Animation Merged Section */}
      <div className="mx-4 sm:mx-6 mb-2 pb-12">
        <div className="bg-black rounded-2xl border-4 border-black overflow-hidden">
          {/* Footer Content */}
          <Footer />

          {/* Crowd Animation - Merged Below Footer */}
          <div className="relative w-full h-80 overflow-hidden">
            <Skiper39 />
          </div>
        </div>
      </div>
    </div>
  );
}
