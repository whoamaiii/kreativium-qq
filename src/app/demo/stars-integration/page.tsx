import ILPClientEnhanced from '@/app/ilp/ILPClientEnhanced'
import { createMockGoal, createMockEntry } from '@/app/ilp/testHelpers';

// Demo page to showcase the star integration
export default function StarsIntegrationDemo() {
  const demoData = {
    kidName: "Demo Student",
    kidId: 1,
    initialStars: 3,
    goals: [
      createMockGoal({
        id: 101,
        kidId: 1,
        title: "Complete Math Homework",
        desc: "Finish all assigned problems from Chapter 5",
        pct: 90,
        pctComplete: 90,
      }),
      createMockGoal({
        id: 102,
        kidId: 1,
        title: "Read 20 Pages",
        desc: "Continue reading 'The Adventure Book'",
        pct: 75,
        pctComplete: 75,
      }),
      createMockGoal({
        id: 103,
        kidId: 1,
        title: "Science Project",
        desc: "Build volcano model for science fair",
        pct: 40,
        pctComplete: 40,
      })
    ],
    activities: [
      createMockEntry({
        id: 201,
        kidId: 1,
        goalId: 101,
        activity: "Practice multiplication tables",
        subject: "Math",
        status: "IN_PROGRESS",
        due: new Date("2025-06-01"),
        delta: 10,
      }),
      createMockEntry({
        id: 202,
        kidId: 1,
        goalId: 102,
        activity: "Silent reading time",
        subject: "English",
        status: "COMPLETED",
        due: new Date("2025-05-30"),
        delta: 15,
      })
    ]
  }

  return (
    <div className="min-h-screen bg-[#0F0E1A]">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              🌟 Stars Integration Demo
            </h1>
            <p className="text-purple-200">
              This demo shows the star awarding system in action. Try completing goals to see stars being awarded with confetti!
            </p>
            <div className="mt-4 space-y-2 text-sm text-purple-300">
              <p>• Click &quot;+10%&quot; to increment progress</p>
              <p>• Click &quot;Complete&quot; to finish a goal and earn a star</p>
              <p>• Watch for confetti when stars are awarded!</p>
              <p>• The star badge updates in real-time</p>
            </div>
          </div>
        </div>
      </div>
      
      <ILPClientEnhanced {...demoData} />
    </div>
  )
}