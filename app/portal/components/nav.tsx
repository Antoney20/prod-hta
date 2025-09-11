"use client";

import { logout } from "@/app/api/auth";
import { globalUserStore } from "@/app/context/guard";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Megaphone,
  MessageSquare,
  Home,
  MessageCircle,
  Vote,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface NavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const Navbar = ({ isSidebarOpen, onSidebarToggle }: NavbarProps) => {
  const [user, setUser] = useState(globalUserStore.userData);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [announcementCount, setAnnouncementCount] = useState(5);
  const [forumCount, setForumCount] = useState(12);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(globalUserStore.userData);
  
    const interval = setInterval(() => {
      if (JSON.stringify(user) !== JSON.stringify(globalUserStore.userData)) {
        setUser(globalUserStore.userData);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const forumItems = [
    { 
      title: "General Discussion", 
      href: "/coordinators/forum/general", 
      badge: 8
    },
    { 
      title: "Policy Discussions", 
      href: "/coordinators/forum/policy", 
      badge: 4
    },
    { 
      title: "Polls & Votes", 
      href: "/coordinators/forum/polls", 
      badge: 0
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Sidebar Toggle */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSidebarToggle}
              className="text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 mr-3 lg:mr-4"
            >
              {isSidebarOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex-shrink-0 flex items-center">
             
              <div className="hidden sm:block ml-3">
                <span className="text-[#27aae1] font-semibold text-lg">HBTAP</span>
                <span className="text-gray-600 text-xs block">Communications Hub</span>
              </div>
            </div>
          </div>


          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-start ml-8">
            {/* Dashboard */}
            <Link 
              href="/coordinators"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            {/* Discussion Forums Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion Forums
                  {forumCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                      {forumCount > 9 ? '9+' : forumCount}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {forumItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <MessageCircle className="mr-3 h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge > 0 && (
                        <Badge className="h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Announcements */}
            <Link 
              href="/coordinators/announcements"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Announcements
              {announcementCount > 0 && (
                <Badge className="ml-2 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                  {announcementCount > 9 ? '9+' : announcementCount}
                </Badge>
              )}
            </Link>
          </div>

        
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Notifications - Always visible */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/coordinators/notifications">
                    <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10">
                      <Bell className="h-5 w-5" />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* User Profile Dropdown - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 px-3 h-10">
                  {user?.profile_image ? (
                    <Image
                      src={user.profile_image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#27aae1]/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#27aae1]" />
                    </div>
                  )}
                  <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.username || "Member"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-gray-900">
                      {user?.first_name ? `${user.first_name} ${user.last_name}` : "HBTAP Member"}
                    </span>
                    <span className="text-sm text-gray-500">{user?.email || "member@hbtap.org"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/coordinators/profile" className="cursor-pointer flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/coordinators/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/coordinators/help" className="cursor-pointer flex items-center">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0  bg-opacity-20 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white border-l border-gray-200 shadow-lg z-50 lg:hidden overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link 
                href="/coordinators"
                onClick={toggleMobileMenu}
                className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full"
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>

              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  Discussion Forums
                  {forumCount > 0 && (
                    <Badge className="ml-auto h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                      {forumCount > 9 ? '9+' : forumCount}
                    </Badge>
                  )}
                </div>
                {forumItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center justify-between px-6 py-2 text-sm text-gray-600 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full ml-3"
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge > 0 && (
                      <Badge className="h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <Link 
                href="/coordinators/announcements"
                onClick={toggleMobileMenu}
                className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full"
              >
                <Megaphone className="h-5 w-5 mr-3" />
                Announcements
                {announcementCount > 0 && (
                  <Badge className="ml-auto h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                    {announcementCount > 9 ? '9+' : announcementCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;