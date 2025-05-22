"use client";

import React from "react";
import type { Goal, Entry } from "@prisma/client";

// Define types for fetched data, matching the new schema
type EntryData = Entry;
type GoalData = Goal & { entries: Entry[] };

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500",
  IN_PROGRESS: "bg-yellow-500",
  PENDING: "bg-red-500",
};

interface ILPClientProps {
  kidName: string;
  goals: GoalData[];
  activities: EntryData[];
}

export default function ILPClient({ kidName, goals, activities }: ILPClientProps) {
  const handleExportPDF = () => {
    // Link to the export API endpoint with the kid's ID
    const kidId = goals[0]?.studentId; // Get the student ID from any goal
    if (!kidId) return;
    
    // Trigger download by creating a link and clicking it
    const link = document.createElement('a');
    link.href = `/api/ilp/export?kid=${kidId}`;
    link.download = `${kidName.replace(/\s+/g, '_')}_ILP_Export.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-white bg-[#161325]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Individualized Learning Plan: {kidName}</h1>
          <p className="text-slate-300">
            Track progress and activities for personalized learning.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Export PDF
        </button>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Goal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-slate-700/50 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
              <p className="text-sm text-slate-300 mb-1">
                {goal.desc}
              </p>
              <div className="w-full bg-slate-600 rounded-full h-4 mb-2">
                <div
                  className="bg-purple-500 h-4 rounded-full text-xs text-white flex items-center justify-center"
                  style={{ width: `${goal.pct}%` }}
                >
                  {goal.pct}%
                </div>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View Details &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
        <div className="bg-slate-700/50 shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-600/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {activities.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {entry.activity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {entry.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[entry.status] || "bg-gray-500"
                      } text-white`}
                    >
                      {entry.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {entry.due?.toString().split("T")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
