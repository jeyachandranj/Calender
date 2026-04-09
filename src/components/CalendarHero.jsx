import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export default function CalendarHero({
    currentDate,
    themeData,
    monthIndex,
    currentMonthKey,
    onPrevMonth,
    onNextMonth,
    imageError,
    onImageError
}) {
    return (
        <div className="relative h-[250px] sm:h-[320px] w-full overflow-hidden group">
            <div
                key={currentMonthKey}
                className={cn("absolute inset-0 w-full h-full bg-gradient-to-br transition-all duration-700 ease-in-out", themeData.gradient)}
            >
                {!imageError[themeData.image] && (
                    <img
                        src={themeData.image}
                        alt={`${themeData.name} landscape`}
                        onError={() => onImageError(themeData.image)}
                        className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
                    <path d="M0,120 C320,120 420,0 720,0 C1020,0 1120,120 1440,120 L1440,1440 L0,1440 Z" fill="currentColor"></path>
                </svg>
            </div>

            <div className="absolute inset-0 p-5 sm:p-8 md:p-10 z-10 text-white pointer-events-none">
                <div className="absolute top-6 sm:top-10 left-6 sm:left-10 pointer-events-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight transition-all duration-500 transform translate-y-0 opacity-100">
                        {themeData.name}
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium text-white/80 mt-1 drop-shadow-md">
                        {format(currentDate, "yyyy")}
                    </p>
                </div>

                <div className="absolute bottom-6 sm:bottom-10 right-4 sm:right-10 flex bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto">
                    <button onClick={onPrevMonth} className="p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors">
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="w-[1px] bg-white/30 my-2 mx-1" />
                    <button onClick={onNextMonth} className="p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors">
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
