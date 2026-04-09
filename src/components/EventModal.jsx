import React, { useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { X, Video, Cake, Bell, Clock, AtSign } from 'lucide-react';
import { cn } from '../utils/cn';
import emailjs from '@emailjs/browser';

const EVENT_TYPES = [
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'bg-amber-500' },
    { id: 'meet', label: 'Google Meet', icon: Video, color: 'bg-blue-600' },
    { id: 'birthday', label: 'Birthday Email', icon: Cake, color: 'bg-pink-500' },
];

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

function pad(n) { return String(n).padStart(2, '0'); }

function buildGoogleMeetLink({ title, date, startTime, endTime, description }) {
    const d = new Date(date);
    const [sh, sm] = startTime.split(':');
    const [eh, em] = endTime.split(':');
    const start = new Date(d);
    start.setHours(+sh, +sm, 0);
    const end = new Date(d);
    end.setHours(+eh, +em, 0);

    const fmt = (dt) =>
        `${format(dt, 'yyyyMMdd')}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${fmt(start)}/${fmt(end)}`,
        details: description || '',
        add: 'meet',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildBirthdayMailto({ name, email, date }) {
    const dateStr = format(new Date(date), 'MMMM d, yyyy');
    const subject = encodeURIComponent(`Happy Birthday, ${name}! 🎂`);
    const body = encodeURIComponent(
        `Hi ${name},\n\nWishing you a very Happy Birthday on ${dateStr}! 🎉🎂\n\nMay this special day bring you lots of joy and happiness.\n\nWith love,\n[Your Name]`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
}

export default function EventModal({ date, onClose, onSave }) {
    const [type, setType] = useState('reminder');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [email, setEmail] = useState('');
    const [desc, setDesc] = useState('');
    const isPastDate = isBefore(startOfDay(new Date(date)), startOfDay(new Date()));

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ type, title: title.trim(), startTime, endTime, email, desc, date });
        onClose();
    };

    const handleAction = async () => {
        if (!title.trim()) return;

        if (type === 'meet') {
            const url = buildGoogleMeetLink({ title, date, startTime, endTime, description: desc });
            window.open(url, '_blank');
        } else if (type === 'birthday') {
            if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
                try {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        email,
                        name: title,
                        date: format(new Date(date), 'MMMM d, yyyy')
                    }, EMAILJS_PUBLIC_KEY);
                    alert("Birthday email sent successfully!");
                } catch (err) {
                    window.open(buildBirthdayMailto({ name: title, email, date }), '_self');
                }
            } else {
                window.open(buildBirthdayMailto({ name: title, email, date }), '_self');
            }
        } else if (type === 'reminder') {
            if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
                try {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        email: "jeyachandran72jj@gmail.com",
                        name: "Admin",
                        message: `REMINDER: ${title} - ${desc || ''} (Scheduled for ${startTime})`,
                        from_email: "jeyachandran72jj@gmail.com",
                        date: format(new Date(date), 'MMMM d, yyyy')
                    }, EMAILJS_PUBLIC_KEY);
                    alert(`Reminder set successfully for ${format(new Date(date), 'MMMM d, yyyy')} at ${startTime}! Email sent to jeyachandran72jj@gmail.com`);
                } catch (err) {
                    console.error("EmailJS Error:", err);
                }
            }
        }
        handleSave();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ease-out"
            >
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Add Event</h3>
                        <p className="text-sm text-slate-400 mt-0.5">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</p>
                        {isPastDate && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight mt-1">Cannot set events for past dates</p>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex gap-2 mb-5">
                    {EVENT_TYPES.map(({ id, label, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => setType(id)}
                            className={cn(
                                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all duration-200',
                                type === id
                                    ? `border-transparent text-white ${color} shadow-lg scale-105`
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                            {type === 'birthday' ? 'Person\'s Name' : 'Title'}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={type === 'birthday' ? "e.g. John Doe" : "e.g. Team Standup"}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                        />
                    </div>

                    {type === 'birthday' && (
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                                <AtSign className="w-3 h-3" /> Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="friend@example.com"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                            />
                        </div>
                    )}

                    {(type === 'reminder' || type === 'meet') && (
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                />
                            </div>
                            {type === 'meet' && (
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {(type === 'reminder' || type === 'meet') && (
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Description</label>
                            <textarea
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                rows={2}
                                placeholder="Any additional details..."
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-5">
                    <button
                        onClick={handleSave}
                        disabled={isPastDate}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-semibold transition",
                            isPastDate ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                    >
                        Save Only
                    </button>
                    <button
                        onClick={handleAction}
                        disabled={!title.trim() || isPastDate}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2',
                            isPastDate ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                                type === 'birthday' ? 'bg-pink-500 hover:bg-pink-600' :
                                    type === 'meet' ? 'bg-blue-600 hover:bg-blue-700' :
                                        'bg-amber-500 hover:bg-amber-600',
                            !title.trim() && !isPastDate && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {type === 'meet' && <Video className="w-4 h-4" />}
                        {type === 'birthday' && <Cake className="w-4 h-4" />}
                        {type === 'reminder' && <Bell className="w-4 h-4" />}
                        {type === 'meet' ? 'Open Google Meet' : type === 'birthday' ? 'Send Birthday Wish' : 'Save Reminder'}
                    </button>
                </div>
            </div>
        </div>
    );
}
