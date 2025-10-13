// 'use client'
// import React, { useState, useRef } from 'react';

// import { Calendar, Clock, User, MoreVertical, CheckCircle, Play, AlertTriangle } from 'lucide-react';
// import { PRIORITY_COLORS, PriorityLevel, STATUS_COLORS, Task, TaskStatus } from '@/types/dashboard/tasks';

// interface TaskCardProps {
//   task: Task;
//   onUpdate: (taskId: string, updates: any) => void;
//   onComplete: (taskId: string) => void;
//   onStartProgress: (taskId: string) => void;
//   isDragging?: boolean;
//   style?: React.CSSProperties;
// }

// export const TaskCard: React.FC<TaskCardProps> = ({ 
//   task, 
//   onUpdate, 
//   onComplete, 
//   onStartProgress, 
//   isDragging = false,
//   style 
// }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const cardRef = useRef<HTMLDivElement>(null);

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return null;
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getPriorityIcon = (priority: PriorityLevel) => {
//     if (priority === PriorityLevel.URGENT || priority === PriorityLevel.HIGH) {
//       return <AlertTriangle size={12} />;
//     }
//     return null;
//   };

//   const getStatusAction = () => {
//     switch (task.status) {
//       case TaskStatus.NEW:
//         return (
//           <button
//             onClick={() => onStartProgress(task.id)}
//             className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs transition-colors"
//           >
//             <Play size={10} />
//             Start
//           </button>
//         );
//       case TaskStatus.IN_PROGRESS:
//       case TaskStatus.REVIEW:
//         return (
//           <button
//             onClick={() => onComplete(task.id)}
//             className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs transition-colors"
//           >
//             <CheckCircle size={10} />
//             Complete
//           </button>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div
//       ref={cardRef}
//       className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
//         isDragging ? 'shadow-lg rotate-2 z-50' : ''
//       } ${task.is_overdue ? 'border-l-4 border-l-red-500' : ''}`}
//       style={style}
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-2 min-w-0 flex-1">
//           <div
//             className="w-3 h-3 rounded-full flex-shrink-0"
//             style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
//           />
//           <h3 className="font-medium text-gray-900 truncate text-sm">
//             {task.title}
//           </h3>
//           {getPriorityIcon(task.priority) && (
//             <span style={{ color: PRIORITY_COLORS[task.priority] }}>
//               {getPriorityIcon(task.priority)}
//             </span>
//           )}
//         </div>
        
//         <div className="relative">
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="p-1 hover:bg-gray-100 rounded transition-colors"
//           >
//             <MoreVertical size={14} className="text-gray-400" />
//           </button>
          
//           {isMenuOpen && (
//             <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 min-w-[120px]">
//               <button className="w-full text-left px-3 py-1 text-xs hover:bg-gray-50">Edit</button>
//               <button className="w-full text-left px-3 py-1 text-xs hover:bg-gray-50">Duplicate</button>
//               <button className="w-full text-left px-3 py-1 text-xs hover:bg-gray-50 text-red-600">Delete</button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Description */}
//       {task.description && (
//         <p className="text-gray-600 text-xs mb-3 line-clamp-2">
//           {task.description}
//         </p>
//       )}

//       {/* Progress Bar */}
//       {task.progress > 0 && (
//         <div className="mb-3">
//           <div className="flex items-center justify-between mb-1">
//             <span className="text-xs text-gray-500">Progress</span>
//             <span className="text-xs text-gray-700 font-medium">{task.progress}%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-1.5">
//             <div
//               className="h-1.5 rounded-full transition-all duration-300"
//               style={{
//                 width: `${task.progress}%`,
//                 backgroundColor: task.progress === 100 ? '#10B981' : '#27aae1'
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Status Badge */}
//       <div className="flex items-center justify-between mb-3">
//         <span
//           className="px-2 py-1 rounded-full text-xs font-medium"
//           style={{
//             backgroundColor: `${STATUS_COLORS[task.status]}20`,
//             color: STATUS_COLORS[task.status]
//           }}
//         >
//           {task.status.replace('_', ' ').toUpperCase()}
//         </span>
        
//         {task.is_overdue && (
//           <span className="flex items-center gap-1 text-red-500 text-xs">
//             <Clock size={10} />
//             Overdue
//           </span>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Due Date */}
//           {task.due_date && (
//             <div className="flex items-center gap-1 text-gray-500">
//               <Calendar size={10} />
//               <span className="text-xs">{formatDate(task.due_date)}</span>
//             </div>
//           )}

//           {/* Assigned Users */}
//           {task.assigned_users.length > 0 && (
//             <div className="flex items-center gap-1">
//               <User size={10} className="text-gray-500" />
//               <div className="flex -space-x-1">
//                 {task.assigned_users.slice(0, 3).map((user, index) => (
//                   <div
//                     key={user.id}
//                     className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center"
//                     title={`${user.first_name} ${user.last_name}`}
//                   >
//                     <span className="text-xs text-gray-700 font-medium">
//                       {user.first_name?.[0] || user.username[0]}
//                     </span>
//                   </div>
//                 ))}
//                 {task.assigned_users.length > 3 && (
//                   <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
//                     <span className="text-xs text-gray-500">+{task.assigned_users.length - 3}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Action Button */}
//         {getStatusAction()}
//       </div>
//     </div>
//   );
// };
