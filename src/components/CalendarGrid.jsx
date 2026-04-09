import React from 'react';
import { format, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import { cn } from '../utils/cn';

function EventDot({ type }) {
    const colors = { reminder: 'bg-amber-400', meet: 'bg-blue-500', birthday: 'bg-pink-500' };
    return <span className={cn('w-1.5 h-1.5 rounded-full inline-block', colors[type] || 'bg-slate-400')} />;
}

export default function CalendarGrid({
    days,
    startDate,
    endDate,
    currentDate,
    events,
    modalDate,
    theme,
    onDateClick,
    onDateRightClick,
    onModalDateChange
}) {
    return (
        <div className="lg:col-span-8 flex flex-col">
            <div className="grid grid-cols-7 mb-4 px-1 sm:px-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className={cn("text-center text-[10px] sm:text-sm font-bold uppercase tracking-normal sm:tracking-wider", theme.text)}>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                        <span className="hidden sm:inline">{day}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-0 relative">
                {days.map((day) => {
                    const isSelectedStart = startDate && isSameDay(day, startDate);
                    const isSelectedEnd = endDate && isSameDay(day, endDate);
                    const isWithinSelection = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = events[dayKey] || [];
                    const isSelectedDay = modalDate === dayKey;

                    return (
                        <div
                            key={day.toString()}
                            className="relative flex flex-col justify-center items-center h-10 sm:h-14 mt-1"
                        >
                            {isWithinSelection && (
                                <div className={cn(
                                    "absolute inset-y-0 sm:inset-y-1 w-full transition-all duration-300",
                                    theme.secondary,
                                    isSelectedStart ? "rounded-l-full left-1/2 w-1/2" : "",
                                    isSelectedEnd ? "rounded-r-full right-1/2 w-1/2" : ""
                                )} />
                            )}

                            <button
                                onClick={() => {
                                    onDateClick(day);
                                    if (isCurrentMonth) onModalDateChange(isSelectedDay ? null : dayKey);
                                }}
                                onContextMenu={(e) => isCurrentMonth && onDateRightClick(e, day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "relative w-9 h-9 sm:w-12 sm:h-12 flex flex-col justify-center items-center rounded-full font-semibold text-sm sm:text-base transition-all duration-200 z-10",
                                    !isCurrentMonth ? "text-slate-200" : "text-slate-700",
                                    isCurrentMonth && !isSelectedStart && !isSelectedEnd && !isWithinSelection && "hover:bg-slate-100 hover:scale-105 active:scale-95",
                                    (isSelectedStart || isSelectedEnd) && cn("text-white shadow-lg scale-110", theme.primary),
                                    isWithinSelection && !isSelectedStart && !isSelectedEnd && theme.text,
                                    isSelectedDay && !isSelectedStart && !isSelectedEnd && 'ring-2 ring-offset-1 ring-slate-300'
                                )}
                            >
                                <span className="relative z-20">{format(day, "d")}</span>
                                {isToday && (
                                    <span className="absolute top-0 sm:top-1 right-0 sm:right-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5 z-30">
                                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme.primary)}></span>
                                        <span className={cn("relative inline-flex rounded-full h-full w-full", theme.primary)}></span>
                                    </span>
                                )}
                            </button>

                            {dayEvents.length > 0 && isCurrentMonth && (
                                <div className="flex gap-0.5 mt-0.5 z-10">
                                    {dayEvents.slice(0, 3).map((ev, i) => (
                                        <EventDot key={i} type={ev.type} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
