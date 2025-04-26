import React, { useState } from "react";
import PaginationContext from "./PaginationContext";

export const PaginationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visitedPagesDonor, setVisitedPagesDonor] = useState<Set<number>>(
    new Set()
  );
  const [visitedPagesServiceWorker, setVisitedPagesServiceWorker] = useState<
    Set<number>
  >(new Set());
  const [visitedPagesFood, setVisitedPagesFood] = useState<Set<number>>(
    new Set()
  );

  const getVisitedPagesData = (visitedPages: Set<number>) => {
    if (visitedPages.size === 0) {
      return { page: 1, totalPages: 1 };
    }
    const pagesArray = Array.from(visitedPages);
    const page = Math.min(...pagesArray);
    const totalPages = Math.max(...pagesArray);
    return { page, totalPages };
  };

  const addVisitedPagesDonor = (page: number) => {
    setVisitedPagesDonor((prev) => {
      const newSet = new Set(prev);
      newSet.add(page);
      return newSet;
    });
  };

  const deleteVisitedPagesDonor = (page: number) => {
    setVisitedPagesDonor((prev) => {
      const newSet = new Set(prev);
      newSet.delete(page);
      return newSet;
    });
  };

  const clearVisitedPagesDonor = () => {
    setVisitedPagesDonor(new Set());
  };

  const addVisitedPagesServiceWorker = (page: number) => {
    setVisitedPagesServiceWorker((prev) => {
      const newSet = new Set(prev);
      newSet.add(page);
      return newSet;
    });
  };

  const deleteVisitedPagesServiceWorker = (page: number) => {
    setVisitedPagesServiceWorker((prev) => {
      const newSet = new Set(prev);
      newSet.delete(page);
      return newSet;
    });
  };

  const clearVisitedPagesServiceWorker = () => {
    setVisitedPagesServiceWorker(new Set());
  };

  const addVisitedPagesFood = (page: number) => {
    setVisitedPagesFood((prev) => {
      const newSet = new Set(prev);
      newSet.add(page);
      return newSet;
    });
  };

  const deleteVisitedPagesFood = (page: number) => {
    setVisitedPagesFood((prev) => {
      const newSet = new Set(prev);
      newSet.delete(page);
      return newSet;
    });
  };

  const clearVisitedPagesFood = () => {
    setVisitedPagesFood(new Set());
  };

  return (
    <PaginationContext.Provider
      value={{
        visitedPagesDonor,
        visitedPagesServiceWorker,
        visitedPagesFood,
        getVisitedPagesData,
        addVisitedPagesDonor,
        addVisitedPagesServiceWorker,
        addVisitedPagesFood,
        deleteVisitedPagesDonor,
        deleteVisitedPagesServiceWorker,
        deleteVisitedPagesFood,
        clearVisitedPagesDonor,
        clearVisitedPagesServiceWorker,
        clearVisitedPagesFood,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
