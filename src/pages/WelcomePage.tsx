interface WelcomePageProps {
  navigate: (path: string) => void;
}

export default function WelcomePage({ navigate }: WelcomePageProps) {
  const handleProceed = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
          <p className="mt-2 text-gray-600">You have successfully logged in.</p>
        </div>
        <button
          type="button"
          onClick={handleProceed}
          className="w-full px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
