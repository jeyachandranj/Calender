import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    addMonths, subMonths, format, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
    isSameDay, isBefore
} from 'date-fns';
import { Bell, Video, Cake } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MONTHS_DATA } from '../data/months';
import EventModal from './EventModal';
import CalendarHero from './CalendarHero';
import CalendarGrid from './CalendarGrid';
import CalendarSidebar from './CalendarSidebar';

const EVENT_TYPES = [
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'bg-amber-500' },
    { id: 'meet', label: 'Google Meet', icon: Video, color: 'bg-blue-600' },
    { id: 'birthday', label: 'Birthday Email', icon: Cake, color: 'bg-pink-500' },
];

export default function Calendar({ onExport }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState(() => {
        const saved = localStorage.getItem('calendar_startDate');
        return saved ? new Date(saved) : null;
    });
    const [endDate, setEndDate] = useState(() => {
        const saved = localStorage.getItem('calendar_endDate');
        return saved ? new Date(saved) : null;
    });
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('calendar_notes');
        return saved ? JSON.parse(saved) : {};
    });
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('calendar_events');
        return saved ? JSON.parse(saved) : {};
    });
    const [imageError, setImageError] = useState({});
    const [modalDate, setModalDate] = useState(null);

    useEffect(() => {
        if (startDate) localStorage.setItem('calendar_startDate', startDate.toISOString());
        else localStorage.removeItem('calendar_startDate');
    }, [startDate]);

    useEffect(() => {
        if (endDate) localStorage.setItem('calendar_endDate', endDate.toISOString());
        else localStorage.removeItem('calendar_endDate');
    }, [endDate]);

    useEffect(() => {
        localStorage.setItem('calendar_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }, [events]);

    const monthIndex = currentDate.getMonth();
    const themeData = MONTHS_DATA[monthIndex];
    const theme = themeData.colors;
    const currentMonthKey = format(currentDate, 'yyyy-MM');

    const handlePrevMonth = useCallback(() => setCurrentDate(subMonths(currentDate, 1)), [currentDate]);
    const handleNextMonth = useCallback(() => setCurrentDate(addMonths(currentDate, 1)), [currentDate]);

    const handleDateClick = useCallback((day) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (isBefore(day, startDate)) {
            setStartDate(day);
            setEndDate(null);
        } else {
            setEndDate(day);
        }
    }, [startDate, endDate]);

    const handleDateRightClick = useCallback((e, day) => {
        e.preventDefault();
        setModalDate(format(day, 'yyyy-MM-dd'));
    }, []);

    const activeNoteKey = useMemo(() => {
        if (startDate && !endDate) return format(startDate, 'yyyy-MM-dd');
        if (startDate && endDate && isSameDay(startDate, endDate)) return format(startDate, 'yyyy-MM-dd');
        return currentMonthKey;
    }, [startDate, endDate, currentMonthKey]);

    const isDayNote = activeNoteKey !== currentMonthKey;
    const noteTitle = isDayNote ? `Notes for ${format(startDate, 'MMM d')}` : 'Monthly Notes';

    const handleNoteChange = useCallback((e) => {
        setNotes(prev => ({ ...prev, [activeNoteKey]: e.target.value }));
    }, [activeNoteKey]);

    const handleSaveEvent = useCallback((eventData) => {
        const key = eventData.date;
        setEvents(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), eventData],
        }));
    }, []);

    const handleDeleteEvent = useCallback((dateKey, idx) => {
        setEvents(prev => {
            const updated = [...(prev[dateKey] || [])];
            updated.splice(idx, 1);
            if (updated.length === 0) {
                const copy = { ...prev };
                delete copy[dateKey];
                return copy;
            }
            return { ...prev, [dateKey]: updated };
        });
    }, []);

    const handleExport = useCallback(() => {
        const wb = XLSX.utils.book_new();

        const summaryData = [
            ['CALENDAR EXPORT SUMMARY'],
            ['Generated On', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
            ['Selected Range', `${startDate ? format(startDate, 'MMM d, yyyy') : 'N/A'} ${endDate ? `→ ${format(endDate, 'MMM d, yyyy')}` : ''}`],
            ['Total Notes', Object.keys(notes).filter(k => notes[k]?.trim()).length],
            ['Total Events', Object.values(events).flat().length],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        const notesData = [['Date', 'Note']];
        Object.entries(notes).forEach(([key, text]) => {
            if (text?.trim()) {
                notesData.push([key, text]);
            }
        });
        const wsNotes = XLSX.utils.aoa_to_sheet(notesData);
        XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes');

        const eventsData = [['Date', 'Type', 'Title/Name', 'Start Time', 'End Time', 'Email', 'Description']];
        Object.entries(events).forEach(([dateKey, evts]) => {
            const dateStr = format(new Date(dateKey), 'yyyy-MM-dd');
            evts.forEach(ev => {
                const typeLabel = EVENT_TYPES.find(t => t.id === ev.type)?.label || ev.type;
                eventsData.push([
                    dateStr,
                    typeLabel,
                    ev.title,
                    ev.startTime || '',
                    ev.endTime || '',
                    ev.email || '',
                    ev.desc || ''
                ]);
            });
        });
        const wsEvents = XLSX.utils.aoa_to_sheet(eventsData);
        XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');

        XLSX.writeFile(wb, `calendar-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }, [startDate, endDate, notes, events]);

    useEffect(() => {
        if (onExport) onExport(() => handleExport);
    }, [onExport, handleExport]);

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
    }, [currentDate]);

    const selectedDayEvents = modalDate ? (events[modalDate] || []) : [];

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
            <CalendarHero
                currentDate={currentDate}
                themeData={themeData}
                monthIndex={monthIndex}
                currentMonthKey={currentMonthKey}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                imageError={imageError}
                onImageError={(img) => setImageError(prev => ({ ...prev, [img]: true }))}
            />

            <div className="px-6 pt-4 pb-0 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    <span className="hidden sm:inline">Right-click</span>
                    <span className="sm:hidden">Long-press</span>
                    {' '}any date to add an event · Left-click to select a date range
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 p-5 sm:p-8 lg:p-12 relative z-20 bg-white">
                <CalendarSidebar
                    theme={theme}
                    noteTitle={noteTitle}
                    isDayNote={isDayNote}
                    notes={notes}
                    activeNoteKey={activeNoteKey}
                    onNoteChange={handleNoteChange}
                    selectedDayKey={modalDate}
                    selectedDayEvents={selectedDayEvents}
                    onModalDateChange={setModalDate}
                    onDeleteEvent={handleDeleteEvent}
                    startDate={startDate}
                    endDate={endDate}
                    onClearSelection={() => { setStartDate(null); setEndDate(null); }}
                    EVENT_TYPES={EVENT_TYPES}
                />

                <CalendarGrid
                    days={days}
                    startDate={startDate}
                    endDate={endDate}
                    currentDate={currentDate}
                    events={events}
                    modalDate={modalDate}
                    theme={theme}
                    onDateClick={handleDateClick}
                    onDateRightClick={handleDateRightClick}
                    onModalDateChange={setModalDate}
                />
            </div>

            {modalDate && (
                <EventModal
                    date={modalDate}
                    onClose={() => setModalDate(null)}
                    onSave={handleSaveEvent}
                />
            )}
        </div>
    );
}
