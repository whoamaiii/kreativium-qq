import Link from 'next/link';   // For navigation links

// Placeholder data for cards - can be expanded later
const activityCards = [
  { title: 'Play a Game', href: '/games', imgSrc: '/images/placeholder-game.png' },
  { title: 'Track Feelings', href: '/feelings', imgSrc: '/images/placeholder-feelings.png' },
  { title: 'Talk with Symbols', href: '/aac', imgSrc: '/images/placeholder-symbols.png' },
];

const quickActionCards = [
  { title: 'AAC', href: '/aac', icon: '🗣️' }, // Using emoji as placeholder icon
  { title: 'ILP', href: '/ilp', icon: '📄' },
  { title: 'Mood', href: '/mood', icon: '😊' },
  { title: 'Games', href: '/games', icon: '🎮' },
  { title: 'Settings', href: '/settings', icon: '⚙️' },
  { title: 'Help', href: '/help', icon: '❓' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-white">
      {/* Top Row Activity Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {activityCards.map((card) => (
            <Link key={card.title} href={card.href} className="block bg-slate-700/50 hover:bg-slate-600/50 p-6 rounded-lg shadow-lg transition-colors">
              <div className="relative w-full h-32 rounded mb-4 overflow-hidden flex items-center justify-center bg-gray-800 text-gray-400">
                {/* Placeholder for image */}
                <span className="text-sm">Image Placeholder</span>
              </div>
              <h2 className="text-xl font-semibold">{card.title}</h2>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Streak Section */}
      <section className="mb-8 bg-slate-700/50 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-2">Daily Streak</h2>
        <div className="flex items-center mb-2">
          <span className="text-5xl font-bold mr-2">3</span>
          <span className="text-lg">days</span>
          <span className="ml-auto text-yellow-400 text-2xl">🔥</span> {/* Streak icon */}
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2.5 mb-2">
          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-sm text-slate-300">Keep it up! You're doing great.</p>
      </section>

      {/* Quick Actions Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {quickActionCards.map((card) => (
            <Link key={card.title} href={card.href} className="block bg-slate-700/50 hover:bg-slate-600/50 p-6 rounded-lg shadow-lg transition-colors text-center aspect-square flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">{card.icon}</div>
              <h3 className="text-lg font-medium">{card.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
