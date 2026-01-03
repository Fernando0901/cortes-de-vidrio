import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';

const OrderForm = ({ orders, onAdd, onRemove, unit }) => {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [qty, setQty] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!width || !height) return;

        onAdd({
            id: Date.now().toString(),
            width: Number(width),
            height: Number(height),
            quantity: Number(qty)
        });

        setWidth('');
        setHeight('');
        setQty(1);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                Pedido (Cortes)
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-3 rounded-lg">
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Ancho ({unit})</label>
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Alto ({unit})</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Cant.</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        min="1"
                    />
                </div>
                <button type="submit" className="col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar Pieza
                </button>
            </form>

            <div className="flex-1 overflow-y-auto max-h-[300px]">
                {orders.length === 0 ? (
                    <p className="text-center text-slate-400 py-4 italic">No hay piezas en el pedido.</p>
                ) : (
                    <ul className="space-y-2">
                        {orders.map((item) => (
                            <li key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                <div>
                                    <span className="font-semibold text-slate-700 block">
                                        {item.width} x {item.height} {unit}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Cantidad: {item.quantity}
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

export default OrderForm;
