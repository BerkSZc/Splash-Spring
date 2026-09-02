import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTenant } from "./TenantContext";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const { tenant } = useTenant();

  // 1. Yıllar listesi
  const [years, setYears] = useState(() => {
    try {
      const stored = localStorage.getItem("years");
      return stored ? JSON.parse(stored).map(Number) : [currentYear];
    } catch {
      return [currentYear];
    }
  });

  const [year, setYear] = useState(() => {
    const stored = localStorage.getItem("year");

    return stored ? Number(stored) : currentYear;
  });

  useEffect(() => {
    const storedYear = localStorage.getItem("year");
    if (storedYear) {
      setYear(Number(storedYear));
    }
  }, [tenant]);

  const changeYear = (newYearValue) => {
    const y = Number(newYearValue);
    if (!y) return;
    setYear(y);
    localStorage.setItem("year", y);
  };

  const addYear = async (newYear) => {
    const y = Number(newYear);
    const numericYears = years.map(Number);

    if (!y || numericYears.includes(y)) {
      toast.error("Mali yıl mevcut");
      return;
    }

    if (!tenant) {
      toast.error("Şirket seçin!");
      return;
    }

    const updatedYears = [...numericYears, y].sort((a, b) => a - b);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));
    changeYear(y);
  };

  const removeYear = (targetYear) => {
    const t = Number(targetYear);
    if (years.length === 1) return;

    const updatedYears = years.map(Number).filter((y) => y !== t);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));

    if (Number(year) === t) {
      const fallback = updatedYears[updatedYears.length - 1] || currentYear;
      changeYear(fallback);
    }
  };

  return (
    <YearContext.Provider
      value={{
        year: Number(year),
        years: years.map(Number),
        changeYear,
        setYears,
        addYear,
        removeYear,
      }}
    >
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => useContext(YearContext);
