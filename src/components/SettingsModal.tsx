import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Lock, MapPin, Clock, Save, User, Mail, Phone, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  profilePhoto: string;
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'MX', name: 'Mexico' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (UTC+10)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>({
    profilePhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phoneNumber: '+1 (555) 123-4567',
    city: 'New York',
    state: 'NY',
    country: 'US',
    timezone: 'America/New_York',
  });

  const [isLoading, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect timezone on modal open
  useEffect(() => {
    if (isOpen) {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const matchingTimezone = timezones.find(tz => tz.value === detectedTimezone);
      if (matchingTimezone) {
        setSettings(prev => ({ ...prev, timezone: detectedTimezone }));
      }
    }
  }, [isOpen]);

  // Handle ESC key and backdrop click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleBackdropClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+\d{1,3}\s?\(\d{3}\)\s?\d{3}-\d{4}$/.test(settings.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number format: +1 (555) 123-4567';
    }

    if (!settings.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!settings.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings(prev => ({ ...prev, profilePhoto: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Format as +1 (555) 123-4567
    if (cleaned.startsWith('+1') && cleaned.length >= 11) {
      const digits = cleaned.slice(2);
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close settings"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Profile Photo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-600" />
                <span>Profile Photo</span>
              </h3>
              
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <img
                    src={settings.profilePhoto}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary-600" />
                <span>Account Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.name}
                      readOnly
                      className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 pr-10 focus:border-gray-300 focus:ring-0"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={settings.email}
                      readOnly
                      className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 pr-10 focus:border-gray-300 focus:ring-0"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span>Contact & Location</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={settings.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setSettings(prev => ({ ...prev, phoneNumber: formatted }));
                        if (errors.phoneNumber) {
                          setErrors(prev => ({ ...prev, phoneNumber: '' }));
                        }
                      }}
                      placeholder="+1 (555) 123-4567"
                      className={`block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, city: e.target.value }));
                        if (errors.city) {
                          setErrors(prev => ({ ...prev, city: '' }));
                        }
                      }}
                      placeholder="Enter city"
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={settings.state}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, state: e.target.value }));
                        if (errors.state) {
                          setErrors(prev => ({ ...prev, state: '' }));
                        }
                      }}
                      placeholder="Enter state"
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        value={settings.country}
                        onChange={(e) => setSettings(prev => ({ ...prev, country: e.target.value }))}
                        className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <span>Timezone</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  {timezones.map((timezone) => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Current time: {new Date().toLocaleTimeString('en-US', { 
                    timeZone: settings.timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`rounded-md p-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};