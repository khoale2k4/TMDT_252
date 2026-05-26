'use client';

import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useAdminSSE } from '@/hooks/useAdminSSE';

const timeSlots = Array.from({length: 17}, (_, i) => `${(i+6).toString().padStart(2, '0')}:00`);
const courts = [
  { id: 'c1', name: 'Sân 1' },
  { id: 'c2', name: 'Sân 2' },
  { id: 'c3', name: 'Sân 3' },
  { id: 'c4', name: 'Sân 4' },
];

const mockBookings = [
  { id: 'b1', courtId: 'c1', time: '08:00', status: 'booked', customer: 'Nguyen Van A' },
  { id: 'b2', courtId: 'c2', time: '10:00', status: 'pending', customer: 'Tran Thi B' },
  { id: 'b3', courtId: 'c3', time: '17:00', status: 'booked', customer: 'Le Khoa' },
  { id: 'b4', courtId: 'c1', time: '18:00', status: 'locked', customer: 'System AI' },
];

function DraggableBooking({ booking }: { booking: any }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: booking.id,
    data: booking,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  let bg = 'bg-blue-500';
  if (booking.status === 'pending') bg = 'bg-yellow-500';
  if (booking.status === 'locked') bg = 'bg-slate-700';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className={`${bg} text-white text-xs p-2 rounded cursor-grab active:cursor-grabbing absolute inset-1 z-10 shadow-sm flex flex-col justify-center`}
    >
      <span className="font-semibold">{booking.customer}</span>
      <span className="opacity-75 text-[10px] uppercase">{booking.status}</span>
    </div>
  );
}

function DroppableSlot({ id, courtId, time, children }: { id: string, courtId: string, time: string, children: React.ReactNode }) {
  const {isOver, setNodeRef} = useDroppable({
    id: id,
    data: { courtId, time },
  });
  const bg = isOver ? 'bg-slate-100' : 'bg-white';

  return (
    <div ref={setNodeRef} className={`border-b border-slate-100 h-16 relative ${bg} transition-colors hover:bg-slate-50`}>
      {children}
    </div>
  );
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const venueId = typeof window !== 'undefined' ? localStorage.getItem('active_venue_id') || '123e4567-e89b-12d3-a456-426614174000' : null;
  const sseEvent = useAdminSSE(venueId);

  useEffect(() => {
    if (sseEvent) {
      if (sseEvent.type === 'NEW_BOOKING' || sseEvent.type === 'UPDATE_BOOKING') {
        const { bookingId, status, slot } = sseEvent.data;
        if (sseEvent.type === 'NEW_BOOKING' && slot) {
          setBookings(prev => {
             if (prev.find(b => b.id === bookingId)) return prev;
             const courtId = courts.find(c => c.name === slot.name)?.id || 'c1';
             return [...prev, {
                id: bookingId,
                courtId: courtId,
                time: slot.startTime.substring(0, 5),
                status: status === 'confirmed' ? 'booked' : 'pending',
                customer: 'Khách mới'
             }];
          });
        }
        
        if (sseEvent.type === 'UPDATE_BOOKING') {
           setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: status === 'cancelled' ? 'cancelled' : 'booked' } : b));
        }
      }
    }
  }, [sseEvent]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id) {
      const { courtId, time } = over.data.current;
      
      // Check if slot is already occupied
      const isOccupied = bookings.some(b => b.courtId === courtId && b.time === time && b.id !== active.id);
      if (!isOccupied) {
        setBookings(prev => prev.map(b => b.id === active.id ? { ...b, courtId, time } : b));
      }
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Lịch Đặt Sân</h1>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Đã đặt</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Chờ thanh toán</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-700"></div>Đang khóa</div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-slate-200 bg-slate-50">
            <div className="h-12 border-b border-slate-200 flex items-center justify-center font-semibold text-slate-500 text-sm">
              Giờ
            </div>
            {timeSlots.map(t => (
              <div key={t} className="h-16 border-b border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
                {t}
              </div>
            ))}
          </div>

          {/* Courts Columns */}
          <div className="flex-1 flex overflow-x-auto">
            {courts.map(court => (
              <div key={court.id} className="flex-1 min-w-[200px] border-r border-slate-200 last:border-r-0">
                <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-center font-semibold text-slate-700">
                  {court.name}
                </div>
                {timeSlots.map(time => {
                  const slotId = `${court.id}-${time}`;
                  const bookingInSlot = bookings.find(b => b.courtId === court.id && b.time === time);
                  return (
                    <DroppableSlot key={slotId} id={slotId} courtId={court.id} time={time}>
                      {bookingInSlot && <DraggableBooking booking={bookingInSlot} />}
                    </DroppableSlot>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
