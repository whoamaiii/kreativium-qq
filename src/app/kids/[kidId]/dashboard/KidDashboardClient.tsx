"use client";
import { useKidLive } from '@/hooks/useKidLive';
import LiveChat from '@/components/LiveChat';
import GoalCard from '@/components/goals/GoalCard';
import { useRouter } from 'next/navigation';

export default function KidDashboardClient({ kid }: { kid: any }) {
  const { stars, messages } = useKidLive(kid.id, kid.starTotal);
  const router = useRouter();
  
  const handleGoalUpdate = () => {
    // Refresh the page to get updated data
    router.refresh();
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{kid.name} ⭐ {stars}</h1>
      
      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Goals</h2>
          <div className="space-y-4">
            {kid.goals.map((g: any) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Live Updates</h2>
          <LiveChat kidId={kid.id} />
        </section>
      </div>
    </div>
  );
} 