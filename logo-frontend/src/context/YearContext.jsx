import { createContext, useContext, useState } from "react";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();

  const [years, setYears] = useState(() => {
    const stored = localStorage.getItem("years");
    return stored ? JSON.parse(stored) : [currentYear];
  });

  const [year, setYear] = useState(() => {
    const stored = localStorage.getItem("year");
    return stored ? Number(stored) : currentYear;
  });

  const changeYear = (newYear) => {
    const y = Number(newYear);
    setYear(y);
    localStorage.setItem("year", y);
  };

  const addYear = async (newYear) => {
    const y = Number(newYear);
    if (!y || years.includes(y)) return;

    const updatedYears = [...years, y].sort((a, b) => a - b);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));
  };

  const removeYear = (removeYear) => {
    if (years.length === 1) return; // en az 1 yıl kalsın

    const updatedYears = years.filter((y) => y !== removeYear);
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));

    // aktif yıl silindiyse başka bir yıla geç
    if (year === removeYear) {
      const fallback = updatedYears[updatedYears.length - 1];
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
