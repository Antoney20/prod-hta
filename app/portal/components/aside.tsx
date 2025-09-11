"use client";

import { cn } from "@/lib/utils";
import {
  Archive,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  MessageSquare,
  PlusCircle,
  Settings,
  BarChart3,
  Users,
  Vote,
  Search,
  Megaphone,
  BookOpen,
  CheckSquare,
  MessageCircle,
  Lightbulb,
  UserCheck,
  TrendingUp,
  Mail
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AsideProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: any;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
  roles?: string[];
}

const Aside = ({ isOpen, onToggle, user }: AsideProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['main']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Navigation structure based on HBTAP Communications Hub requirements
  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/coordinators",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Records",
      icon: <Archive className="h-5 w-5" />,
      children: [
        { 
          title: "Meeting Minutes", 
          href: "/coordinators/records/minutes", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Official Communications", 
          href: "/coordinators/records/communications", 
          icon: <Mail className="h-4 w-4" /> 
        },
        { 
          title: "Resolutions & Decisions", 
          href: "/coordinators/records/resolutions", 
          icon: <CheckSquare className="h-4 w-4" /> 
        },
        { 
          title: "Attendance Registers", 
          href: "/coordinators/records/attendance", 
          icon: <UserCheck className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Calendar & Events",
      icon: <Calendar className="h-5 w-5" />,
      badge: 3,
      children: [
        { 
          title: "Upcoming Events", 
          href: "/coordinators/events/upcoming", 
          icon: <Calendar className="h-4 w-4" />,
          badge: 2
        },
        { 
          title: "Past Events", 
          href: "/coordinators/events/past", 
          icon: <Archive className="h-4 w-4" /> 
        },
        { 
          title: "Training Sessions", 
          href: "/coordinators/events/training", 
          icon: <BookOpen className="h-4 w-4" />,
          badge: 1
        },
      ]
    },
    {
      title: "Resources & Documents",
      icon: <FolderOpen className="h-5 w-5" />,
      children: [
        { 
          title: "SHA Guidelines", 
          href: "/coordinators/resources/guidelines", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Panel Mandate", 
          href: "/coordinators/resources/mandate", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Templates", 
          href: "/coordinators/resources/templates", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "SOPs & Policies", 
          href: "/coordinators/resources/policies", 
          icon: <FileText className="h-4 w-4" /> 
        },
      ]
    },
    // {
    //   title: "Announcements",
    //   href: "/coordinators/announcements",
    //   icon: <Megaphone className="h-5 w-5" />,
    //   badge: 5,
    // },
    {
      title: "Member Directory",
      href: "/coordinators/members",
      icon: <Users className="h-5 w-5" />,
    },
    // {
    //   title: "Discussion Forum",
    //   icon: <MessageSquare className="h-5 w-5" />,
    //   badge: 12,
    //   children: [
    //     { 
    //       title: "General Discussion", 
    //       href: "/coordinators/forum/general", 
    //       icon: <MessageCircle className="h-4 w-4" />,
    //       badge: 8
    //     },
    //     { 
    //       title: "Policy Discussions", 
    //       href: "/coordinators/forum/policy", 
    //       icon: <MessageCircle className="h-4 w-4" />,
    //       badge: 4
    //     },
    //     { 
    //       title: "Polls & Votes", 
    //       href: "/coordinators/forum/polls", 
    //       icon: <Vote className="h-4 w-4" /> 
    //     },
    //   ]
    // },
    {
      title: "Task Management",
      icon: <CheckSquare className="h-5 w-5" />,
      badge: 7,
      children: [
        { 
          title: "Task Tracker", 
          href: "/coordinators/tasks/tracker", 
          icon: <CheckSquare className="h-4 w-4" />,
          badge: 5
        },
        { 
          title: "My Assignments", 
          href: "/coordinators/tasks/my-tasks", 
          icon: <UserCheck className="h-4 w-4" />,
          badge: 2
        },
        { 
          title: "Progress Reports", 
          href: "/coordinators/tasks/progress", 
          icon: <TrendingUp className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Interventions Tracker",
      icon: <BarChart3 className="h-5 w-5" />,
      badge: 3,
      children: [
        { 
          title: "Proposal Dashboard", 
          href: "/coordinators/interventions/dashboard", 
          icon: <BarChart3 className="h-4 w-4" /> 
        },
        { 
          title: "Submit Proposal", 
          href: "/coordinators/interventions/submit", 
          icon: <PlusCircle className="h-4 w-4" /> 
        },
        { 
          title: "Review & Status", 
          href: "/coordinators/interventions/review", 
          icon: <CheckSquare className="h-4 w-4" />,
          badge: 3
        },
        { 
          title: "Implementation Status", 
          href: "/coordinators/interventions/implementation", 
          icon: <TrendingUp className="h-4 w-4" /> 
        },
      ]
    },
  ];

  const bottomNavigationItems: NavItem[] = [
    {
      title: "FAQ & Onboarding",
      href: "/coordinators/faq",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      title: "Feedback Box",
      href: "/coordinators/feedback",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/coordinators/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const filterByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!item.roles || !user?.role) return true;
      return item.roles.includes(user.role);
    });
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const itemActive = item.href ? isActive(item.href) : false;

    return (
      <div key={item.title}>
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              level > 0 ? "ml-4 pl-8" : "",
              itemActive 
                ? "bg-[#27aae1] text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100 hover:text-[#27aae1]"
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
              level > 0 ? "ml-4 pl-8" : ""
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
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
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
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col",
          isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
        )}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filterByRole(navigationItems).map(item => renderNavItem(item))}
          </div>


          <Separator className="my-4" />

          <div className="space-y-1">
            {filterByRole(bottomNavigationItems).map(item => renderNavItem(item))}
          </div>
        </div>

        {isOpen && user && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#27aae1]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#27aae1]">
                  {user.first_name?.[0] || user.email?.[0] || 'M'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : 'HBTAP Member'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role || 'Member'}
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