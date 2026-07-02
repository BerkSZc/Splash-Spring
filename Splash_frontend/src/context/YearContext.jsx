import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTenant } from "./TenantContext";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const { tenant } = useTenant();

  const [years, setYears] = useState(() => {
    try {
      const stored = localStorage.getItem("years");
      return stored ? JSON.parse(stored) : [currentYear];
    } catch (error) {
      return [currentYear];
    }
  });

  const [year, setYear] = useState(() => {
    const stored = localStorage.getItem("year");
    return stored ? Number(stored) : currentYear;
  });

  useEffect(() => {
    if (!years.length) return;

    if (!years.includes(year)) {
      const latest = Math.max(...years);
      changeYear(latest);
    }
  }, [years, year]);

  const changeYear = (newYear) => {
    const y = Number(newYear);
    setYear(y);
    localStorage.setItem("year", y);
  };

  const addYear = async (newYear) => {
    const y = Number(newYear);
    if (!y || years.includes(y)) {
      toast.error("Mali yıl mevcut");
      return;
    }

    if (!tenant) {
      toast.error("Şirket seçin!");
      return;
    }

    const updatedYears = [...years, y].sort((a, b) => a - b);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));
  };

  const removeYear = (removeYear) => {
    if (years.length === 1) return;
    const updatedYears = years.filter((y) => y !== removeYear);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));

    // aktif yıl silindiyse başka bir yıla geç
    if (year === removeYear) {
      const fallback = updatedYears[updatedYears.length - 1 || currentYear];
      setYear(fallback);
      localStorage.setItem("year", fallback);
    }
  };

  return (
    <YearContext.Provider
      value={{
        year,
        years,
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
