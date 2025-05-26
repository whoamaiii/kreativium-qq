"use client";

import React, { useState } from "react";
import type { Goal, Entry } from "@prisma/client";
import StarsBadge from "@/components/StarsBadge";
import { useStars } from "@/hooks/useStars";
import { launchConfetti } from "@/utils/confetti";

// Define types for fetched data, matching the new schema
type EntryData = Entry;
type GoalData = Goal & { entries: Entry[] };

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500",
  IN_PROGRESS: "bg-yellow-500",
  PENDING: "bg-red-500",
};

interface ILPClientEnhancedProps {
  kidName: string;
  kidId: number;
  initialStars: number;
  goals: GoalData[];
  activities: EntryData[];
}

export default function ILPClientEnhanced({ 
  kidName, 
  kidId,
  initialStars, 
  goals: initialGoals, 
  activities 
}: ILPClientEnhancedProps) {
  const [goals, setGoals] = useState(initialGoals);
  const { stars, awardStar } = useStars(kidId, initialStars);
  const [updating, setUpdating] = useState<number | null>(null);

  const handleUpdateGoalProgress = async (goalId: number, newProgress: number) => {
    try {
      setUpdating(goalId);
      
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pct: newProgress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const result = await response.json();
      
      // Update local state
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, pct: result.goal.pct } 
          : goal
      ));

      // If a star was awarded, trigger confetti
      if (result.starAwarded) {
        await awardStar();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      // In a real app, show error toast
    } finally {
      setUpdating(null);
    }
  };

  const handleExportPDF = () => {
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
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">Individualized Learning Plan: {kidName}</h1>
            <StarsBadge stars={stars} variant="detailed" />
          </div>
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
              <p className="text-sm text-slate-300 mb-4">
                {goal.desc}
              </p>
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{goal.pct}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-4">
                  <div
                    className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${goal.pct}%` }}
                  />
                </div>
              </div>

              {/* Demo controls for updating progress */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.pct + 10))}
                  disabled={goal.pct >= 100 || updating === goal.id}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +10%
                </button>
                <button
                  onClick={() => handleUpdateGoalProgress(goal.id, 100)}
                  disabled={goal.pct >= 100 || updating === goal.id}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete
                </button>
                {updating === goal.id && (
                  <span className="text-sm text-slate-400 self-center">Updating...</span>
                )}
              </div>
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