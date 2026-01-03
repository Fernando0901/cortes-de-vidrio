import React, { useState } from 'react';
import { Play, Ruler } from 'lucide-react';

const QuickCheck = ({ onCalculate, unit }) => {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    const handleQuickCalc = (e) => {
        e.preventDefault();
        if (!width || !height) return;

        // Create a temporary scrap item
        const tempScrap = {
            id: 'quick-scrap',
            width: Number(width),
            height: Number(height),
            quantity: 1,
            type: 'Quick Check'
        };

        onCalculate(tempScrap);
    };

    return (
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200 mt-6">
            <h2 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Prueba Rápida (1 Retazo)
            </h2>
            <p className="text-sm text-blue-700 mb-3">
                Prueba si tus pedidos caben en este retazo sin agregarlo al inventario.
            </p>

            <form onSubmit={handleQuickCalc} className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="text-xs font-semibold text-blue-600 uppercase">Ancho ({unit})</label>
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full mt-1 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder={`Ej. 500 ${unit}`}
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-semibold text-blue-600 uppercase">Alto ({unit})</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full mt-1 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder={`Ej. 400 ${unit}`}
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-colors h-[42px]">
                    Probar
                </button>
            </form>
        </div>
    );
};

export default QuickCheck;
