import React, { useState } from 'react';
import Calendar from '../components/Calendar';
import { Download } from 'lucide-react';

export default function Home() {
    const [exportFn, setExportFn] = useState(null);

    const handleExport = () => {
        if (typeof exportFn === 'function') {
            exportFn();
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-24 px-4 md:px-8 bg-slate-100 flex flex-col items-center">
            <div className="w-full max-w-6xl mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Interactive Wall Calendar</h1>
                    <p className="text-slate-500 mt-2">
                        A beautiful, unique take on the classic wall physical calendar format.
                    </p>
                </div>

                <div className="hidden sm:flex shrink-0 gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <Calendar onExport={setExportFn} />

            <div className="sm:hidden fixed bottom-6 right-6 z-40">
                <button onClick={handleExport} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-full text-sm font-bold shadow-xl hover:bg-slate-700 transition">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>
    );
}
