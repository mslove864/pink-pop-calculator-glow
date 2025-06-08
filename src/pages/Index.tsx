
import Calculator from '../components/Calculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Pink Pop Calculator</h1>
          <p className="text-gray-600 mb-6">A stylish scientific calculator for all your math needs!</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Calculator />
        </div>
      </div>
    </div>
  );
};

export default Index;
