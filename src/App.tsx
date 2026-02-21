import { useState } from 'react';
import Home from './pages/Home';
import TeamManager from './pages/TeamManager';
import GameRecorder from './pages/GameRecorder';
import GameSummary from './pages/GameSummary';

type Page =
  | { type: 'home' }
  | { type: 'team' }
  | { type: 'game'; gameId: string }
  | { type: 'summary'; gameId: string };

export default function App() {
  const [page, setPage] = useState<Page>({ type: 'home' });

  switch (page.type) {
    case 'home':
      return (
        <Home
          onNavigateTeam={() => setPage({ type: 'team' })}
          onNavigateGame={(gameId) => setPage({ type: 'game', gameId })}
          onNavigateSummary={(gameId) => setPage({ type: 'summary', gameId })}
        />
      );
    case 'team':
      return (
        <TeamManager onBack={() => setPage({ type: 'home' })} />
      );
    case 'game':
      return (
        <GameRecorder
          gameId={page.gameId}
          onBack={() => setPage({ type: 'home' })}
          onFinish={(gameId) => setPage({ type: 'summary', gameId })}
        />
      );
    case 'summary':
      return (
        <GameSummary
          gameId={page.gameId}
          onBack={() => setPage({ type: 'home' })}
        />
      );
  }
}
