import { Compass } from 'lucide-react';

const NorthArrow = () => {
  return (
    <div className="absolute top-8 left-8 bg-white p-2 rounded-full shadow-md z-[1000]">
      <Compass size={24} className="text-primary-600" />
    </div>
  );
}

export default NorthArrow;