// src/app/leave/page.tsx
'use client';

import { useState } from 'react';

interface LeaveFormData {
  reason: string;
  duration: 'half-day' | 'full-day';
  startDate: string;
  endDate: string;
  leaveType: string;
}

export default function LeaveApplicationPage() {
  const [formData, setFormData] = useState<LeaveFormData>({
    reason: '',
    duration: 'full-day',
    startDate: '',
    endDate: '',
    leaveType: 'vacation'
  });
  
  const [errors, setErrors] = useState<Partial<LeaveFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LeaveFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaveFormData> = {};
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.duration === 'full-day' && !formData.endDate) {
      newErrors.endDate = 'End date is required for full-day leave';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Leave application submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          reason: '',
          duration: 'full-day',
          startDate: '',
          endDate: '',
          leaveType: 'vacation'
        });
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Application</h1>
            <p className="text-gray-600">Submit your leave request for approval</p>
          </div>
          
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Application Submitted!</h3>
              <p className="text-gray-600">Your leave request has been sent for approval.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['vacation', 'sick', 'personal', 'other'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        id={`leave-type-${type}`}
                        name="leaveType"
                        type="radio"
                        value={type}
                        checked={formData.leaveType === type}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`leave-type-${type}`} className="ml-2 block text-sm text-gray-700 capitalize">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="half-day"
                      name="duration"
                      type="radio"
                      value="half-day"
                      checked={formData.duration === 'half-day'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="half-day" className="ml-2 block text-sm text-gray-700">
                      Half Day
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="full-day"
                      name="duration"
                      type="radio"
                      value="full-day"
                      checked={formData.duration === 'full-day'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="full-day" className="ml-2 block text-sm text-gray-700">
                      Full Day
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={today}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>
                
                {formData.duration === 'full-day' && (
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date {formData.duration === 'full-day' ? '*' : ''}
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || today}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                )}
              </div>
              
              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a reason for your leave..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
              </div>
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Leave Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            By submitting this form, you agree to your organization's leave policies. 
            All leave requests are subject to approval by your manager.
          </p>
        </div>
      </div>
    </div>
  );
}