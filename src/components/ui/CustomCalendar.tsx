import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const CustomCalendar = ({ selectedDate, onChange, isOpen, onClose, triggerRef }: CustomCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month to start on Sunday
    const startDay = start.getDay();
    const prevMonthDays = startDay > 0 
      ? eachDayOfInterval({ 
          start: new Date(start.getFullYear(), start.getMonth(), -startDay + 1), 
          end: new Date(start.getFullYear(), start.getMonth(), 0) 
        }) 
      : [];
    
    // Add days from next month to end on Saturday
    const endDay = end.getDay();
    const nextMonthDays = endDay < 6 
      ? eachDayOfInterval({ 
          start: new Date(end.getFullYear(), end.getMonth() + 1, 1), 
          end: new Date(end.getFullYear(), end.getMonth() + 1, 6 - endDay) 
        }) 
      : [];
    
    setCalendarDays([...prevMonthDays, ...days, ...nextMonthDays]);
  }, [currentMonth]);
  
  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        triggerRef?.current && 
        !triggerRef.current.contains(event.target as Node) &&
        !document.getElementById('custom-calendar')?.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleSelectDate = (date: Date) => {
    onChange(date);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="custom-calendar"
          className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4 w-[320px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            
            <h3 className="text-white font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectDate(day)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white' 
                      : isTodayDate 
                        ? 'bg-gray-700 text-blue-400' 
                        : 'hover:bg-gray-700'
                    }
                    ${!isCurrentMonth && 'text-gray-600'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          
          {/* Today Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => handleSelectDate(new Date())}
              className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Today
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomCalendar; 