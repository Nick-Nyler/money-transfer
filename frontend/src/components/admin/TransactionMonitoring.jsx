"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTransactions } from "../../features/transactions/transactionsSlice";
import { api } from "../../api";
import LoadingSpinner from "../common/LoadingSpinner";

const TransactionMonitoring = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { allTransactions, status, error } = useSelector((state) => state.transactions);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [filters, setLocalFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all",
    searchTerm: "",
    userId: "all",
  });
  const [sorting, setLocalSorting] = useState({
    field: "createdAt",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentUser?.role === "admin") {
      dispatch(fetchAllTransactions());

      setUsersLoading(true);
      api
        .getAllUsers()
        .then((response) => {
          setUsers(response.users);
        })
        .finally(() => setUsersLoading(false));
    }
  }, [dispatch, currentUser]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...filters, [name]: value });
  };

  const handleSortChange = (e) => {
    const [field, direction] = e.target.value.split("-");
    setLocalSorting({ field, direction });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLocalFilters({ ...filters, searchTerm });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocalFilters({
      type: "all",
      status: "all",
      dateRange: "all",
      searchTerm: "",
      userId: "all",
    });
    setLocalSorting({
      field: "createdAt",
      direction: "desc",
    });
  };

  const handleReverse = async (transactionId) => {
    try {
      await api.reverseTransaction(transactionId);
      dispatch(fetchAllTransactions());
    } catch (err) {
      console.error("Reverse failed:", err);
    }
  };

  // Filtering
  const filteredTransactions = allTransactions.filter((tx) => {
    if (filters.type !== "all" && tx.type !== filters.type) return false;
    if (filters.status !== "all" && tx.status !== filters.status) return false;

    const userId = tx.user_id ?? tx.userId;
    if (filters.userId !== "all" && userId !== Number(filters.userId)) return false;

    const dateVal = tx.created_at ?? tx.createdAt;
    if (filters.dateRange !== "all" && dateVal) {
      const txDate = new Date(dateVal);
      const today = new Date();
      if (filters.dateRange === "today") {
        if (
          txDate.getDate() !== today.getDate() ||
          txDate.getMonth() !== today.getMonth() ||
          txDate.getFullYear() !== today.getFullYear()
        )
          return false;
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        if (txDate < weekAgo) return false;
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        if (txDate < monthAgo) return false;
      }
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const description = (tx.description || "").toLowerCase();
      const recipient = (tx.recipient_name || tx.recipientName || "").toLowerCase();
      const amount = String(tx.amount || "");
      const userName =
        tx.user_name ||
        (() => {
          const u = users.find((u) => u.id === userId);
          return u ? `${u.firstName} ${u.lastName}` : "";
        })().toLowerCase();

      if (
        !description.includes(term) &&
        !recipient.includes(term) &&
        !amount.includes(term) &&
        !userName.includes(term)
      )
        return false;
    }

    return true;
  });

  // Sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sorting.field === "createdAt") {
      const ad = new Date(a.created_at ?? a.createdAt);
      const bd = new Date(b.created_at ?? b.createdAt);
      return sorting.direction === "asc" ? ad - bd : bd - ad;
    }
    if (sorting.field === "amount") {
      return sorting.direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sorting.field === "userId") {
      const ai = a.user_id ?? a.userId;
      const bi = b.user_id ?? b.userId;
      return sorting.direction === "asc" ? ai - bi : bi - ai;
    }
    return 0;
  });

  if (status === "loading" || usersLoading) return <LoadingSpinner />;

  return (
    <div className="transaction-monitoring-container">
      <h1>Transaction Monitoring</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="monitoring-stats">
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-value">{allTransactions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Volume</h3>
          <p className="stat-value">
            KES {allTransactions.reduce((s, t) => s + Number(t.amount), 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Fees</h3>
          <p className="stat-value">
            KES {allTransactions.reduce((s, t) => s + Number(t.fee), 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Filtered Results</h3>
          <p className="stat-value">{sortedTransactions.length}</p>
        </div>
      </div>

      <div className="filters-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
        {/* Add other filter controls here: type, status, user, dateRange, sort, clear */}
      </div>

      {sortedTransactions.length > 0 ? (
        <div className="transactions-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Recipient</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((tx) => {
                const userId = tx.user_id ?? tx.userId;
                const userName =
                  tx.user_name ||
                  (() => {
                    const u = users.find((u) => u.id === userId);
                    return u ? `${u.firstName} ${u.lastName}` : "Unknown";
                  })();
                const formattedDate = tx.created_at
                  ? new Date(tx.created_at).toLocaleString()
                  : tx.createdAt
                  ? new Date(tx.createdAt).toLocaleString()
                  : "-";

                return (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{userName}</td>
                    <td>
                      <span className={`transaction-type ${tx.type}`}>{tx.type}</span>
                    </td>
                    <td>KES {Number(tx.amount).toLocaleString()}</td>
                    <td>KES {Number(tx.fee).toLocaleString()}</td>
                    <td>
                      {tx.recipient_name || tx.recipientName ? (
                        <div>
                          <div>{tx.recipient_name || tx.recipientName}</div>
                          <small>{tx.recipient_phone || tx.recipientPhone}</small>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{tx.description || "-"}</td>
                    <td>{formattedDate}</td>
                    <td>
                      <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                    </td>
                    <td>
                      {tx.type.toLowerCase() === "send" &&
                       tx.status.toLowerCase() === "completed" && (
                        <button
                          onClick={() => handleReverse(tx.id)}
                          className="btn btn-outline btn-sm"
                        >
                          Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No transactions found matching your filters.</p>
          {(filters.type !== "all" ||
            filters.status !== "all" ||
            filters.dateRange !== "all" ||
            filters.userId !== "all" ||
            filters.searchTerm) && (
            <button className="btn btn-outline" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionMonitoring;
