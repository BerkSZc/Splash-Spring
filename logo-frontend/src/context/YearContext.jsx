import { createContext, useContext, useState } from "react";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(() => {
    return localStorage.getItem("year") || currentYear;
  });

  const changeYear = (newYear) => {
    setYear(newYear);
    localStorage.setItem("year", newYear);
  };

  return (
    <YearContext.Provider value={{ year, changeYear }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => useContext(YearContext);
