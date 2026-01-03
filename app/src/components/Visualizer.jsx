import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Visualizer = ({ result, unit }) => {
    if (!result) {
        return (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border border-slate-200 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

                <div className="relative z-10 flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-slate-50 p-6 rounded-full mb-4 ring-1 ring-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <CheckCircle className="w-16 h-16 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Listo para Optimizar</h3>
                    <p className="text-slate-400 max-w-xs">
                        Agrega pedidos e inventario, luego presiona "Calcular" para ver el diagrama de corte aquí.
                    </p>
                </div>
            </div>
        );
    }

    const { scrapDims, layout, wastePercent, totalPieces, fittedPieces, scrapId, scrapName } = result;

    const viewBoxWidth = scrapDims.width;
    const viewBoxHeight = scrapDims.height;

    const scrapColor = "#f8fafc";
    const cutColor = "#3b82f6";
    const cutStroke = "#1e40af";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 min-h-[500px] h-fit flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Cortar en: {scrapName}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Piezas Encajadas</p>
                    <p className="text-lg font-bold text-slate-900">{fittedPieces} / {totalPieces}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">
                        {wastePercent < 99 ? 'Sobrante Útil' : 'Desperdicio'}
                    </p>
                    <p className={`text-lg font-bold ${wastePercent < 99 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {wastePercent.toFixed(2)}%
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Medidas Vidrio</p>
                    <p className="text-lg text-slate-900">{scrapDims.width} x {scrapDims.height} {unit}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Eficiencia</p>
                    <p className="text-lg text-slate-900">{(100 - wastePercent).toFixed(2)}%</p>
                </div>
            </div>

            {result.cutList && result.cutList.length > 0 && (
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Lista de Cortes</h4>
                    <ul className="text-sm text-slate-700 grid grid-cols-2 gap-x-4 gap-y-1">
                        {result.cutList.map((cutText, idx) => (
                            <li key={idx}>{cutText}</li>
                        ))}
                    </ul>
                </div>
            )}

            {fittedPieces < totalPieces && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 rounded-r">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                        <p className="text-sm text-orange-700">
                            Atención: No todas las piezas caben en un solo retazo con esta configuración.
                            Se muestran las {fittedPieces} piezas que mejor ajustan.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex-1 w-full bg-slate-50 rounded-lg border border-slate-300 relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="max-w-full max-h-full shadow-2xl bg-white"
                    style={{ aspectRatio: `${viewBoxWidth}/${viewBoxHeight}` }}
                >
                    <rect
                        x="0"
                        y="0"
                        width={viewBoxWidth}
                        height={viewBoxHeight}
                        fill={scrapColor}
                        stroke="none"
                    />

                    <text x="5" y="15" fontSize={`${Math.min(viewBoxWidth, viewBoxHeight) * 0.05}`} fill="#94a3b8" fontWeight="bold">
                        {scrapDims.width} {unit}
                    </text>
                    <text x="5" y={viewBoxHeight - 5} fontSize={`${Math.min(viewBoxWidth, viewBoxHeight) * 0.05}`} fill="#94a3b8" fontWeight="bold">
                        {scrapDims.height} {unit}
                    </text>

                    {layout.map((cut, index) => {
                        const fontSize = Math.min(cut.width, cut.height) * 0.25;
                        const showText = fontSize > 10;

                        return (
                            <g key={index}>
                                <rect
                                    x={cut.x}
                                    y={cut.y}
                                    width={cut.width}
                                    height={cut.height}
                                    fill={cutColor}
                                    fillOpacity="0.2"
                                    stroke={cutStroke}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                />
                                {showText && (
                                    <text
                                        x={cut.x + cut.width / 2}
                                        y={cut.y + cut.height / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={cutStroke}
                                        fontSize={fontSize}
                                        fontWeight="bold"
                                    >
                                        {cut.width}x{cut.height}
                                    </text>
                                )}
                            </g>
                        )
                    })}
                </svg>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
                Visualización proporcional. El área gris claro es desperdicio.
            </p>
        </div>
    );
};

export default Visualizer;
