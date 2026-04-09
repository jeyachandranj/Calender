import React from 'react';
import { format, isSameDay, isWeekend, eachDayOfInterval } from 'date-fns';
import { PenLine, Plus, Bell, X, CalendarDays, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function CalendarSidebar({
    theme,
    noteTitle,
    isDayNote,
    notes,
    activeNoteKey,
    onNoteChange,
    selectedDayKey,
    selectedDayEvents,
    onModalDateChange,
    onDeleteEvent,
    startDate,
    endDate,
    onClearSelection,
    EVENT_TYPES
}) {
    return (
        <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <PenLine className={cn("w-5 h-5 shrink-0 transition-colors", theme.text)} />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap overflow-hidden">
                        <span className="inline-block transition-all duration-300">
                            {noteTitle}
                        </span>
                    </h2>
                </div>

                <div className="relative group">
                    <textarea
                        key={`textarea-${isDayNote}`}
                        value={notes[activeNoteKey] || ''}
                        onChange={onNoteChange}
                        placeholder={isDayNote ? "Add specific tasks, routines, or events for this day..." : "Jot down important memos, tasks, or goals for the month..."}
                        className={cn(
                            "w-full h-28 md:h-40 p-4 rounded-xl resize-none text-slate-600 bg-slate-50 border border-slate-200 outline-none transition-all duration-300 leading-normal font-medium placeholder:text-slate-400 text-sm sm:text-base",
                            "focus:ring-2 focus:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        )}
                    />
                </div>
            </div>

            {selectedDayKey && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Events · {format(new Date(selectedDayKey), 'MMM d')}
                        </h3>
                        <button
                            onClick={() => onModalDateChange(selectedDayKey)}
                            className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-white transition hover:brightness-110", theme.primary)}
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    {selectedDayEvents.length === 0 ? (
                        <p className="text-xs text-slate-400">No events. Click + to add one.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {selectedDayEvents.map((ev, i) => {
                                const typeInfo = EVENT_TYPES.find(t => t.id === ev.type);
                                const Icon = typeInfo?.icon || Bell;
                                return (
                                    <li key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                                        <span className={cn("p-1 rounded-lg text-white flex-shrink-0", typeInfo?.color || 'bg-slate-400')}>
                                            <Icon className="w-3 h-3" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{ev.title}</p>
                                            {ev.startTime && <p className="text-[10px] text-slate-400">{ev.startTime}{ev.endTime && ` – ${ev.endTime}`}</p>}
                                            {ev.email && <p className="text-[10px] text-slate-400 truncate">{ev.email}</p>}
                                        </div>
                                        <button
                                            onClick={() => onDeleteEvent(selectedDayKey, i)}
                                            className="text-slate-300 hover:text-rose-500 transition flex-shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Selected Range</h3>
                {startDate ? (
                    <div className="flex items-center gap-2">
                        <div className={cn("flex flex-col items-center justify-center p-2 rounded-lg text-white shadow-sm min-w-[3rem]", theme.primary)}>
                            <span className="text-[10px] uppercase opacity-80 leading-none">{format(startDate, "MMM")}</span>
                            <span className="text-xl font-bold leading-tight">{format(startDate, "d")}</span>
                        </div>
                        {endDate && (
                            <>
                                <div className="h-[2px] w-4 bg-slate-300 rounded-full shrink-0" />
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg text-slate-700 bg-white border border-slate-200 shadow-sm min-w-[3rem]">
                                    <span className="text-[10px] uppercase text-slate-400 leading-none">{format(endDate, "MMM")}</span>
                                    <span className="text-xl font-bold leading-tight">{format(endDate, "d")}</span>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                        <CalendarDays className="w-5 h-5 opacity-50" />
                        No dates selected
                    </div>
                )}

                {startDate && endDate && !isSameDay(startDate, endDate) && (() => {
                    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
                    return (
                        <div className="flex flex-wrap gap-2 mt-4 transition-all duration-300">
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-md", theme.light, theme.text)}>{intervalDays.length} Days</span>
                            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{intervalDays.filter(day => !isWeekend(day)).length} Weekdays</span>
                        </div>
                    );
                })()}

                {(startDate || endDate) && (
                    <button
                        onClick={onClearSelection}
                        className="mt-4 text-xs font-bold text-slate-400 hover:text-rose-500 uppercase flex items-center transition-colors"
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear Selection
                    </button>
                )}
            </div>
        </div>
    );
}
