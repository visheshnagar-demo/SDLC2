import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { useAuth, ROLES } from "./AuthContext";

const SubmissionContext = createContext(null);

export function SubmissionProvider({ children }) {
  const { currentRole, currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filters, setFilters] = useState({
    status: "All",
    lineOfBusiness: "All",
    search: "",
  });

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSubmissions(filters);
      let list = res.items || [];
      // Role based scoping: Cedent sees only their company's submissions
      if (currentRole === ROLES.CEDENT) {
        list = list.filter(
          (item) =>
            item.cedingCompanyName
              .toLowerCase()
              .includes(currentUser.organization.toLowerCase()) ||
            item.cedingCompanyName.toLowerCase().includes("travelers"),
        );
      }
      setSubmissions(list);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions queue.");
    } finally {
      setLoading(false);
    }
  }, [filters, currentRole, currentUser]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const refreshSubmissions = () => {
    return fetchSubmissions();
  };

  const getSubmission = async (id) => {
    try {
      const item = await api.getSubmissionById(id);
      setSelectedSubmission(item);
      return item;
    } catch (err) {
      console.error("Error getting submission:", err);
      return null;
    }
  };

  return (
    <SubmissionContext.Provider
      value={{
        submissions,
        loading,
        error,
        filters,
        setFilters,
        selectedSubmission,
        setSelectedSubmission,
        getSubmission,
        refreshSubmissions,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmissions() {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error("useSubmissions must be used within a SubmissionProvider");
  }
  return context;
}
