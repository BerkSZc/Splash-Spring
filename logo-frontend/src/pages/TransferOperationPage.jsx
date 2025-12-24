import React, { useState } from "react";
import { useYear } from "../context/YearContext";
import { useAuthentication } from "../../backend/store/useAuthentication.js";

const TransferOperationPage = () => {
  const { isAuthenticated } = useAuthentication();
  const { year, years, changeYear, addYear, removeYear } = useYear();

  const [newYear, setNewYear] = useState("");

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 px-4">
      {/* Kart */}
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-xl space-y-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white tracking-wide">
          Devir İşlemleri
        </h2>

        {/* Aktif Yıl Seçimi */}
        <div className="space-y-1">
          <label className="text-sm text-gray-300">Aktif Çalışma Yılı</label>
          <select
            value={year}
            onChange={(e) => changeYear(Number(e.target.value))}
            className="w-full rounded-lg bg-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Yeni Yıl Ekle */}
        <div className="space-y-1">
          <label className="text-sm text-gray-300">Yeni Yıl Ekle</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Örn: 2026"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="flex-1 rounded-lg bg-gray-700 text-white px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
            <button
              onClick={() => {
                addYear(newYear);
                setNewYear("");
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-500 active:scale-95 transition"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Mevcut Yıllar */}
        <div className="space-y-1">
          <label className="text-sm text-gray-300">Tanımlı Yıllar</label>
          <ul className="rounded-xl bg-gray-800 divide-y divide-gray-700 overflow-hidden">
            {years.map((y) => (
              <li
                key={y}
                className="flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 transition"
              >
                <span className="font-medium">{y}</span>
                <button
                  onClick={() => removeYear(y)}
                  className="text-red-500 hover:text-red-400 transition"
                  title="Yılı Sil"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransferOperationPage;
