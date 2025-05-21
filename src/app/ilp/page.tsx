"use client"; // Required for useRef and client-side event handling
import React, { useRef } from 'react';
// import { PrismaClient } from '@/generated/prisma'; // We'll use this later
// const prisma = new PrismaClient();
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Placeholder data - replace with actual data fetching later
const placeholderGoals = [
  {
    id: '1',
    title: 'Reading Comprehension',
    description: 'Improve by 20% this semester.',
    currentProgress: 75,
    activities: [
      { id: 'a1', title: 'Reading Practice', subject: 'English', status: 'COMPLETED', dueDate: '2024-03-15' },
      { id: 'a2', title: 'Book Report', subject: 'English', status: 'IN_PROGRESS', dueDate: '2024-03-30' },
    ],
  },
  {
    id: '2',
    title: 'Math Problem Solving',
    description: 'Increase accuracy by 15%.',
    currentProgress: 60,
    activities: [
      { id: 'a3', title: 'Math Quiz', subject: 'Mathematics', status: 'IN_PROGRESS', dueDate: '2024-03-20' },
    ],
  },
];

const placeholderActivities = [
    { id: 'a1', title: 'Reading Practice', subject: 'English', status: 'COMPLETED', dueDate: '2024-03-15' },
    { id: 'a2', title: 'Math Quiz', subject: 'Mathematics', status: 'IN_PROGRESS', dueDate: '2024-03-20' },
    { id: 'a3', title: 'Science Experiment', subject: 'Science', status: 'COMPLETED', dueDate: '2024-03-22' },
    { id: 'a4', title: 'History Project', subject: 'Social Studies', status: 'IN_PROGRESS', dueDate: '2024-03-25' },
    { id: 'a5', title: 'Art Workshop', subject: 'Arts', status: 'PENDING', dueDate: '2024-03-28' },
];

const statusColors: { [key: string]: string } = {
  COMPLETED: 'bg-green-500',
  IN_PROGRESS: 'bg-yellow-500',
  PENDING: 'bg-red-500',
};


export default function ILPPage() {
  const ilpContentRef = useRef<HTMLDivElement>(null);

  // const goals = await prisma.goal.findMany({ include: { activities: true } }); // Example data fetching
  // const activities = await prisma.activity.findMany();
  const goals = placeholderGoals;
  const activities = placeholderActivities;

  const handleExportPDF = () => {
    if (ilpContentRef.current) {
      html2canvas(ilpContentRef.current, { scale: 2, backgroundColor: '#161325' }) // Added backgroundColor
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4'); // A4 portrait
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;
          let newWidth = pdfWidth;
          let newHeight = newWidth / ratio;

          // If height is still too large, scale by height
          if (newHeight > pdfHeight) {
            newHeight = pdfHeight;
            newWidth = newHeight * ratio;
          }
          
          pdf.addImage(imgData, 'PNG', 0, 0, newWidth, newHeight);
          pdf.save('ilp-export.pdf');
        });
    }
  };

  return (
    <div ref={ilpContentRef} className="container mx-auto p-4 sm:p-6 lg:p-8 text-white bg-[#161325]"> {/* Added bg for PDF capture */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Individualized Learning Plan</h1>
          <p className="text-slate-300">Track progress and activities for personalized learning.</p>
        </div>
        <button onClick={handleExportPDF} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Export PDF
        </button>
      </div>

      {/* Goals Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Goal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-slate-700/50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
              <p className="text-sm text-slate-300 mb-1">{goal.description}</p>
              <div className="w-full bg-slate-600 rounded-full h-4 mb-2">
                <div
                  className="bg-purple-500 h-4 rounded-full text-xs text-white flex items-center justify-center"
                  style={{ width: `${goal.currentProgress}%` }}
                >
                  {goal.currentProgress}%
                </div>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View Details &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Log Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
        {/* Add filter buttons here later: All, Completed, In Progress, Pending */}
        <div className="bg-slate-700/50 shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-600/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{activity.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{activity.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[activity.status] || 'bg-gray-500'} text-white`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{activity.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
