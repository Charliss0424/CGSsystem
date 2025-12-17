import React from "react";
import { InventoryMovementsTable } from "../components/InventoryMovementsTable";
import { ArrowLeft } from "lucide-react";
import { ViewState } from "../types";

interface Props {
  setView: (view: ViewState) => void;
}

const InventoryMovements: React.FC<Props> = ({ setView }) => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(ViewState.INVENTORY)}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            Movimientos de Inventario
          </h1>
        </div>

        <button
          onClick={() => alert("Aquí abrirás el modal de registrar movimiento")}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition"
        >
          Registrar Movimiento
        </button>
      </div>

      {/* TABLE */}
      <InventoryMovementsTable />
    </div>
  );
};

export default InventoryMovements;