import { useCallback, useState } from "react";

export function useMonthNavigation(initialDate = new Date()) {
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  const goToPreviousMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }, [month]);

  return {
    year,
    month,
    goToPreviousMonth,
    goToNextMonth,
  };
}
