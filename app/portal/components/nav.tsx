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
  Megaphone,
  MessageSquare,
  Home,
  VoteIcon,
  CheckSquare,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { getMyTasks } from "@/app/api/dashboard/tasks";
import { Alert } from "@/types/new/notification";
import { getAlerts } from "@/app/api/dashboard/notification";

interface NavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

interface TaskSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  is_overdue: boolean;
}

function TasksDropdown() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyTasks();
      setTasks(Array.isArray(data) ? data : (data as any)?.results || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const incomplete = tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled");
  const count = incomplete.length;
  // Show at most 6 in dropdown, overdue first
  const sorted = [...incomplete].sort((a, b) => Number(b.is_overdue) - Number(a.is_overdue)).slice(0, 6);

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) load(); }}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10"
              >
                <CheckSquare className="h-5 w-5" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#27aae1] text-white font-medium p-0 border-0">
                    {count > 9 ? "9+" : count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>My Tasks</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">My Tasks</span>
          {count === 0 ? (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> All caught up
            </span>
          ) : (
            <span className="text-xs text-gray-500">{count} pending</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
        ) : count === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            <CheckCheck className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
            No pending tasks
          </div>
        ) : (
          sorted.map((task) => (
            <DropdownMenuItem key={task.id} asChild>
              <Link
                href={`/portal/tasks`}
                className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
              >
                {task.is_overdue ? (
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.is_overdue ? "text-red-600" : "text-gray-800"}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${task.is_overdue ? "text-red-400" : "text-gray-400"}`}>
                    {task.is_overdue
                      ? `Overdue · ${task.due_date}`
                      : task.due_date
                      ? `Due ${task.due_date}`
                      : capitalize(task.status.replace("_", " "))}
                  </p>
                </div>
                <PriorityDot priority={task.priority} />
              </Link>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/portal/tasks"
            className="flex items-center justify-center py-2 text-sm font-medium text-[#27aae1] cursor-pointer"
          >
            View all tasks →
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: "bg-red-500",
    high: "bg-orange-400",
    medium: "bg-yellow-400",
    low: "bg-gray-300",
  };
  return (
    <span
      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${colors[priority] ?? "bg-gray-300"}`}
      title={priority}
    />
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function AlertsDropdown() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data.alerts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = alerts.length;

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) load(); }}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10">
                <Bell className="h-5 w-5" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                    {count > 9 ? "9+" : count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent><p>Alerts</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">Alerts</span>
          {count === 0 && !loading && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> All clear
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
        ) : count === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            <CheckCheck className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
            No alerts right now
          </div>
        ) : (
          alerts.map((alert, i) => (
            <DropdownMenuItem key={i} asChild>
              <Link href={alert.action_url} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer">
                <AlertCircle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === "high" ? "text-red-500" : "text-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${alert.severity === "high" ? "text-red-600" : "text-gray-800"}`}>
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{alert.detail}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Navbar = ({ isSidebarOpen, onSidebarToggle }: NavbarProps) => {
  const [user, setUser] = useState<UserProfile | null>(globalUserStore.userData);
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const getProfileImage = () =>
    user?.member?.user?.profile_image || user?.profile_image || null;

  const getUserFullName = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName = user?.last_name || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return user?.username || "Member";
  };

  const getUserEmail = () =>
    user?.email || user?.member?.user?.email || "member@hbtap.org";

  const getUserInitials = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName = user?.last_name || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    const email = user?.email || user?.member?.user?.email;
    if (email) return email[0].toUpperCase();
    return "M";
  };

  const profileImage = getProfileImage();
  const fullName = getUserFullName();
  const userEmail = getUserEmail();
  const userInitials = getUserInitials();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left — Logo + sidebar toggle */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 mr-3 lg:mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0 flex items-center">
              <div className="hidden sm:block ml-3">
                <span className="text-[#27aae1] font-semibold text-lg">BPTAP</span>
                <span className="text-gray-600 text-xs block">ADMIN Hub</span>
              </div>
            </div>
          </div>

          {/* Centre nav links */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-start ml-8">
            <Link href="/portal" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Link>
            <Link href="/portal/forums" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors">
              <MessageSquare className="h-4 w-4 mr-2" /> Discussion Forums
            </Link>
            <Link href="/portal/announcements" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors">
              <Megaphone className="h-4 w-4 mr-2" /> Announcements
            </Link>
            <Link href="/portal/polls" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors">
              <VoteIcon className="h-4 w-4 mr-2" /> Polls
            </Link>
          </div>

          {/* Right — actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Tasks */}
            <TasksDropdown />

            {/* Alerts */}
            <AlertsDropdown />

            {/* User profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 px-3 h-10">
                  {profileImage ? (
                    <Image src={profileImage} alt="Profile" width={32} height={32} className="rounded-full border-2 border-gray-200 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#27aae1]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#27aae1]">{userInitials}</span>
                    </div>
                  )}
                  <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">{fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-gray-900">{fullName}</span>
                    <span className="text-sm text-gray-500">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/my-profile" className="cursor-pointer flex items-center">
                    <User className="mr-3 h-4 w-4" /><span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-3 h-4 w-4" /><span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/on-boarding" className="cursor-pointer flex items-center">
                    <HelpCircle className="mr-3 h-4 w-4" /><span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" /><span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-opacity-20 z-40 lg:hidden" onClick={toggleMobileMenu} />
          <div className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white border-l border-gray-200 shadow-lg z-50 lg:hidden overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link href="/coordinators" onClick={toggleMobileMenu} className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full">
                <Home className="h-5 w-5 mr-3" /> Dashboard
              </Link>
              <Link href="/portal/tasks" onClick={toggleMobileMenu} className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full">
                <CheckSquare className="h-5 w-5 mr-3" /> My Tasks
              </Link>
              <Link href="/portal/forum" onClick={toggleMobileMenu} className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full">
                <MessageSquare className="h-5 w-5 mr-3" /> Discussion Forums
                {forumCount > 0 && (
                  <Badge className="ml-auto h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                    {forumCount > 9 ? "9+" : forumCount}
                  </Badge>
                )}
              </Link>
              <Link href="/portal/announcements" onClick={toggleMobileMenu} className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#27aae1] hover:bg-[#27aae1]/10 rounded-lg transition-colors w-full">
                <Megaphone className="h-5 w-5 mr-3" /> Announcements
                {announcementCount > 0 && (
                  <Badge className="ml-auto h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-[#fe7105] text-white font-medium p-0 border-0">
                    {announcementCount > 9 ? "9+" : announcementCount}
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