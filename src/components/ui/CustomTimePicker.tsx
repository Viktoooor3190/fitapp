import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomTimePickerProps {
  selectedTime: string;
  onChange: (time: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const CustomTimePicker = ({ 
  selectedTime, 
  onChange, 
  isOpen, 
  onClose, 
  triggerRef
}: CustomTimePickerProps) => {
  const [timeInput, setTimeInput] = useState('');
  const [commonTimes, setCommonTimes] = useState<string[]>(['09:00', '12:00', '15:00', '18:00']);
  
  // Initialize time input when component mounts or selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      setTimeInput(selectedTime);
    }
  }, [selectedTime]);
  
  // Handle click outside to close time picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        triggerRef?.current && 
        !triggerRef.current.contains(event.target as Node) &&
        !document.getElementById('custom-time-picker')?.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);
  
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
  };
  
  const handleSelectTime = (time: string) => {
    onChange(time);
    onClose();
  };
  
  const handleSubmitTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeInput) {
      onChange(timeInput);
      onClose();
    }
  };
  
  // Format time for display (convert from 24h to 12h format)
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="custom-time-picker"
          className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4 w-[240px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Time Input */}
          <form onSubmit={handleSubmitTime}>
            <div className="relative mb-3">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                value={timeInput}
                onChange={handleTimeInputChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          
          {/* Common Times */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="text-xs text-gray-500 mb-2">Common Times</h4>
            <div className="grid grid-cols-2 gap-2">
              {commonTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => handleSelectTime(time)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
                >
                  {formatTimeForDisplay(time)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomTimePicker;

// Add custom scrollbar styles to your global CSS
// .custom-scrollbar::-webkit-scrollbar {
//   width: 6px;
// }
// .custom-scrollbar::-webkit-scrollbar-track {
//   background: #2d3748;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb {
//   background-color: #4a5568;
//   border-radius: 3px;
// } 