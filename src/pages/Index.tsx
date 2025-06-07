
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import Calculator from '../components/Calculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Pink Pop Calculator & Games</h1>
          <p className="text-gray-600 mb-6">Choose between our stylish calculator or play Angry Birds!</p>
          <div className="flex gap-4 justify-center mb-8">
            <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
              <Link to="/game">🐦 Play Angry Birds</Link>
            </Button>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <Calculator />
        </div>
      </div>
    </div>
  );
};

export default Index;
