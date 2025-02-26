import { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Video, User, Info, ChevronDown } from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../hooks/useSessionData';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import CustomCalendar from '../ui/CustomCalendar';
import CustomTimePicker from '../ui/CustomTimePicker';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  session?: Session; // For editing existing sessions
  isClient?: boolean; // If true, this is a client requesting a session
}

const SessionModal = ({ isOpen, onClose, onSave, session, isClient = false }: SessionModalProps) => {
  const { user } = useAuth();
  const { clients } = useClientData();
  const [coachName, setCoachName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Refs for custom dropdowns
  const dateInputRef = useRef<HTMLDivElement>(null);
  const timeInputRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for custom dropdowns
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    coachId: '',
    coachName: '',
    title: '',
    type: 'in-person' as 'in-person' | 'virtual',
    date: '',
    time: '',
    duration: 60,
    status: 'scheduled' as 'requested' | 'scheduled',
    notes: '',
    location: '',
    meetingLink: '',
    createdBy: (isClient ? 'client' : 'coach') as 'coach' | 'client'
  });

  // Initialize form data when editing an existing session
  useEffect(() => {
    if (session) {
      setFormData({
        clientId: session.clientId,
        clientName: session.clientName,
        coachId: session.coachId,
        coachName: session.coachName || '',
        title: session.title,
        type: session.type,
        date: session.date.toISOString().split('T')[0],
        time: session.time,
        duration: session.duration,
        status: session.status === 'completed' || session.status === 'cancelled' 
          ? 'scheduled' 
          : session.status,
        notes: session.notes || '',
        location: session.location || '',
        meetingLink: session.meetingLink || '',
        createdBy: session.createdBy
      });
    } else {
      // Set default values for new session
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      setFormData({
        clientId: '',
        clientName: '',
        coachId: user?.uid || '',
        coachName: user?.displayName || '',
        title: 'Training Session',
        type: 'in-person',
        date: formattedDate,
        time: '09:00',
        duration: 60,
        status: isClient ? 'requested' : 'scheduled',
        notes: '',
        location: '',
        meetingLink: '',
        createdBy: isClient ? 'client' : 'coach'
      });
    }
  }, [session, user, isClient]);

  // Fetch coach name if client is creating session
  useEffect(() => {
    if (isClient && formData.coachId && !formData.coachName) {
      const fetchCoachName = async () => {
        try {
          const coachDoc = await getDoc(doc(db, 'coaches', formData.coachId));
          if (coachDoc.exists()) {
            const coachData = coachDoc.data();
            setCoachName(coachData.name || 'Your Coach');
            setFormData(prev => ({ ...prev, coachName: coachData.name || 'Your Coach' }));
          }
        } catch (err) {
          console.error('Error fetching coach name:', err);
        }
      };
      
      fetchCoachName();
    }
  }, [formData.coachId, isClient, formData.coachName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // If client is selected, update clientName
      if (name === 'clientId' && !isClient) {
        const selectedClient = clients.find(client => client.id === value);
        if (selectedClient) {
          updatedData.clientName = selectedClient.name;
        }
      }
      
      return updatedData;
    });
  };
  
  // Handle date change from custom calendar
  const handleDateChange = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
    setIsCalendarOpen(false);
  };
  
  // Handle time change from custom time picker
  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    setIsTimePickerOpen(false);
  };

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient.name
      }));
    }
    setIsClientDropdownOpen(false);
  };
  
  // Handle session type selection
  const handleTypeSelect = (type: 'in-person' | 'virtual') => {
    setFormData(prev => ({ ...prev, type }));
    setIsTypeDropdownOpen(false);
  };
  
  // Handle duration selection
  const handleDurationSelect = (duration: number) => {
    setFormData(prev => ({ ...prev, duration }));
    setIsDurationDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.clientId && !isClient) {
        throw new Error('Please select a client');
      }
      
      if (!formData.date || !formData.time) {
        throw new Error('Date and time are required');
      }
      
      if (formData.type === 'in-person' && !formData.location) {
        throw new Error('Location is required for in-person sessions');
      }
      
      if (formData.type === 'virtual' && !formData.meetingLink) {
        throw new Error('Meeting link is required for virtual sessions');
      }
      
      // Prepare session data
      const sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        date: new Date(formData.date),
        clientId: isClient ? user?.uid || '' : formData.clientId,
        clientName: isClient ? user?.displayName || '' : formData.clientName,
      };
      
      await onSave(sessionData);
      setSuccess('Session saved successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving session:', err);
      setError(err.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {session ? 'Edit Session' : isClient ? 'Request Session' : 'Schedule New Session'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection (for coach) with Custom Dropdown */}
            {!isClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client
                </label>
                <div className="relative" ref={clientDropdownRef}>
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  >
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      readOnly
                      value={formData.clientName || 'Select a client'}
                      className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    />
                  </div>
                  
                  {isClientDropdownOpen && (
                    <div className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-2 w-full max-h-[240px] overflow-y-auto custom-scrollbar">
                      {clients.length > 0 ? (
                        <div className="space-y-1">
                          {clients.map(client => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleClientSelect(client.id)}
                              className={`
                                w-full px-4 py-2 rounded-lg text-left transition-colors
                                ${formData.clientId === client.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'hover:bg-gray-700 text-gray-200'
                                }
                              `}
                            >
                              {client.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          No clients available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Coach Display (for client) */}
            {isClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coach
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={coachName || 'Your Coach'}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                    disabled
                  />
                </div>
              </div>
            )}
            
            {/* Session Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="px-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            {/* Session Type with Custom Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Type
              </label>
              <div className="relative" ref={typeDropdownRef}>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  {formData.type === 'in-person' ? (
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  ) : (
                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value={formData.type === 'in-person' ? 'In-Person' : 'Virtual'}
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                  />
                </div>
                
                {isTypeDropdownOpen && (
                  <div className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('in-person')}
                      className={`
                        w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center
                        ${formData.type === 'in-person' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-200'
                        }
                      `}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      In-Person
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('virtual')}
                      className={`
                        w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center
                        ${formData.type === 'virtual' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-200'
                        }
                      `}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Virtual
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Date with Custom Calendar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative" ref={dateInputRef}>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="date"
                    value={formData.date ? new Date(formData.date).toLocaleDateString() : ''}
                    readOnly
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    required
                  />
                </div>
                
                <CustomCalendar
                  selectedDate={formData.date ? new Date(formData.date) : new Date()}
                  onChange={handleDateChange}
                  isOpen={isCalendarOpen}
                  onClose={() => setIsCalendarOpen(false)}
                  triggerRef={dateInputRef}
                />
              </div>
            </div>
            
            {/* Time with Custom Time Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <div className="relative" ref={timeInputRef}>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setIsTimePickerOpen(true)}
                >
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="time"
                    value={formData.time ? formData.time : ''}
                    readOnly
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    required
                  />
                </div>
                
                <CustomTimePicker
                  selectedTime={formData.time}
                  onChange={handleTimeChange}
                  isOpen={isTimePickerOpen}
                  onClose={() => setIsTimePickerOpen(false)}
                  triggerRef={timeInputRef}
                />
              </div>
            </div>
            
            {/* Duration with Custom Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="relative" ref={durationDropdownRef}>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setIsDurationDropdownOpen(!isDurationDropdownOpen)}
                >
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value={`${formData.duration} minutes`}
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                  />
                </div>
                
                {isDurationDropdownOpen && (
                  <div className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-2 w-full">
                    {[30, 45, 60, 90, 120].map(duration => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => handleDurationSelect(duration)}
                        className={`
                          w-full px-4 py-2 rounded-lg text-left transition-colors
                          ${formData.duration === duration 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-700 text-gray-200'
                          }
                        `}
                      >
                        {duration} minutes
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Location (for in-person) */}
            {formData.type === 'in-person' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Main Gym, Studio 3"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.type === 'in-person'}
                  />
                </div>
              </div>
            )}
            
            {/* Meeting Link (for virtual) */}
            {formData.type === 'virtual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    placeholder="e.g. https://zoom.us/j/123456789"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.type === 'virtual'}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="px-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Any additional information about this session..."
            />
          </div>
          
          {/* Client Request Notice */}
          {isClient && (
            <div className="mt-6 flex items-start space-x-2 p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Your session request will be sent to your coach for approval. 
                You'll be notified once it's confirmed.
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg mr-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : session ? 'Update Session' : isClient ? 'Request Session' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal; 