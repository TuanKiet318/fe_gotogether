// hooks/useDestinations.js
import { useState, useEffect } from "react";
import { getDestinations } from "../services/destination.api";

export const useDestinations = (initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 0,
    size: 12,
    sortBy: "name",
    sortDirection: "ASC",
    ...initialParams,
  });

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDestinations(params);

      if (response.data?.success) {
        const result = response.data.data;
        setData(result.content || []);
        setPagination({
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          last: result.last,
        });
      } else {
        throw new Error("Failed to fetch destinations");
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const search = (newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: 0,
    }));
  };

  const changePage = (page) => {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    pagination,
    loading,
    error,
    search,
    changePage,
    refresh,
    params,
  };
};
