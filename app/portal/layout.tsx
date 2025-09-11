

'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AuthGuard from "../context/guard";
import { ToastContainer } from "react-toastify";


export default function CoordinatorsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };


    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Initializing Ndovu...</p>
      </div>
    );
  }

  return (
    <AuthGuard publicRoutes={['/auth/login']}>
      <div className="flex flex-col min-h-screen bg-white">
        {/* <Navbar />
        <div className="flex flex-1 pt-16">
          <Aside 
            isOpen={isSidebarOpen} 
            onToggle={handleSidebarToggle} 
            user={globalUserStore.userData}
          /> */}
          <main 
            className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden p-6 ${
              isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
            }`}
          >
            <div className="container mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
        {/* <Footer isSidebarOpen={isSidebarOpen} /> */}
        
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

    </AuthGuard>
  );
}