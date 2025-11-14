import { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import { Users } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8 flex items-center space-x-3">
        <Users className="w-10 h-10 text-white" />
        <span className="text-3xl font-bold text-white">TheClubs</span>
      </div>

      {isLogin ? <Login onToggle={() => setIsLogin(false)} /> : <Signup onToggle={() => setIsLogin(true)} />}
    </div>
  );
}
