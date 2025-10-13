"use client";

import { useRouter } from "next/navigation";
import { 
  FileText, 
  Target, 
  Users, 
  UserCheck, 
  MessageSquare, 
  Gavel, 
  TrendingUp, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export default function InterventionsDashboard() {
  const router = useRouter();

  const workflows = [
    {
      title: "Submitted Proposals",
      description: "View and manage all intervention proposals submitted to the system",
      icon: FileText,
      color: "blue",
      path: "/portal/interventions/all-proposals",
      stats: { label: "Total Proposals", value: "—" }
    },
    {
      title: "Assign Categories",
      description: "Categorize interventions by thematic areas and priorities",
      icon: Target,
      color: "purple",
      path: "/portal/interventions/categorization",
      stats: { label: "Pending", value: "—" }
    },
    {
      title: "Assign Reviewers",
      description: "Assign expert reviewers to evaluate intervention proposals",
      icon: Users,
      color: "indigo",
      path: "/portal/interventions/assignment",
      stats: { label: "Unassigned", value: "—" }
    },
    {
      title: "Assigned to Me",
      description: "Review proposals that have been assigned to you for evaluation",
      icon: UserCheck,
      color: "cyan",
      path: "/portal/interventions/assigned-to-me",
      stats: { label: "My Reviews", value: "—" }
    },
    {
      title: "Review Progress",
      description: "Track review progress and provide feedback on interventions",
      icon: MessageSquare,
      color: "orange",
      path: "/portal/interventions/review",
      stats: { label: "In Review", value: "—" }
    },
    {
      title: "Decision Rationale",
      description: "Document final decisions and rationale for each intervention",
      icon: Gavel,
      color: "green",
      path: "/portal/interventions/decision-rationale",
      stats: { label: "Decided", value: "—" }
    },
    {
      title: "Implementation Status",
      description: "Monitor implementation progress of approved interventions",
      icon: TrendingUp,
      color: "teal",
      path: "/portal/interventions/implementation",
      stats: { label: "Implementing", value: "—" }
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive reports and analyze intervention data",
      icon: BarChart3,
      color: "pink",
      path: "/portal/interventions/reports",
      stats: { label: "Available", value: "—" }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "bg-blue-100 text-blue-600",
        hover: "hover:border-blue-400 hover:shadow-blue-100",
        text: "text-blue-600"
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "bg-purple-100 text-purple-600",
        hover: "hover:border-purple-400 hover:shadow-purple-100",
        text: "text-purple-600"
      },
      indigo: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        icon: "bg-indigo-100 text-indigo-600",
        hover: "hover:border-indigo-400 hover:shadow-indigo-100",
        text: "text-indigo-600"
      },
      cyan: {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        icon: "bg-cyan-100 text-cyan-600",
        hover: "hover:border-cyan-400 hover:shadow-cyan-100",
        text: "text-cyan-600"
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "bg-orange-100 text-orange-600",
        hover: "hover:border-orange-400 hover:shadow-orange-100",
        text: "text-orange-600"
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "bg-green-100 text-green-600",
        hover: "hover:border-green-400 hover:shadow-green-100",
        text: "text-green-600"
      },
      teal: {
        bg: "bg-teal-50",
        border: "border-teal-200",
        icon: "bg-teal-100 text-teal-600",
        hover: "hover:border-teal-400 hover:shadow-teal-100",
        text: "text-teal-600"
      },
      pink: {
        bg: "bg-pink-50",
        border: "border-pink-200",
        icon: "bg-pink-100 text-pink-600",
        hover: "hover:border-pink-400 hover:shadow-pink-100",
        text: "text-pink-600"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const quickStats = [
    {
      label: "Total Proposals",
      value: "—",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "In Review",
      value: "—",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Approved",
      value: "—",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Pending Action",
      value: "—",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Interventions Management</h1>
        <p className="text-base text-gray-600 mt-2">
          Comprehensive workflow for managing intervention proposals from submission to implementation
        </p>
      </div>


      {/* Workflow Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Workflow Steps</h2>
          <p className="text-sm text-gray-500">Click on any card to access the workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workflows.map((workflow, index) => {
            const Icon = workflow.icon;
            const colors = getColorClasses(workflow.color);
            
            return (
              <button
                key={index}
                onClick={() => router.push(workflow.path)}
                className={`group relative bg-white rounded-xl border-2 ${colors.border} ${colors.hover} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left`}
              >
                {/* Number Badge */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`${colors.icon} rounded-lg p-3 w-fit mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
                  {workflow.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {workflow.description}
                </p>

                {/* Stats */}
                <div className={`${colors.bg} rounded-lg p-3 mb-4`}>
                  <p className="text-xs font-medium text-gray-600">{workflow.stats.label}</p>
                  <p className={`text-xl font-bold ${colors.text} mt-1`}>{workflow.stats.value}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  Access workflow
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-xl border-2 ${colors.border} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Process Flow Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Process</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Follow the numbered steps above to manage interventions through the complete lifecycle: 
              from initial submission and categorization, through expert review and decision-making, 
              to implementation tracking and final reporting.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Submission</p>
                  <p className="text-xs text-gray-600">Receive proposals</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Categorization</p>
                  <p className="text-xs text-gray-600">Organize by themes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-600">Expert evaluation</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Implementation</p>
                  <p className="text-xs text-gray-600">Track progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}