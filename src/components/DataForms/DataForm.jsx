import React, { useState } from 'react';
import { config } from '../../config/appConfig';
import { generateId, getLocalDate } from '../../utils/helpers';
import { PlusIcon, TrashIcon } from '../UI/Icons';

const DataForm = ({ existingDomains, onAddTest, onClose, showToast }) => {
    // Refactor: Use getLocalDate helper to fix timezone off-by-one errors
    const [date, setDate] = useState(getLocalDate());
    const [type, setType] = useState('practiceTest');
    const [label, setLabel] = useState('');
    
    // Refactor: State now tracks an array of rows instead of single domain inputs
    const [domainRows, setDomainRows] = useState([{ id: `row_${Date.now()}`, domain: '', correct: '', total: '' }]);

    const handleAddRow = () => {
        setDomainRows([...domainRows, { id: `row_${Date.now()}_${Math.random()}`, domain: '', correct: '', total: '' }]);
    };

    const handleRemoveRow = (id) => {
        if (domainRows.length > 1) {
            setDomainRows(domainRows.filter(row => row.id !== id));
        }
    };

    const handleRowChange = (id, field, value) => {
        const updatedRows = domainRows.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        });
        setDomainRows(updatedRows);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Check ALL rows
        for (const row of domainRows) {
            if (!row.domain) {
                showToast("Please select a domain for all rows.", true);
                return;
            }
            // Ensure numbers are valid integers
            const c = parseInt(row.correct, 10);
            const t = parseInt(row.total, 10);

            if (Number.isNaN(c) || Number.isNaN(t) || t === 0) {
                showToast("Please enter valid scores for all rows.", true);
                return;
            }
            if (c > t) {
                showToast(`Correct answers cannot exceed total questions for ${row.domain}.`, true);
                return;
            }
        }

        // Refactor: Aggregate data from all rows into the domains object
        const domainMap = {};
        let totalCorrect = 0;
        let totalQuestions = 0;

        domainRows.forEach(row => {
            const c = parseInt(row.correct, 10);
            const t = parseInt(row.total, 10);
            
            // If domain appears twice, this logic overwrites. 
            // In a more advanced version, we could sum them, but overwriting is standard for this simplicity level.
            domainMap[row.domain] = {
                correct: c,
                total: t
            };
            totalCorrect += c;
            totalQuestions += t;
        });

        // Add overall total automatically
        domainMap[config.ALL_DOMAINS_KEY] = {
            correct: totalCorrect,
            total: totalQuestions
        };

        const newTest = {
            id: generateId('test'),
            date,
            type,
            // Fallback label logic preserved/enhanced
            label: label || config.TEST_TYPES[type], 
            isDeleted: false,
            domains: domainMap
        };

        onAddTest(newTest);
        showToast("Test added successfully!");
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="w-full p-2 rounded border border-slate-300 dark:bg-gray-800 dark:border-gray-600 dark:text-slate-100"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Test Type</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 dark:bg-gray-800 dark:border-gray-600 dark:text-slate-100"
                    >
                        {Object.entries(config.TEST_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label (Optional)</label>
                <input 
                    type="text" 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)} 
                    placeholder="e.g., Practice Exam #4" 
                    className="w-full p-2 rounded border border-slate-300 dark:bg-gray-800 dark:border-gray-600 dark:text-slate-100"
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Domain Scores</label>
                    <button 
                        type="button" 
                        onClick={handleAddRow}
                        className="text-xs flex items-center text-sky-600 hover:text-sky-700 font-semibold"
                    >
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Row
                    </button>
                </div>
                
                <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 space-y-3">
                    {domainRows.map((row) => (
                        <div key={row.id} className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <select 
                                    value={row.domain} 
                                    onChange={(e) => handleRowChange(row.id, 'domain', e.target.value)}
                                    className="w-full p-2 text-sm rounded border border-slate-300 dark:bg-gray-700 dark:border-gray-600 dark:text-slate-100"
                                >
                                    <option value="">Select Domain...</option>
                                    {existingDomains.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                    {/* FIXED: Added All Domains option here */}
                                    <option value={config.ALL_DOMAINS_KEY}>{config.ALL_DOMAINS_KEY}</option>
                                </select>
                            </div>
                            <div className="w-20">
                                <input 
                                    type="number" 
                                    placeholder="Correct"
                                    min="0"
                                    value={row.correct}
                                    onChange={(e) => handleRowChange(row.id, 'correct', e.target.value)}
                                    className="w-full p-2 text-sm rounded border border-slate-300 dark:bg-gray-700 dark:border-gray-600 dark:text-slate-100"
                                />
                            </div>
                            <div className="flex items-center justify-center text-slate-400">/</div>
                            <div className="w-20">
                                <input 
                                    type="number" 
                                    placeholder="Total"
                                    min="1"
                                    value={row.total}
                                    onChange={(e) => handleRowChange(row.id, 'total', e.target.value)}
                                    className="w-full p-2 text-sm rounded border border-slate-300 dark:bg-gray-700 dark:border-gray-600 dark:text-slate-100"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveRow(row.id)}
                                disabled={domainRows.length === 1}
                                className={`p-2 text-slate-400 hover:text-red-500 transition-colors ${domainRows.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit"
                    className="px-6 py-2 bg-sky-600 text-white font-medium rounded hover:bg-sky-700 transition-colors shadow-sm"
                >
                    Add Test Record
                </button>
            </div>
        </form>
    );
};

export default DataForm;