import React, { useState, useEffect } from 'react';
import { Calculator, Layers, LayoutGrid } from 'lucide-react';
import InventoryForm from './components/InventoryForm';
import OrderForm from './components/OrderForm';
import Visualizer from './components/Visualizer';


import { calculateBestOption } from './utils/optimizer';

function App() {
  const [activeTab, setActiveTab] = useState('inputs'); // 'inputs' | 'results'
  const [unit, setUnit] = useState('cm'); // Global Unit State

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [result, setResult] = useState(null);

  // Cargar datos guardados
  useEffect(() => {
    const storedInventory = localStorage.getItem('glass_inventory');
    if (storedInventory) setInventory(JSON.parse(storedInventory));
    const storedOrders = localStorage.getItem('glass_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
  }, []);

  // Guardar datos automáticamente
  useEffect(() => {
    localStorage.setItem('glass_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('glass_orders', JSON.stringify(orders));
  }, [orders]);

  const handleAddStock = (item) => setInventory([...inventory, item]);
  const handleRemoveStock = (id) => setInventory(inventory.filter(i => i.id !== id));
  const handleAddOrder = (item) => setOrders([...orders, item]);
  const handleRemoveOrder = (id) => setOrders(orders.filter(i => i.id !== id));

  const handleCalculate = (singleScrap = null) => {
    if (orders.length === 0) {
      alert("Por favor agrega pedidos antes de calcular.");
      return;
    }
    const stockToUse = singleScrap ? [singleScrap] : inventory;
    if (stockToUse.length === 0) {
      alert("No hay inventario disponible.");
      return;
    }

    const bestOption = calculateBestOption(stockToUse, orders);
    setResult(bestOption);

    if (!bestOption) {
      alert("No se encontró ningún retazo válido.");
    } else {
      // En celular, cambiamos automáticamente a la pestaña de resultados
      setActiveTab('results');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Header Fijo */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold tracking-tight">Cortes<span className="text-blue-600">Pro</span></h1>
            </div>
            {/* Unit Selector */}
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="bg-slate-100 text-slate-700 text-sm font-semibold py-1 px-2 rounded-lg border-none focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
            </select>
          </div>
          {/* Botón flotante solo visible en Móvil */}
          <button
            onClick={() => handleCalculate()}
            className="md:hidden bg-blue-600 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Calculator className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Navegación Tabs (Solo Móvil) */}
      <div className="md:hidden flex bg-white border-b border-slate-200 sticky top-[60px] z-10 shadow-sm">
        <button
          onClick={() => setActiveTab('inputs')}
          className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${activeTab === 'inputs' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Layers className="w-4 h-4" /> Datos
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Calculator className="w-4 h-4" /> Resultados
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 lg:p-6">

        {/* LAYOUT DE ESCRITORIO (Grid de 2 columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* COLUMNA IZQUIERDA: Inputs */}
          {/* En móvil: Solo se muestra si activeTab es 'inputs'. En PC: Siempre visible (col-span-5) */}
          <div className={`lg:col-span-5 space-y-6 ${activeTab === 'inputs' ? 'block' : 'hidden lg:block'}`}>


            <InventoryForm
              inventory={inventory}
              onAdd={handleAddStock}
              onRemove={handleRemoveStock}
              unit={unit}
            />
            <OrderForm
              orders={orders}
              onAdd={handleAddOrder}
              onRemove={handleRemoveOrder}
              unit={unit}
            />
            {/* Botón Grande de Calcular (Solo PC) */}
            <div className="hidden lg:block pt-4">
              <button
                onClick={() => handleCalculate()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-3"
              >
                <Calculator className="w-6 h-6" />
                CALCULAR MEJOR CORTE
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resultados (Sticky en Desktop) */}
          <div className={`lg:col-span-7 flex flex-col ${activeTab === 'results' ? 'flex h-[calc(100vh-140px)]' : 'hidden lg:flex lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]'}`}>
            <div className="flex-grow h-full w-full">
              <Visualizer result={result} unit={unit} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
