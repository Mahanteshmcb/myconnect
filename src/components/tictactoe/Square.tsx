import React from 'react';
import { Button } from '@/components/ui/button';

interface SquareProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <Button
      variant="outline"
      className="w-24 h-24 text-4xl font-bold"
      onClick={onClick}
    >
      {value}
    </Button>
  );
};

export default Square;