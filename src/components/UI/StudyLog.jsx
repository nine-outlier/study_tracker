import React from 'react';

const StudyLog = ({ sessions }) => {
    const totalMinutes = (sessions || []).reduce((acc, s) => acc + s.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Study Log</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{(sessions || []).length} sessions, {totalHours} hours total</p>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {!sessions || sessions.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                        <p>No study sessions logged yet. Use the '+' button to add one.</p>
                    </div>
                ) : (
                    [...sessions].reverse().map((session, index) => (
                        <div key={session.id || index} className="p-4 bg-slate-50 rounded-lg ring-1 ring-slate-200 dark:bg-gray-800 dark:ring-gray-700 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{session.topic}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{session.date}</p>
                            </div>
                            <div className="text-lg font-medium text-slate-700 dark:text-slate-300">{session.duration} minutes</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudyLog;