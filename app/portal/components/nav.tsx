"use client";

import { logout } from "@/app/api/auth";
import { globalUserStore } from "@/app/context/guard";
import { UserProfile } from "@/app/api/auth";

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
  ChevronDown,
  VoteIcon
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
  const [user, setUser] = useState<UserProfile | null>(globalUserStore.userData);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [announcementCount, setAnnouncementCount] = useState(5);
  const [forumCount, setForumCount] = useState(12);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

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

  // Get profile image from nested member object or direct user object
  const getProfileImage = () => {
    return user?.member?.user?.profile_image || user?.profile_image || null;
  };

  // Get user's full name
  const getUserFullName = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName = user?.last_name || user?.member?.user?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return user?.username || "Member";
  };

  // Get user's email
  const getUserEmail = () => {
    return user?.email || user?.member?.user?.email || "member@hbtap.org";
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName = user?.last_name || user?.member?.user?.last_name;
    const username = user?.username;
    const email = user?.email || user?.member?.user?.email;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'M';
  };

  const profileImage = getProfileImage();
  const fullName = getUserFullName();
  const userEmail = getUserEmail();
  const userInitials = getUserInitials();

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
            <Link 
              href="/portal"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            <Link 
              href="/portal/forums"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion Forums
            </Link>

            <Link 
              href="/portal/announcements"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Announcements
            </Link>
             <Link 
              href="/portal/polls"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors"
            >
              <VoteIcon className="h-4 w-4 mr-2" />
              Polls
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/portal/notifications">
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

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 px-3 h-10">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#27aae1]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#27aae1]">
                        {userInitials}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">
                    {fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-gray-900">
                      {fullName}
                    </span>
                    <span className="text-sm text-gray-500">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/my-profile" className="cursor-pointer flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/on-boarding" className="cursor-pointer flex items-center">
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
            className="fixed inset-0 bg-opacity-20 z-40 lg:hidden"
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

              <Link 
                href="/portal/forum"
                onClick={toggleMobileMenu}
                className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Discussion Forums
                {forumCount > 0 && (
                  <Badge className="ml-auto h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                    {forumCount > 9 ? '9+' : forumCount}
                  </Badge>
                )}
              </Link>

              <Link 
                href="/portal/announcements"
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