import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Dynamic title formatter
  const formatTitle = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1) + ' Dashboard';
  };



  const roleCards = useMemo(() => {

    // Path mapping for each role
    const rolePaths: Record<string, string> = {
      inward: '/inward_dashboard',
      programer: '/programer_dashboard',
      qa: '/qa_dashboard',
      accounts: '/accounts_dashboard',
      admin: '/admin_dashboard',
    };

    // Color mapping
    const roleColors: Record<string, string> = {
      inward: 'bg-blue-50 hover:bg-blue-100',
      programer: 'bg-green-50 hover:bg-green-100',
      qa: 'bg-yellow-50 hover:bg-yellow-100',
      accounts: 'bg-purple-50 hover:bg-purple-100',
      admin: 'bg-red-50 hover:bg-red-100',
    };
    if (isLoading || !user) return [];

    // Admin → show all roles
    const rolesToShow = user.isAdmin ? Object.keys(rolePaths) : user.roles;

    return rolesToShow.map((role) => ({
      role,
      title: formatTitle(role),
      path: rolePaths[role],
      color: roleColors[role],
    }));
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='text-center py-6'>
            <CardTitle>User not authenticated</CardTitle>
            <p>Please log in again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-12'>
      <h1 className='text-2xl font-bold mb-6'>Welcome, {user.username}</h1>

      {/* Empty roles message */}
      {roleCards.length === 0 ? (
        <Card className="max-w-md mx-auto border shadow-sm p-6 text-center">
          <CardTitle className="mb-2">No Roles Assigned</CardTitle>
          <p className="text-gray-600">You do not have any roles assigned yet.</p>
        </Card>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {roleCards.map((card) => (
            <Card
              key={card.role}
              className={`cursor-pointer border shadow-sm transition-all ${card.color}`}
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600'>
                  Go to your {card.role} dashboard.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

};

export default Dashboard;
