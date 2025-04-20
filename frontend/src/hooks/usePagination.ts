import { useContext } from "react";
import PaginationContext from "@/context/PaginationContext";

export const usePagination = () => {
  const context = useContext(PaginationContext);
  if (!context)
    throw new Error("useVisitedPages must be used within VisitedPagesProvider");
  return context;
};
