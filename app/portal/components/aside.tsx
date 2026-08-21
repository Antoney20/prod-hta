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
  UserCheck,
  Mail,
  BookOpen,
  Video,
  Newspaper,
  Grid,
  Gavel,
  LayoutDashboard,
  Bell,
  Layers,
  SlidersHorizontal,
  ClipboardCheck,
  BookText,
  ClipboardList,
  ActivitySquare,
  MailCheck,
  PenSquare,
  LineChart,
  NotepadTextDashed,
  Plus,
  HomeIcon,
  CloudUpload,
  FileStackIcon,
  Layers3,
  MessageSquare,
  ClipboardListIcon,
  File,
  Sparkles,
  ListChecks,
  FileEdit,
  FileCheck,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserProfile, UserRole } from "@/app/api/auth";
import { FaCheck, FaFileContract, FaStethoscope, FaWindows } from "react-icons/fa";

interface AsideProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: UserProfile | null;
}

type NavItem =
  | { type: "link";    title: string; href: string; icon: React.ReactNode; badge?: number }
  | { type: "group";   title: string; icon: React.ReactNode; badge?: number; children: NavItem[] }
  | { type: "section"; title: string }
  | { type: "divider" };

const sharedNationalPrograms: NavItem = {
  type: "group",
  title: "National Programs",
  icon: <ClipboardList className="h-5 w-5" />,
  children: [
    { type: "link", title: "National Programs",      href: "/portal/national-programs",           icon: <ActivitySquare className="h-4 w-4" /> },
    { type: "link", title: "Interventions Proposals", href: "/portal/national-programs/proposals",  icon: <Gavel className="h-4 w-4" /> },
     { type: "link", title: "Upload(Bulk) Proposals ", href: "/portal/national-programs/upload",  icon: <SlidersHorizontal  className="h-4 w-4" /> },
  ],
};


const sharedBenefitsPackage: NavItem = {
  type: "group",
  title: "Benefits Package",
  icon: <ClipboardList className="h-5 w-5" />,
  children: [
    { type: "link", title: "Current Benefits Package",      href: "/portal/benefits-package",           icon: <FaCheck className="h-4 w-4" /> },
    { type: "link", title: "Tariffs Reimbursements", href: "/portal/benefits-package/annex",  icon: <FaStethoscope className="h-4 w-4" /> },

    { type: "link", title: "Intervention by Package", href: "/portal/benefits-package/packages",  icon: <Gavel className="h-4 w-4" /> },

    { type: "link", title: "SWG Prioritized Topics",   href: "/portal/benefits-package/swg-prioritized",           icon: <ListChecks className="h-4 w-4" /> },
    { type: "link", title: "Appraised Interventions & Services", href: "/portal/benefits-package/appraisal-report", icon: <ClipboardList className="h-4 w-4" /> },
    { type: "link", title: "Proposed Benefits Package", href: "/portal/benefits-package/proposed", icon: <FileEdit className="h-4 w-4" /> },
    { type: "link", title: "Revised Benefits Package",  href: "/portal/benefits-package/revised-package",           icon: <FileCheck className="h-4 w-4" /> },
  ],
};

const sharedInterventions: NavItem = {
  type: "link",
  title: "Interventions",
  href: "/portal/interventions",
  icon: <LayoutDashboard className="h-4 w-4" />,
};

const sharedCalendarEvents: NavItem = {
  type: "group",
  title: "Calendar & Events",
  icon: <Calendar className="h-5 w-5" />,
  children: [
    { type: "link", title: "All Events",        href: "/portal/events",          icon: <Calendar className="h-4 w-4" /> },
    { type: "link", title: "Upcoming Events",   href: "/portal/events/upcoming", icon: <Calendar className="h-4 w-4" /> },
    { type: "link", title: "Past Events",       href: "/portal/events/past",     icon: <Archive className="h-4 w-4" /> },
    { type: "link", title: "Training Sessions", href: "/portal/events/training", icon: <BookOpen className="h-4 w-4" /> },
  ],
};

const sharedTaskManagement: NavItem = {
  type: "link",
  title: "Task Management",
  href: "/portal/tasks",
  icon: <CheckSquare className="h-5 w-5" />,
};



const userSwgNavItems: NavItem[] = [
  { type: "link", title: "Dashboard", href: "/portal", icon: <Home className="h-5 w-5" /> },
  {
    type: "group",
    title: "Interventions",
    icon: <LayoutDashboard className="h-5 w-5" />,
    children: [
      { type: "link", title: "All Proposals",  href: "/portal/interventions",        icon: <LayoutDashboard className="h-4 w-4" /> },
      { type: "link", title: "Status Update",  href: "/portal/interventions/status", icon: <SlidersHorizontal className="h-4 w-4" /> },
    ],
  },
  sharedNationalPrograms,
  sharedBenefitsPackage,

  {
    type: "group",
    title: "Topic Prioritization",
    icon: <ClipboardCheck className="h-5 w-5" />,
    children: [
      { type: "link", title: "Score Intervention", href: "/portal/tp/category", icon: <LayoutDashboard className="h-4 w-4" /> },
      { type: "link", title: "Individual Weighted Reports",   href: "/portal/tp/weighting", icon: <SlidersHorizontal className="h-4 w-4" /> },
    ],
  },

      {
    type: "group",
    title: "Activity Tracker",
    icon: <NotepadTextDashed className="h-5 w-5" />,
    children: [
      { type: "link", title: "home",  href: "/portal/activities/", icon: <HomeIcon className="h-4 w-4" /> },
      { type: "link", title: "Create Task", href: "/portal/activities/#",      icon: <Plus className="h-4 w-4" /> },
    ],
  },
  sharedCalendarEvents,
  sharedTaskManagement,
];



const assessmentGroupNavItems: NavItem[] = [
  { type: "link", title: "Dashboard", href: "/portal", icon: <Home className="h-5 w-5" /> },
  sharedInterventions,
  sharedNationalPrograms,
  sharedBenefitsPackage,

  { type: "divider" },
  { type: "section", title: "Assessment Group" },

  {
    type: "group",
    title: "Evidence",
    icon: <FileText className="h-5 w-5" />,
    children: [
      { type: "link", title: "Upload Evidence",   href: "/portal/assessment/evidence/upload", icon: <Plus className="h-4 w-4" /> },
      { type: "link", title: "Available Evidence", href: "/portal/assessment/evidence",        icon: <FolderOpen className="h-4 w-4" /> },
         
    ],
  },

  {

   type: "group",
    title: "Panel Evidence",
    icon: <FileText className="h-5 w-5" />,
    children: [

   { type: "link", title: "Assessment Evidence (upload excel)",    href: "/portal/panel/evidence",                icon: <FileStackIcon className="h-4 w-4" /> },
    ]
  },

  { type: "divider" },
  { type: "section", title: "Common" },

  sharedCalendarEvents,
  sharedTaskManagement,
];


const panelNavItems: NavItem[] = [
  { type: "link", title: "Dashboard",    href: "/portal",             icon: <Home className="h-5 w-5" /> },
  sharedInterventions,
  sharedNationalPrograms,
  sharedBenefitsPackage,


  { type: "divider" },
  { type: "section", title: "Assessment Group" },


  
  {
    type: "group",
    title: "Evidence",
    icon: <FileText className="h-5 w-5" />,
    children: [
      // { type: "link", title: "Upload Evidence",    href: "/portal/assessment/evidence/upload", icon: <Plus className="h-4 w-4" /> },
      { type: "link", title: "Available Evidence",  href: "/portal/assessment/evidence",        icon: <FolderOpen className="h-4 w-4" /> },
        // { type: "link", title: "Extract Evidence",  href: " /portal/assessment/evidence/extraction",        icon: <CloudUpload   className="h-4 w-4" /> },

     
    ],
  },

  { type: "divider" },
  { type: "section", title: "Appraisal (Panel)" },

  {
    type: "group",
    title: "Configuration",
    icon: <Settings className="h-5 w-5" />,
    children: [
      { type: "link", title: "Panel Criteria Appraisal Tool",     href: "/portal/panel/config/tool",     icon: <SlidersHorizontal className="h-4 w-4" /> },
      { type: "link", title: "Panel Survey",            href: "/portal/panel/survey",          icon: <ListChecks className="h-4 w-4" /> },
      // // { type: "link", title: "Criteria Info", href: "/portal/panel/config/criteria-evidence", icon: <BookText className="h-4 w-4" /> },
      //  { type: "link", title: "Criteria Weights", href: "/portal/panel/weights",         icon: <PenSquare className="h-4 w-4" /> },
    ],
  },
  // {
  //   type: "group",
  //   title: "Scoring",
  //   icon: <LineChart className="h-5 w-5" />,
  //   children: [
  //     { type: "link", title: "Score Interventions", href: "/portal/appraisal/scoring/score-intervention",         icon: <PenSquare className="h-4 w-4" /> },
  //     { type: "link", title: "Scoring Reports",     href: "/portal/appraisal/scoring/reports", icon: <BarChart3 className="h-4 w-4" /> },
  //   ],
  // },

  {
  type: "group",
  title: "Evidence Weighting Panel",
  icon: <LineChart className="h-5 w-5" />,
  children: [
    // { type: "link", title: "Assessment Evidence (upload)",    href: "/portal/panel/evidence",                icon: <FileStackIcon className="h-4 w-4" /> },
    // { type: "link", title: "Evidence Coverage (Status)",      href: "/portal/panel/evidence/coverage",       icon: <ClipboardListIcon className="h-4 w-4" /> },
    // { type: "link", title: "Protocol Guides",   href: "/portal/panel/protocol-guide", icon: <SlidersHorizontal className="h-4 w-4" /> },
    // { type: "link", title: "Criteria Rules and Guides",   href: "/portal/panel/rules", icon: <SlidersHorizontal className="h-4 w-4" /> },
    { type: "link", title: "Appraisal Template", href: "/portal/panel/data",      icon: <File className="h-4 w-4" /> },
    { type: "link", title: "Panel Scoring",           href: "/portal/panel/scoring",         icon: <ClipboardCheck className="h-4 w-4" /> },
    { type: "link", title: "Panel Scores Report",     href: "/portal/panel/scoring/report",  icon: <BarChart3 className="h-4 w-4" /> },

    { type: "link", title: "Panel Survey",            href: "/portal/panel/survey",          icon: <ListChecks className="h-4 w-4" /> },
    { type: "link", title: "Agentic Process", href: "/portal/panel/agentic",      icon: <Sparkles className="h-4 w-4" /> },
    { type: "link", title: "Appraisal Results", href: "/portal/panel/appraisal",      icon: <BarChart3 className="h-4 w-4" /> },
  

    // { type: "link", title: "Panel Decision", href: "/portal/panel/decision",      icon: <FaFileContract className="h-4 w-4" /> },

  ],
},



  { type: "divider" },
    {
    type: "group",
    title: "Activity Tracker",
    icon: <NotepadTextDashed className="h-5 w-5" />,
    children: [
      { type: "link", title: "home",  href: "/portal/activities/", icon: <HomeIcon className="h-4 w-4" /> },
      { type: "link", title: "Create Task", href: "/portal/activities/#",      icon: <Plus className="h-4 w-4" /> },
    ],
  },
  { type: "divider" },
  { type: "section", title: "Common" },

  sharedCalendarEvents,
  sharedTaskManagement,
];



const adminNavItems: NavItem[] = [
  { type: "link", title: "Dashboard",    href: "/portal",             icon: <Home className="h-5 w-5" /> },


  sharedInterventions,
  sharedNationalPrograms,
   sharedBenefitsPackage,


  { type: "divider" },
  { type: "section", title: "Topic Selection (SWG)" },

  {
    type: "group",
    title: "Tool Configuration",
    icon: <Settings className="h-5 w-5" />,
    children: [
      { type: "link", title: "Criteria Selection",      href: "/portal/config/selection-tool",  icon: <SlidersHorizontal className="h-4 w-4" /> },
      { type: "link", title: "System Categories",       href: "/portal/config/system-category", icon: <Layers className="h-4 w-4" /> },
      { type: "link", title: "Assign System Categories",href: "/portal/config/assign",          icon: <Layers className="h-4 w-4" /> },
      { type: "link", title: "Criteria Information",    href: "/portal/config/criteria-information", icon: <BookText className="h-4 w-4" /> },
    ],
  },
  {
    type: "group",
    title: "Topic Prioritization",
    icon: <ClipboardCheck className="h-5 w-5" />,
    children: [
      { type: "link", title: "Interventions by Category",     href: "/portal/tp/category",  icon: <LayoutDashboard className="h-4 w-4" /> },
      { type: "link", title: "Individual Weighted Reports",   href: "/portal/tp/weighting", icon: <SlidersHorizontal className="h-4 w-4" /> },
      { type: "link", title: "Scoring Reports",               href: "/portal/tp/reports",   icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  
  {
    type: "group",
    title: "Intervention Tracker",
    icon: <ClipboardList className="h-5 w-5" />,
    children: [
      { type: "link", title: "Review Status",  href: "/portal/tracker/review-status", icon: <ActivitySquare className="h-4 w-4" /> },
      { type: "link", title: "Feedback & Routing Decision",  href: "/portal/tracker/feedback-status", icon: <MessageSquare className="h-4 w-4" /> },
      { type: "link", title: "Decision Types", href: "/portal/tracker/decision",      icon: <Gavel className="h-4 w-4" /> },  
      
      { type: "link", title: "Assign to a Batch/Phase", href: "/portal/tracker/phase",      icon: <Layers3 className="h-4 w-4" /> },

    ],
  },

  { type: "divider" },
  { type: "section", title: "Assessment Group" },


  
  {
    type: "group",
    title: "Evidence",
    icon: <FileText className="h-5 w-5" />,
    children: [
      { type: "link", title: "Upload Evidence",    href: "/portal/assessment/evidence/upload", icon: <Plus className="h-4 w-4" /> },
      { type: "link", title: "Available Evidence",  href: "/portal/assessment/evidence",        icon: <FolderOpen className="h-4 w-4" /> },
        // { type: "link", title: "Extract Evidence",  href: " /portal/assessment/evidence/extraction",        icon: <CloudUpload   className="h-4 w-4" /> },

     
    ],
  },

  { type: "divider" },
  { type: "section", title: "Appraisal (Panel)" },

  {
    type: "group",
    title: "Configuration",
    icon: <Settings className="h-5 w-5" />,
    children: [
      { type: "link", title: "Assessment Tool Info",     href: "/portal/panel/config/tool",     icon: <SlidersHorizontal className="h-4 w-4" /> },
      // { type: "link", title: "Criteria Info", href: "/portal/panel/config/criteria-evidence", icon: <BookText className="h-4 w-4" /> },
       { type: "link", title: "Criteria Weights", href: "/portal/panel/weights",         icon: <PenSquare className="h-4 w-4" /> },
    ],
  },
  // {
  //   type: "group",
  //   title: "Scoring",
  //   icon: <LineChart className="h-5 w-5" />,
  //   children: [
  //     { type: "link", title: "Score Interventions", href: "/portal/appraisal/scoring/score-intervention",         icon: <PenSquare className="h-4 w-4" /> },
  //     { type: "link", title: "Scoring Reports",     href: "/portal/appraisal/scoring/reports", icon: <BarChart3 className="h-4 w-4" /> },
  //   ],
  // },

  {
  type: "group",
  title: "Evidence Weighting",
  icon: <LineChart className="h-5 w-5" />,
  children: [
    { type: "link", title: "Assessment Evidence (upload)",    href: "/portal/panel/evidence",                icon: <FileStackIcon className="h-4 w-4" /> },
    { type: "link", title: "Evidence Coverage (Status)",      href: "/portal/panel/evidence/coverage",       icon: <ClipboardListIcon className="h-4 w-4" /> },
    // { type: "link", title: "Protocol Guides",   href: "/portal/panel/protocol-guide", icon: <SlidersHorizontal className="h-4 w-4" /> },
    { type: "link", title: "Criteria Rules and Guides",   href: "/portal/panel/rules", icon: <SlidersHorizontal className="h-4 w-4" /> },
    { type: "link", title: "Appraisal Template", href: "/portal/panel/data",      icon: <File className="h-4 w-4" /> },
    { type: "link", title: "Panel Scoring",           href: "/portal/panel/scoring",         icon: <ClipboardCheck className="h-4 w-4" /> },
      { type: "link", title: "Panel Survey",            href: "/portal/panel/survey",          icon: <ListChecks className="h-4 w-4" /> },
        { type: "link", title: "Panel Survey Submissions",            href: "/portal/panel/survey/scores",          icon: <ListChecks className="h-4 w-4" /> },
    { type: "link", title: "Panel Scores Report",     href: "/portal/panel/scoring/report",  icon: <BarChart3 className="h-4 w-4" /> },
    { type: "link", title: "Auto-Score Rules",        href: "/portal/panel/scoring/rules",   icon: <Sliders className="h-4 w-4" /> },

    { type: "link", title: "Agentic Process", href: "/portal/panel/agentic",      icon: <Sparkles className="h-4 w-4" /> },
    { type: "link", title: "Appraisal Results", href: "/portal/panel/appraisal",      icon: <BarChart3 className="h-4 w-4" /> },

    { type: "link", title: "Panel Decision", href: "/portal/panel/decision",      icon: <FaFileContract className="h-4 w-4" /> },

  ],
},



  { type: "divider" },
  { type: "section", title: "Admin Tools" },

    {
    type: "group",
    title: "BPTAP Email Setup",
    icon: <MailCheck className="h-5 w-5" />,
    children: [

      { type: "link", title: "Send Emails",     href: "/portal/feedback/home",     icon: <Mail className="h-4 w-4" /> },
      { type: "link", title: "Email Templates", href: "/portal/feedback/templates",icon: <FileText className="h-4 w-4" /> },


      ],
      
  },

  // {
  //   type: "group",
  //   title: "Feedback Emails",
  //   icon: <MailCheck className="h-5 w-5" />,

  // },

  {
    type: "group",
    title: "Activity Tracker",
    icon: <NotepadTextDashed className="h-5 w-5" />,
    children: [
      { type: "link", title: "home",  href: "/portal/activities/", icon: <HomeIcon className="h-4 w-4" /> },
      { type: "link", title: "Create Task", href: "/portal/activities/#",      icon: <Plus className="h-4 w-4" /> },
    ],
  },

  {
    type: "group",
    title: "Records",
    icon: <Archive className="h-5 w-5" />,
    children: [
      { type: "link", title: "All Records",              href: "/portal/records",                icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "Meeting Minutes",          href: "/portal/records/minutes",        icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "Official Communications",  href: "/portal/records/official-comms", icon: <Mail className="h-4 w-4" /> },
      { type: "link", title: "Resolutions & Decisions",  href: "/portal/records/decisions",      icon: <CheckSquare className="h-4 w-4" /> },
      { type: "link", title: "Attendance Registers",     href: "/portal/records/attendance",     icon: <UserCheck className="h-4 w-4" /> },
    ],
  },
  {
    type: "group",
    title: "Resources & Documents",
    icon: <FolderOpen className="h-5 w-5" />,
    children: [
      { type: "link", title: "All Resources",  href: "/portal/resources",               icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "SHA Guidelines", href: "/portal/resources/guidelines",    icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "Panel Mandate",  href: "/portal/resources/panel-mandate", icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "Templates",      href: "/portal/resources/templates",     icon: <FileText className="h-4 w-4" /> },
      { type: "link", title: "SOPs & Policies",href: "/portal/resources/policy",        icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    type: "link",
    title: "Member Directory",
    href: "/portal/members",
    icon: <Users className="h-5 w-5" />,
  },
  {
    type: "group",
    title: "Content Management",
    icon: <FileText className="h-5 w-5" />,
    children: [
      { type: "link", title: "Overview",         href: "/portal/content",                  icon: <Grid className="h-4 w-4" /> },
      { type: "link", title: "FAQs",             href: "/portal/content/faqs",             icon: <HelpCircle className="h-4 w-4" /> },
      { type: "link", title: "News Articles",    href: "/portal/content/news",             icon: <Newspaper className="h-4 w-4" /> },
      { type: "link", title: "Governance",       href: "/portal/content/team",             icon: <Users className="h-4 w-4" /> },
      { type: "link", title: "Media Resources",  href: "/portal/content/media",            icon: <Video className="h-4 w-4" /> },
      { type: "link", title: "Contact Messages", href: "/portal/content/contact-messages", icon: <Mail className="h-4 w-4" /> },
      { type: "link", title: "Subscriptions",    href: "/portal/content/subscriptions",    icon: <Bell className="h-4 w-4" /> },
    ],
  },

  { type: "divider" },
  { type: "section", title: "Common" },

  sharedCalendarEvents,
  sharedTaskManagement,
];


const bottomNavItems: NavItem[] = [
  { type: "link", title: "Settings",       href: "/portal/settings",    icon: <Settings className="h-5 w-5" /> },
  { type: "link", title: "Onboarding Guide", href: "/portal/on-boarding", icon: <HelpCircle className="h-5 w-5" /> },
];


/** Recursively collect every group key from a nav array */
const collectGroupKeys = (items: NavItem[]): string[] =>
  items.flatMap(item => {
    if (item.type === "group") {
      return [`group-${item.title}`, ...collectGroupKeys(item.children)];
    }
    return [];
  });

const Aside = ({ isOpen, onToggle, user }: AsideProps) => {
  const pathname = usePathname();

  const role = user?.role as UserRole | undefined;

  const isUserOrSwg = role === "user" || role === "swg";
  const isPanel     = role === "panel";
  const isAssessmentGroup = role === "assessment";


  const initialExpanded =
    isUserOrSwg ? collectGroupKeys(userSwgNavItems) :
    isPanel     ? collectGroupKeys(panelNavItems)  :
    isAssessmentGroup ? collectGroupKeys(assessmentGroupNavItems) :
  [];

  const [expandedItems, setExpandedItems] = useState<string[]>(initialExpanded);

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
    );
  }

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const navigationItems: NavItem[] =
    isUserOrSwg ? userSwgNavItems :
    isPanel     ? panelNavItems   :
    isAssessmentGroup ? assessmentGroupNavItems :
  adminNavItems;


  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/portal" && pathname !== "/portal") return false;
    return false;
  };

  const itemKey = (item: NavItem) =>
    item.type === "link"  ? `link-${item.href}` :
    item.type === "group" ? `group-${item.title}` :
    "";

  const renderNavItem = (item: NavItem, level: number = 0): React.ReactNode => {

    if (item.type === "section") {
      if (!isOpen) return null;
      return (
        <div
          key={`section-${item.title}`}
          className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-gray-400 select-none"
        >
          {item.title}
        </div>
      );
    }

  
    if (item.type === "divider") {
      return <Separator key={`divider-${Math.random()}`} className="my-1" />;
    }


    if (item.type === "link") {
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            level > 0 ? "ml-3 mr-2 pl-4 py-2 text-[13px]" : "mr-2",
            active
              ? "bg-[#27aae1] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-[#27aae1]"
          )}
        >
          <span className={cn("flex-shrink-0", active ? "text-white" : "text-gray-400")}>
            {item.icon}
          </span>
          {isOpen && (
            <>
              <span className="ml-3 flex-1 truncate">{item.title}</span>
              {item.badge && item.badge > 0 && (
                <Badge
                  variant={active ? "secondary" : "destructive"}
                  className={cn(
                    "ml-2 h-5 text-xs",
                    active ? "bg-white/20 text-white" : "bg-[#fe7105] text-white"
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      );
    }

    // ── Group (collapsible) ───────────────────────────────────────────────────
    if (item.type === "group") {
      const key        = itemKey(item);
      const isExpanded = expandedItems.includes(key);

      const hasActiveChild = item.children.some(
        child => child.type === "link" && isActive(child.href)
      );

      return (
        <div key={key}>
          <button
            onClick={() => toggleExpanded(key)}
            className={cn(
              "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mr-2",
              level > 0 ? "ml-3 pl-4 py-2 text-[13px]" : "",
              hasActiveChild && !isExpanded
                ? "text-[#27aae1] bg-blue-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-[#27aae1]"
            )}
          >
            <span className={cn("flex-shrink-0", hasActiveChild ? "text-[#27aae1]" : "text-gray-400")}>
              {item.icon}
            </span>
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left truncate">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 text-xs bg-[#fe7105] text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
                <span className="ml-2 flex-shrink-0 text-gray-400">
                  {isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronRight className="h-3.5 w-3.5" />
                  }
                </span>
              </>
            )}
          </button>

          {isExpanded && isOpen && (
            <div className="mt-0.5 space-y-0.5 mb-1">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ── User meta helpers ────────────────────────────────────────────────────────
  const getUserFullName = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName  = user?.last_name  || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    return user?.username || "BPTAP User";
  };

  const getUserInitials = () => {
    const firstName = user?.first_name || user?.member?.user?.first_name;
    const lastName  = user?.last_name  || user?.member?.user?.last_name;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    if (user?.email)    return user.email[0].toUpperCase();
    return "M";
  };

  const getRoleLabel = (): string => {
    if (role === "admin")           return "Admin";
    if (role === "secretariat")     return "Secretariat";
    if (role === "content_manager") return "Content Manager";
    if (role === "panel")           return "Panel Member";
    if (role === "swg")             return "SWG Member";
   if (role === "assessment") return "Assessment Group"; 
    return "Member";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden",
          isOpen
            ? "w-64 translate-x-0 border-r border-gray-200"
            : "w-0 -translate-x-full border-none lg:w-16 lg:translate-x-0 lg:border-r lg:border-gray-200"
        )}
      >
        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navigationItems.map((item, i) => (
            <div key={i}>{renderNavItem(item)}</div>
          ))}

          <Separator className="my-2" />

          {bottomNavItems.map((item, i) => (
            <div key={`bottom-${i}`}>{renderNavItem(item)}</div>
          ))}
        </div>

        {isOpen && user && (
          <div className="shrink-0 p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#27aae1]/15 flex items-center justify-center flex-shrink-0">
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