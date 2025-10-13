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
  PlusCircle,
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
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { UserProfile } from "@/app/api/auth";

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

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/portal",
      icon: <Home className="h-5 w-5" />,
    },
{
  title: "Interventions Tracker",
  icon: <BarChart3 className="h-5 w-5" />,
  children: [
    { 
      title: "Dashboard", 
      href: "/portal/interventions", 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      title: "Submitted Proposals", 
      href: "/portal/interventions/all-proposals", 
      icon: <FileText className="h-4 w-4" /> 
    },
    { 
      title: "Assign Categories", 
      href: "/portal/interventions/categorization", 
      icon: <Target className="h-4 w-4" /> 
    },
    { 
      title: "Assign Reviewers", 
      href: "/portal/interventions/assignment", 
      icon: <Users className="h-4 w-4" /> 
    },
    { 
      title: "Assigned to Me", 
      href: "/portal/interventions/assigned-to-me", 
      icon: <UserCheck className="h-4 w-4" /> 
    },
    { 
      title: "Review Progress", 
      href: "/portal/interventions/review", 
      icon: <MessageSquare className="h-4 w-4" /> 
    },
    { 
      title: "Decision Rationale", 
      href: "/portal/interventions/decision-rationale", 
      icon: <Gavel className="h-4 w-4" /> 
    },
    { 
      title: "Implementation Status", 
      href: "/portal/interventions/implementation", 
      icon: <TrendingUp className="h-4 w-4" /> 
    },
    { 
      title: "Reports & Analytics", 
      href: "/portal/interventions/reports", 
      icon: <BarChart3 className="h-4 w-4" /> 
    }
  ]
},

    {
      title: "Records",
      icon: <Archive className="h-5 w-5" />,
      children: [
        { 
          title: "All Records", 
          href: "/portal/records", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Meeting Minutes", 
          href: "/portal/records/minutes", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Official Communications", 
          href: "/portal/records/official-comms", 
          icon: <Mail className="h-4 w-4" /> 
        },
        { 
          title: "Resolutions & Decisions", 
          href: "/portal/records/decisions", 
          icon: <CheckSquare className="h-4 w-4" /> 
        },
        { 
          title: "Attendance Registers", 
          href: "/portal/records/attendance", 
          icon: <UserCheck className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Calendar & Events",
      icon: <Calendar className="h-5 w-5" />,

      children: [
        { 
          title: "All events", 
          href: "/portal/events", 
          icon: <Calendar className="h-4 w-4" />,
        },
        { 
          title: "Upcoming Events", 
          href: "/portal/events/upcoming", 
          icon: <Calendar className="h-4 w-4" />,
        },
        { 
          title: "Past Events", 
          href: "/portal/events/past", 
          icon: <Archive className="h-4 w-4" /> 
        },
        { 
          title: "Training Sessions", 
          href: "/portal/events/training", 
          icon: <BookOpen className="h-4 w-4" />,
        },
      ]
    },
    {
      title: "Resources & Documents",
      icon: <FolderOpen className="h-5 w-5" />,
      children: [
        { 
          title: "All resources ", 
          href: "/portal/resources", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "SHA Guidelines ", 
          href: "/portal/resources/guidelines", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Panel Mandate", 
          href: "/portal/resources/panel-mandate", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "Templates", 
          href: "/portal/resources/templates", 
          icon: <FileText className="h-4 w-4" /> 
        },
        { 
          title: "SOPs & Policies", 
          href: "/portal/resources/policy", 
          icon: <FileText className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Member Directory",
      href: "/portal/members",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Task Management",
      icon: <CheckSquare className="h-5 w-5" />,
   
      children: [
        { 
          title: "Task Tracker", 
          href: "/portal/tasks", 
          icon: <CheckSquare className="h-4 w-4" />,
    
        },
      ]
    },

    {
      title: "Content Management",
      icon: <FileText className="h-5 w-5" />,
      children: [
        { 
          title: "Overview", 
          href: "/portal/content", 
          icon: <Grid className="h-4 w-4" /> 
        },
        { 
          title: "FAQs", 
          href: "/portal/content/faqs", 
          icon: <HelpCircle className="h-4 w-4" /> 
        },
        { 
          title: "News Articles", 
          href: "/portal/content/news", 
          icon: <Newspaper className="h-4 w-4" /> 
        },
        { 
          title: "Governance", 
          href: "/portal/content/team", 
          icon: <Users className="h-4 w-4" /> 
        },
        { 
          title: "Media Resources", 
          href: "/portal/content/media", 
          icon: <Video className="h-4 w-4" /> 
        },
      ]
    },
  ];

  const bottomNavigationItems: NavItem[] = [
    {
      title: "FAQ & Onboarding",
      href: "/portal/on-boarding",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      title: "Feedback Box",
      href: "/portal/feedback",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/portal/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Get user's full name
  const getUserFullName = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName = user?.last_name || user?.member?.user?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return user?.username || 'HBTAP Member';
  };

  // Get user's email
  const getUserEmail = () => {
    return user?.email || user?.member?.user?.email || '';
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

  // Get user role
  const getUserRole = () => {
    if (user?.is_superuser) return 'Super Admin';
    if (user?.is_staff) return 'Staff';
    return user?.member?.position || 'Member';
  };

  const fullName = getUserFullName();
  const userEmail = getUserEmail();
  const userInitials = getUserInitials();
  const userRole = getUserRole();

  const filterByRole = (items: NavItem[]): NavItem[] => {
    const currentUserRole = getUserRole();
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(currentUserRole);
    });
  };

  const isActive = (href: string) => {
    // For exact path matching
    if (pathname === href) return true;
    
    if (href === '/portal' && pathname !== '/portal') return false;
    
    return false;
  };

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
              level > 0 ? " pl-8" : "mr-6"
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
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden",
          isOpen ? "w-64 translate-x-0 border-r-1 " : "w-0 -translate-x-full border-none lg:w-16 lg:translate-x-0 lg:border-r-2 "
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
                  {userInitials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userRole}
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