import React, { useState } from 'react';
import { Plus, Trash2, Ruler } from 'lucide-react';

const InventoryForm = ({ inventory, onAdd, onRemove, unit }) => {
    const [name, setName] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [qty, setQty] = useState(1);
    const [type, setType] = useState('Claro 6mm');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!width || !height) return;

        const finalName = name.trim() || `Retazo #${inventory.length + 1}`;

        onAdd({
            id: Date.now().toString(), // Simple ID
            name: finalName,
            width: Number(width),
            height: Number(height),
            quantity: Number(qty),
            type
        });

        // Reset keeping type
        setName('');
        setWidth('');
        setHeight('');
        setQty(1);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                Inventario (Retazos)
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-lg">
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nombre / Etiqueta (Opcional)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. Sobrante Ventana Baño"
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Ancho ({unit})</label>
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={`Ej. 1200 ${unit}`}
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Alto ({unit})</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={`Ej. 800 ${unit}`}
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Cantidad</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label>
                    <input
                        type="text"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar Retazo
                </button>
            </form>

            <div className="flex-1 overflow-y-auto max-h-[300px]">
                {inventory.length === 0 ? (
                    <p className="text-center text-slate-400 py-4 italic">No hay retazos agregados.</p>
                ) : (
                    <ul className="space-y-2">
                        {inventory.map((item) => (
                            <li key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                <div>
                                    <span className="font-bold text-lg text-slate-800 block">
                                        {item.name}
                                    </span>
                                    <span className="font-semibold text-slate-600 block">
                                        {item.width} x {item.height} {unit}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Cant: {item.quantity} | {item.type}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default InventoryForm;
