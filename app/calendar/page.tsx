'use client';

import { useState, useEffect } from 'react';
import CalendarComponent from '../../components/CalendarComponent';
import EventForm from '../../components/EventForm';
import { CalendarEvent } from '@prisma/client';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('ไม่สามารถโหลดข้อมูลปฏิทินได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle event creation
  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      alert('เพิ่มงาน/เวรสำเร็จแล้ว');
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      alert('ไม่สามารถเพิ่มงาน/เวรได้');
      return false;
    }
  };

  // Handle event update
  const handleUpdateEvent = async (id: string, eventData: any) => {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(e => (e.id === id ? updatedEvent : e)));
      setSelectedEvent(null);
      alert('อัปเดตงาน/เวรสำเร็จแล้ว');
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      alert('ไม่สามารถอัปเดตงาน/เวรได้');
      return false;
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบงาน/เวรนี้หรือไม่?')) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
      alert('ลบงาน/เวรสำเร็จแล้ว');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('ไม่สามารถลบงาน/เวรได้');
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Handle event drop/resize (update dates)
  const handleEventDrop = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    await handleUpdateEvent(event.id, {
      ...event,
      startDate: newStart,
      endDate: newEnd,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดปฏิทิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 ปฏิทินตารางงานและเวร</h1>
          <p className="text-gray-600 mt-2">
            จัดการตารางงาน, เวรนอกเวลา, และงานประจำของโรงพยาบาล
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setSelectedEvent({} as CalendarEvent)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มงาน/เวรใหม่
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CalendarComponent
            events={events}
            view={view}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onViewChange={setView}
            onDateChange={setCurrentDate}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedEvent ? 'แก้ไขงาน/เวร' : 'เพิ่มงาน/เวรใหม่'}
            </h2>
            <EventForm
              event={selectedEvent}
              onSubmit={selectedEvent?.id ? 
                (data) => handleUpdateEvent(selectedEvent.id, data) : 
                handleCreateEvent}
              onCancel={() => setSelectedEvent(null)}
              onDelete={selectedEvent?.id ? 
                () => handleDeleteEvent(selectedEvent.id) : 
                undefined}
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">คำอธิบายสี</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-blue-500 mr-3"></div>
                <span className="text-gray-700">เวร (shift)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-500 mr-3"></div>
                <span className="text-gray-700">งานประจำ (task)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-500 mr-3"></div>
                <span className="text-gray-700">งานอื่น (work)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-purple-500 mr-3"></div>
                <span className="text-gray-700">ประชุม (meeting)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-500 mr-3"></div>
                <span className="text-gray-700">วันหยุด (holiday)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}