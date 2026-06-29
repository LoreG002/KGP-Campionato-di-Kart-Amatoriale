import { useAuth } from '../contexts/AuthContext';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
