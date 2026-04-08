"use client";

import { cn } from "@/lib/utils";
import {
  Archive,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Settings,
  BarChart3,
  Users,
  CheckSquare,
  Lightbulb,
  UserCheck,
  Mail,
  BookOpen,
  Video,
  Newspaper,
  Grid,
  TrendingUp,
  Gavel,
  MessageSquare,
  Target,
  LayoutDashboard,
  Bell,
  Layers,
  SlidersHorizontal,
  ClipboardCheck,
  BookText,
  ClipboardList,
  ActivitySquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserProfile, UserRole } from "@/app/api/auth";

interface AsideProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: UserProfile | null;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const Aside = ({ isOpen, onToggle, user }: AsideProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['main']);

  const role = user?.role as UserRole | undefined;
  const isUserOrSwg = role === 'user' || role === 'swg';

  // Don't render nav until user role is known
  if (!role) {
    return (
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out z-50 flex flex-col items-center justify-center overflow-hidden",
          isOpen
            ? "w-64 translate-x-0 border-r-1"
            : "w-0 -translate-x-full border-none lg:w-16 lg:translate-x-0 lg:border-r-2"
        )}
      >
        {isOpen && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27aae1] border-t-transparent" />
            <p className="text-xs text-gray-400 font-medium tracking-wide">Preparing...</p>
          </div>
        )}
      </aside>
    )
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const sharedCalendarEvents: NavItem = {
    title: "Calendar & Events",
    icon: <Calendar className="h-5 w-5" />,
    children: [
      { title: "All events",        href: "/portal/events",          icon: <Calendar className="h-4 w-4" /> },
      { title: "Upcoming Events",   href: "/portal/events/upcoming", icon: <Calendar className="h-4 w-4" /> },
      { title: "Past Events",       href: "/portal/events/past",     icon: <Archive className="h-4 w-4" /> },
      { title: "Training Sessions", href: "/portal/events/training", icon: <BookOpen className="h-4 w-4" /> },
    ],
  };

  const sharedTaskManagement: NavItem = {
    title: "Task Management",
    icon: <CheckSquare className="h-5 w-5" />,
    children: [
      { title: "Task Tracker", href: "/portal/tasks", icon: <CheckSquare className="h-4 w-4" /> },
    ],
  };

  const sharedAll:NavItem = {


      title: "Interventions",
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { title: "All Proposals",             href: "/portal/interventions",                    icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: "Status Update",       href: "/portal/interventions/status",    icon: <SlidersHorizontal className="h-4 w-4" /> },
      ]
  };

  const userSwgNavItems: NavItem[] = [
    { title: "Dashboard", href: "/portal", icon: <Home className="h-5 w-5" /> },
    sharedAll,
    {
      title: "Topic Prioritization",
      icon: <ClipboardCheck className="h-5 w-5" />,
      children: [
        { title: "Score Intervention", href: "/portal/tp/category", icon: <LayoutDashboard className="h-4 w-4" /> },
        // { title: "Score Interventions",       href: "/portal/tp/score",    icon: <SlidersHorizontal className="h-4 w-4" /> },
      ],
    },

    sharedCalendarEvents,
    sharedTaskManagement,

  ];


  const adminNavItems: NavItem[] = [
    { title: "Dashboard", href: "/portal", icon: <Home className="h-5 w-5" /> },
    sharedAll,
    {
      title: "Tool Configuration",
      icon: <Settings className="h-5 w-5" />,
      children: [
        { title: "Criteria Selection", href: "/portal/config/selection-tool",  icon: <SlidersHorizontal className="h-4 w-4" /> },
        { title: "System Categories",  href: "/portal/config/system-category", icon: <Layers className="h-4 w-4" /> },
        
                { title: "Assign System Categories",  href: "/portal/config/assign",   icon: <Layers className="h-4 w-4" /> },
        { title: "Criteria Information",  href: "/portal/config/criteria-information", icon: <BookText className="h-4 w-4" /> },
        // { title: "Open Rescoring",  href: "/portal/config/open-rescoring", icon:  <SlidersHorizontal  className="h-4 w-4" /> }
      ],
    },
    


    {
      title: "Topic Prioritization",
      icon: <ClipboardCheck className="h-5 w-5" />,
      children: [

        { title: "Interventions by Category", href: "/portal/tp/category", icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: "Individual Weighted Reports",       href: "/portal/tp/weighting",    icon: <SlidersHorizontal className="h-4 w-4" /> },
        { title: "Scoring Reports",           href: "/portal/tp/reports",  icon: <BarChart3 className="h-4 w-4" /> },
      ],
    },

  {
  title: "Intervention Tracker",
  icon: <ClipboardList className="h-5 w-5" />,
  children: [
    { title: "Review Status",   href: "/portal/tracker/review-status", icon: <ActivitySquare className="h-4 w-4" /> },
    { title: "Decision Types",  href: "/portal/tracker/decision",      icon: <Gavel className="h-4 w-4" /> },
  ],
},


    {
      title: "Records",
      icon: <Archive className="h-5 w-5" />,
      children: [
        { title: "All Records",             href: "/portal/records",               icon: <FileText className="h-4 w-4" /> },
        { title: "Meeting Minutes",         href: "/portal/records/minutes",       icon: <FileText className="h-4 w-4" /> },
        { title: "Official Communications", href: "/portal/records/official-comms",icon: <Mail className="h-4 w-4" /> },
        { title: "Resolutions & Decisions", href: "/portal/records/decisions",     icon: <CheckSquare className="h-4 w-4" /> },
        { title: "Attendance Registers",    href: "/portal/records/attendance",    icon: <UserCheck className="h-4 w-4" /> },
      ],
    },
    sharedCalendarEvents,
    {
      title: "Resources & Documents",
      icon: <FolderOpen className="h-5 w-5" />,
      children: [
        { title: "All resources",   href: "/portal/resources",               icon: <FileText className="h-4 w-4" /> },
        { title: "SHA Guidelines",  href: "/portal/resources/guidelines",    icon: <FileText className="h-4 w-4" /> },
        { title: "Panel Mandate",   href: "/portal/resources/panel-mandate", icon: <FileText className="h-4 w-4" /> },
        { title: "Templates",       href: "/portal/resources/templates",     icon: <FileText className="h-4 w-4" /> },
        { title: "SOPs & Policies", href: "/portal/resources/policy",        icon: <FileText className="h-4 w-4" /> },
      ],
    },
    { title: "Member Directory", href: "/portal/members", icon: <Users className="h-5 w-5" /> },
    sharedTaskManagement,
    {
      title: "Content Management",
      icon: <FileText className="h-5 w-5" />,
      children: [
        { title: "Overview",         href: "/portal/content",                  icon: <Grid className="h-4 w-4" /> },
        { title: "FAQs",             href: "/portal/content/faqs",             icon: <HelpCircle className="h-4 w-4" /> },
        { title: "News Articles",    href: "/portal/content/news",             icon: <Newspaper className="h-4 w-4" /> },
        { title: "Governance",       href: "/portal/content/team",             icon: <Users className="h-4 w-4" /> },
        { title: "Media Resources",  href: "/portal/content/media",            icon: <Video className="h-4 w-4" /> },
        { title: "Contact Messages", href: "/portal/content/contact-messages", icon: <Mail className="h-4 w-4" /> },
        { title: "Subscriptions",    href: "/portal/content/subscriptions",    icon: <Bell className="h-4 w-4" /> },
      ],
    },
  ];


  const navigationItems: NavItem[] = isUserOrSwg ? userSwgNavItems : adminNavItems;

  const bottomNavigationItems: NavItem[] = [
    { title: "Feedback Box (Grievances)", href: "/portal/feedback",    icon: <Lightbulb className="h-5 w-5" /> },
    { title: "Settings",                  href: "/portal/settings",    icon: <Settings className="h-5 w-5" /> },
    { title: "Onboarding Guide",          href: "/portal/on-boarding", icon: <HelpCircle className="h-5 w-5" /> },
  ];


  const getUserFullName = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName  = user?.last_name  || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    return user?.username || 'BPTAP User';
  };

  const getUserInitials = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName  = user?.last_name  || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    if (user?.email)    return user.email[0].toUpperCase();
    return 'M';
  };

  const getRoleLabel = (): string => {
    if (role === 'admin')           return 'Admin';
    if (role === 'secretariat')    return 'Secretariate';
    if (role === 'content_manager') return 'Content Manager';
    if (role === 'swg')             return 'SWG Member';
    return 'Member';
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === '/portal' && pathname !== '/portal') return false;
    return false;
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded  = expandedItems.includes(item.title);
    const itemActive  = item.href ? isActive(item.href) : false;

    return (
      <div key={item.title}>
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              level > 0 ? "ml-4 mr-2 pl-4" : "mr-6",
              itemActive
                ? "bg-[#27aae1] text-white shadow-md"
                : "text-gray-700 bg-gray-100 hover:text-[#27aae1]"
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {isOpen && (
              <>
                <span className="ml-3 flex-1">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant={itemActive ? "secondary" : "destructive"}
                    className={cn(
                      "ml-2 h-5 text-xs",
                      itemActive ? "bg-white/20 text-white" : "bg-[#fe7105] text-white"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-[#27aae1]",
              level > 0 ? "pl-8" : "mr-6"
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 text-xs bg-[#fe7105] text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <span className="ml-2 flex-shrink-0">
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden",
          isOpen
            ? "w-64 translate-x-0 border-r-1"
            : "w-0 -translate-x-full border-none lg:w-16 lg:translate-x-0 lg:border-r-2"
        )}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map(item => renderNavItem(item))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {bottomNavigationItems.map(item => renderNavItem(item))}
          </div>
        </div>

        {isOpen && user && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#27aae1]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#27aae1]">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserFullName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getRoleLabel()}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Aside;