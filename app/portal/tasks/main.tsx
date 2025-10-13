
// 'use client'
// import React, { useState, useEffect } from 'react';

// import { Plus, Filter, Search } from 'lucide-react';
// import { Task } from '@/types/dashboard/tasks';
// import { getMyTasks, markTaskComplete, markTaskInProgress, updateTask } from '@/app/api/dashboard/tasks';
// import { TaskCard } from './card';

// export default  TaskBoard: React.FC = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [draggedTask, setDraggedTask] = useState<Task | null>(null);

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       setLoading(true);
//       const response = await getMyTasks();
//       setTasks(response.results);
//     } catch (error) {
//       console.error('Failed to load tasks:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTaskUpdate = async (taskId: string, updates: any) => {
//     try {
//       const updatedTask = await updateTask(taskId, updates);
//       setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
//     } catch (error) {
//       console.error('Failed to update task:', error);
//     }
//   };

//   const handleTaskComplete = async (taskId: string) => {
//     try {
//       const updatedTask = await markTaskComplete(taskId);
//       setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
//     } catch (error) {
//       console.error('Failed to complete task:', error);
//     }
//   };

//   const handleTaskStart = async (taskId: string) => {
//     try {
//       const updatedTask = await markTaskInProgress(taskId);
//       setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
//     } catch (error) {
//       console.error('Failed to start task:', error);
//     }
//   };

//   const filteredTasks = tasks.filter(task =>
//     task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     task.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header */}
//       <div className="flex items-center justify-between p-6 border-b border-gray-200">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
//           <p className="text-gray-600 text-sm">{filteredTasks.length} tasks</p>
//         </div>
        
//         <div className="flex items-center gap-3">
//           {/* Search */}
//           <div className="relative">
//             <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search tasks..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//             />
//           </div>
          
//           {/* Filter Button */}
//           <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Filter size={16} />
//             <span className="text-sm">Filter</span>
//           </button>
          
//           {/* Add Task Button */}
//           <button 
//             style={{ backgroundColor: '#27aae1' }}
//             className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
//           >
//             <Plus size={16} />
//             <span className="text-sm font-medium">Add Task</span>
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {filteredTasks.map((task) => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               onUpdate={handleTaskUpdate}
//               onComplete={handleTaskComplete}
//               onStartProgress={handleTaskStart}
//               isDragging={draggedTask?.id === task.id}
//             />
//           ))}
//         </div>
        
//         {filteredTasks.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <div className="text-gray-400 mb-4">
//               <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
//             <p className="text-gray-500">Get started by creating your first task.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };