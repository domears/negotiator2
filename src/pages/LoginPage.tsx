interface LoginPageProps {
  navigate: (path: string) => void;
}

export default function LoginPage({ navigate }: LoginPageProps) {
  const handleLogin = () => {
    navigate('/welcome');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
