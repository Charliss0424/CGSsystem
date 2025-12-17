import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Product } from "../context/InventoryContext";

interface Movement {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  created_by?: string;
  created_at: string;
}

export const InventoryMovementsTable: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const { data: movs } = await supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: prods } = await supabase.from("products").select("*");

    if (movs) setMovements(movs);
    if (prods) setProducts(prods);
  };

  const getProductName = (id: string) => {
    const p = products.find((x) => x.id === id);
    return p ? p.name : "Producto eliminado";
  };

  const filtered = movements.filter((m) => {
    const matchesType = filterType === "all" || m.type === filterType;
    const matchesSearch = getProductName(m.product_id)
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow border border-slate-200">
      
      {/* FILTROS */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
          <option value="ajuste">Ajustes</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Cantidad</th>
              <th className="p-2 text-left">Stock Prev.</th>
              <th className="p-2 text-left">Stock Nuevo</th>
              <th className="p-2 text-left">Motivo</th>
              <th className="p-2 text-left">Usuario</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b hover:bg-slate-50">
                <td className="p-2">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-2">{getProductName(m.product_id)}</td>
                <td className="p-2 capitalize">{m.type}</td>
                <td className="p-2">{m.quantity}</td>
                <td className="p-2">{m.previous_stock}</td>
                <td className="p-2">{m.new_stock}</td>
                <td className="p-2">{m.reason || "-"}</td>
                <td className="p-2">{m.created_by || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};