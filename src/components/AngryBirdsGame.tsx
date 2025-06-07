
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'bird' | 'block' | 'pig';
  color: string;
  destroyed: boolean;
  isLaunched?: boolean;
}

const AngryBirdsGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'aiming' | 'flying' | 'gameOver'>('ready');
  const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);
  const [launchPower, setLaunchPower] = useState(0);
  const [launchAngle, setLaunchAngle] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GRAVITY = 0.5;
  const FRICTION = 0.98;
  const SLINGSHOT_X = 100;
  const SLINGSHOT_Y = 300;

  // Initialize game objects
  const initializeGame = useCallback(() => {
    const objects: GameObject[] = [];
    
    // Add bird at slingshot
    objects.push({
      id: 'bird',
      x: SLINGSHOT_X,
      y: SLINGSHOT_Y,
      width: 20,
      height: 20,
      vx: 0,
      vy: 0,
      type: 'bird',
      color: '#ff4444',
      destroyed: false,
      isLaunched: false
    });

    // Add target structure
    const structureX = 600;
    const groundY = 350;
    
    // Ground blocks
    for (let i = 0; i < 4; i++) {
      objects.push({
        id: `ground-${i}`,
        x: structureX + i * 30,
        y: groundY,
        width: 25,
        height: 40,
        vx: 0,
        vy: 0,
        type: 'block',
        color: '#8B4513',
        destroyed: false
      });
    }

    // Top blocks
    for (let i = 0; i < 3; i++) {
      objects.push({
        id: `top-${i}`,
        x: structureX + 10 + i * 30,
        y: groundY - 40,
        width: 25,
        height: 40,
        vx: 0,
        vy: 0,
        type: 'block',
        color: '#8B4513',
        destroyed: false
      });
    }

    // Pigs
    objects.push({
      id: 'pig1',
      x: structureX + 50,
      y: groundY - 60,
      width: 25,
      height: 25,
      vx: 0,
      vy: 0,
      type: 'pig',
      color: '#90EE90',
      destroyed: false
    });

    objects.push({
      id: 'pig2',
      x: structureX + 20,
      y: groundY - 20,
      width: 25,
      height: 25,
      vx: 0,
      vy: 0,
      type: 'pig',
      color: '#90EE90',
      destroyed: false
    });

    setGameObjects(objects);
    setScore(0);
    setGameState('ready');
    setTrajectory([]);
  }, []);

  // Physics update
  const updatePhysics = useCallback(() => {
    setGameObjects(prev => {
      const updated = prev.map(obj => {
        if (obj.destroyed) return obj;

        const newObj = { ...obj };

        // Apply gravity to all objects except non-launched birds
        if (obj.type !== 'bird' || obj.isLaunched) {
          newObj.vy += GRAVITY;
        }

        // Update position
        newObj.x += newObj.vx;
        newObj.y += newObj.vy;

        // Apply friction
        newObj.vx *= FRICTION;
        newObj.vy *= FRICTION;

        // Ground collision
        if (newObj.y + newObj.height > CANVAS_HEIGHT - 20) {
          newObj.y = CANVAS_HEIGHT - 20 - newObj.height;
          newObj.vy = -newObj.vy * 0.3; // Bounce with energy loss
          newObj.vx *= 0.8; // Friction on ground
        }

        // Side walls
        if (newObj.x < 0) {
          newObj.x = 0;
          newObj.vx = -newObj.vx * 0.5;
        }
        if (newObj.x + newObj.width > CANVAS_WIDTH) {
          newObj.x = CANVAS_WIDTH - newObj.width;
          newObj.vx = -newObj.vx * 0.5;
        }

        return newObj;
      });

      // Check collisions
      const withCollisions = updated.map(obj => {
        if (obj.destroyed) return obj;

        const newObj = { ...obj };

        updated.forEach(other => {
          if (other.id === obj.id || other.destroyed) return;

          // Simple AABB collision detection
          if (
            obj.x < other.x + other.width &&
            obj.x + obj.width > other.x &&
            obj.y < other.y + other.height &&
            obj.y + obj.height > other.y
          ) {
            // Calculate collision response
            const dx = (obj.x + obj.width / 2) - (other.x + other.width / 2);
            const dy = (obj.y + obj.height / 2) - (other.y + other.height / 2);
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              const normalX = dx / distance;
              const normalY = dy / distance;

              // Separate objects
              const overlap = (obj.width + other.width) / 2 - Math.abs(dx);
              if (overlap > 0) {
                newObj.x += normalX * overlap * 0.5;
                newObj.y += normalY * overlap * 0.5;
              }

              // Apply collision forces
              const relativeVelocity = (obj.vx - other.vx) * normalX + (obj.vy - other.vy) * normalY;
              if (relativeVelocity > 0) {
                const impulse = relativeVelocity * 0.5;
                newObj.vx -= impulse * normalX;
                newObj.vy -= impulse * normalY;
              }

              // Destroy objects on high-speed collisions
              const speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
              if (speed > 5) {
                if (other.type === 'pig' || other.type === 'block') {
                  other.destroyed = true;
                  setScore(s => s + (other.type === 'pig' ? 100 : 50));
                }
              }
            }
          }
        });

        return newObj;
      });

      return withCollisions;
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'flying') {
      const gameLoop = () => {
        updatePhysics();
        
        // Check if bird has stopped moving
        const bird = gameObjects.find(obj => obj.type === 'bird');
        if (bird && bird.isLaunched) {
          const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
          if (speed < 0.5 && bird.y + bird.height >= CANVAS_HEIGHT - 20) {
            setTimeout(() => {
              const pigs = gameObjects.filter(obj => obj.type === 'pig' && !obj.destroyed);
              if (pigs.length === 0) {
                setGameState('gameOver');
              } else {
                setGameState('ready');
                initializeGame();
              }
            }, 1000);
          }
        }

        animationRef.current = requestAnimationFrame(gameLoop);
      };
      
      animationRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, gameObjects, updatePhysics, initializeGame]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Draw slingshot
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_X - 10, SLINGSHOT_Y + 20);
    ctx.lineTo(SLINGSHOT_X - 10, SLINGSHOT_Y - 40);
    ctx.moveTo(SLINGSHOT_X + 10, SLINGSHOT_Y + 20);
    ctx.lineTo(SLINGSHOT_X + 10, SLINGSHOT_Y - 40);
    ctx.stroke();

    // Draw trajectory
    if (trajectory.length > 0 && gameState === 'aiming') {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      trajectory.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw game objects
    gameObjects.forEach(obj => {
      if (obj.destroyed) return;

      ctx.fillStyle = obj.color;
      
      if (obj.type === 'bird') {
        // Draw bird as circle
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add angry face
        ctx.fillStyle = '#000';
        ctx.fillRect(obj.x + 5, obj.y + 5, 3, 3);
        ctx.fillRect(obj.x + 12, obj.y + 5, 3, 3);
        ctx.fillRect(obj.x + 7, obj.y + 12, 6, 2);
      } else if (obj.type === 'pig') {
        // Draw pig as circle
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add pig face
        ctx.fillStyle = '#000';
        ctx.fillRect(obj.x + 8, obj.y + 8, 2, 2);
        ctx.fillRect(obj.x + 15, obj.y + 8, 2, 2);
        ctx.fillRect(obj.x + 10, obj.y + 15, 5, 2);
      } else {
        // Draw blocks as rectangles
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Add wood texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + obj.height / 3);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height / 3);
        ctx.moveTo(obj.x, obj.y + 2 * obj.height / 3);
        ctx.lineTo(obj.x + obj.width, obj.y + 2 * obj.height / 3);
        ctx.stroke();
      }
    });
  }, [gameObjects, trajectory, gameState]);

  // Handle mouse/touch events
  const handleStart = (clientX: number, clientY: number) => {
    if (gameState !== 'ready') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const bird = gameObjects.find(obj => obj.type === 'bird');
    if (bird) {
      const distance = Math.sqrt((x - bird.x) ** 2 + (y - bird.y) ** 2);
      if (distance < 50) {
        setIsAiming(true);
        setAimStart({ x, y });
        setGameState('aiming');
      }
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isAiming || gameState !== 'aiming') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const dx = aimStart.x - x;
    const dy = aimStart.y - y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy), 100) / 100;
    const angle = Math.atan2(dy, dx);

    setLaunchPower(power);
    setLaunchAngle(angle);

    // Calculate trajectory
    const trajectoryPoints = [];
    const vx0 = Math.cos(angle) * power * 15;
    const vy0 = Math.sin(angle) * power * 15;
    
    for (let t = 0; t < 60; t += 2) {
      const px = SLINGSHOT_X + vx0 * t;
      const py = SLINGSHOT_Y + vy0 * t + 0.5 * GRAVITY * t * t;
      
      if (py > CANVAS_HEIGHT) break;
      trajectoryPoints.push({ x: px, y: py });
    }
    
    setTrajectory(trajectoryPoints);
  };

  const handleEnd = () => {
    if (!isAiming || gameState !== 'aiming') return;

    setIsAiming(false);
    setTrajectory([]);

    // Launch bird
    setGameObjects(prev => prev.map(obj => {
      if (obj.type === 'bird') {
        return {
          ...obj,
          vx: Math.cos(launchAngle) * launchPower * 15,
          vy: Math.sin(launchAngle) * launchPower * 15,
          isLaunched: true
        };
      }
      return obj;
    }));

    setGameState('flying');
  };

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Draw game every frame
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gradient-to-b from-blue-200 to-green-200 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Angry Birds</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Score: {score}</div>
            <Button
              onClick={initializeGame}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-300 rounded-lg cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <div className="mt-4 text-center">
          {gameState === 'ready' && (
            <p className="text-gray-600">Click and drag the bird to aim and launch!</p>
          )}
          {gameState === 'aiming' && (
            <p className="text-blue-600">Release to launch the bird!</p>
          )}
          {gameState === 'flying' && (
            <p className="text-green-600">Bird is flying! Destroy all the pigs!</p>
          )}
          {gameState === 'gameOver' && (
            <div className="text-center">
              <p className="text-green-600 text-xl font-bold">Congratulations! You won!</p>
              <p className="text-gray-600">Final Score: {score}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AngryBirdsGame;
