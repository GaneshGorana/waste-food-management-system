import react from "react";

const PaginationContext = react.createContext<{
  visitedPagesDonor: Set<number>;
  visitedPagesServiceWorker: Set<number>;
  visitedPagesFood: Set<number>;
  addVisitedPagesDonor: (page: number) => void;
  deleteVisitedPagesDonor: (page: number) => void;
  clearVisitedPagesDonor: () => void;
  addVisitedPagesServiceWorker: (page: number) => void;
  deleteVisitedPagesServiceWorker: (page: number) => void;
  clearVisitedPagesServiceWorker: () => void;
  addVisitedPagesFood: (page: number) => void;
  deleteVisitedPagesFood: (page: number) => void;
  clearVisitedPagesFood: () => void;
} | null>(null);

export default PaginationContext;
