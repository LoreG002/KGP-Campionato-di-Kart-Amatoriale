import React, { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { StandingsPage } from './pages/StandingsPage';
import { RacesPage } from './pages/RacesPage';
import { DriversPage } from './pages/DriversPage';
import { AdminPage } from './pages/AdminPage';
import { isFirebaseConfigured } from './firebase/firebase';
import { AlertTriangle } from 'lucide-react';

// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <div className="max-w-lg w-full racing-card rounded-2xl p-8 text-center border-red-500/40">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="font-rajdhani font-bold text-2xl text-white mb-2">Errore Critico</h1>
            <p className="text-zinc-400 font-rajdhani text-sm mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Firebase not configured banner ───────────────────────────
function FirebaseBanner() {
  if (isFirebaseConfigured) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-900/90 backdrop-blur-sm border-t border-amber-600/50 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-rajdhani font-bold text-amber-300 text-sm">Firebase non configurato</p>
          <p className="font-rajdhani text-amber-400/80 text-xs mt-0.5">
            Copia <code className="bg-zinc-900/60 px-1 rounded">.env.example</code> in{' '}
            <code className="bg-zinc-900/60 px-1 rounded">.env.local</code>, inserisci le credenziali Firebase
            e riavvia il dev server con <code className="bg-zinc-900/60 px-1 rounded">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared layout ─────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-zinc-800 py-6 px-4 text-center">
        <p className="font-rajdhani text-zinc-600 text-sm tracking-widest uppercase">
          K<span className="text-lime-400">-GP</span> — Campionato Amatoriale{' '}
          {new Date().getFullYear()}
        </p>
      </footer>
      <FirebaseBanner />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Admin uses its own full-page layout */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Public pages with shared layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/classifica" element={<StandingsPage />} />
                    <Route path="/gare" element={<RacesPage />} />
                    <Route path="/piloti" element={<DriversPage />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
