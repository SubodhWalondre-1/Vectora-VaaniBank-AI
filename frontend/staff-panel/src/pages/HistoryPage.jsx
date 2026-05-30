/*
   VaaniBank AI — Session History Page
   Union Bank of India | Team Vectora
   */

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { FileDown, Search, ArrowLeftRight } from "lucide-react";
import api, { summaryAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { INTENTS, LANGUAGES } from "../constants";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

const PAGE_SIZE = 20;
const FETCH_CHUNK = 100;

function parseMaybeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDuration(seconds) {
  const s = Number(seconds ?? 0);
  if (!Number.isFinite(s) || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

function formatDate(value) {
  const d = parseMaybeDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default function HistoryPage() {
  const activeSession = useApp((s) => s.activeSession);
  const exchanges = useApp((s) => s.exchanges);


  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [datePreset, setDatePreset] = useState("all"); // all | today | week | month | custom
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [languageCode, setLanguageCode] = useState("all");
  const [intentKey, setIntentKey] = useState("all");
  const [searchToken, setSearchToken] = useState("");

  const [page, setPage] = useState(1);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const [detailSummaryLoadingId, setDetailSummaryLoadingId] = useState(null);
  const [detailSummaries, setDetailSummaries] = useState({});
  const [detailExchanges, setDetailExchanges] = useState({});
  const [detailExchangesLoadingId, setDetailExchangesLoadingId] =
    useState(null);
  const [exportingSessionId, setExportingSessionId] = useState(null);

  const intentKeys = useMemo(() => Object.keys(INTENTS), []);

  const fetchAllSessions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const items = [];
      let p = 1;
      while (true) {
        const res = await api.get("/sessions/history", {
          params: {
            page: p,
            page_size: FETCH_CHUNK,
          },
        });

        const data = res?.data ?? {};
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        items.push(...sessions);

        const totalPages = Number(data.total_pages ?? 1);
        if (p >= totalPages) break;
        p += 1;
      }

      setAllSessions(items);
    } catch (err) {
      setFetchError(err?.message ?? "Failed to load session history");
      setAllSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSessions();
  }, [fetchAllSessions]);

  const dateBounds = useMemo(() => {
    const now = new Date();

    if (datePreset === "today") {
      return { start: startOfDay(now), end: endOfDay(now) };
    }

    if (datePreset === "week") {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { start: startOfDay(from), end: endOfDay(now) };
    }

    if (datePreset === "month") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfDay(from), end: endOfDay(to) };
    }

    if (datePreset === "custom") {
      const s = customStart ? new Date(customStart) : null;
      const e = customEnd ? new Date(customEnd) : null;
      if (!s || !e) return null;
      return { start: startOfDay(s), end: endOfDay(e) };
    }

    return null;
  }, [customEnd, customStart, datePreset]);

  const filteredSessions = useMemo(() => {
    const tokenQ = searchToken.trim().toLowerCase();

    return allSessions.filter((s) => {
      const sessionDate = s?.ended_at ?? s?.started_at ?? s?.created_at ?? null;
      const d = parseMaybeDate(sessionDate);
      if (dateBounds && (!d || d < dateBounds.start || d > dateBounds.end))
        return false;

      if (languageCode !== "all") {
        if ((s?.customer_language_code ?? "all") !== languageCode) return false;
      }

      if (intentKey !== "all") {
        if ((s?.intent_detected ?? "all") !== intentKey) return false;
      }

      if (tokenQ) {
        const tok = String(s?.token_number ?? "").toLowerCase();
        if (!tok.includes(tokenQ)) return false;
      }

      return true;
    });
  }, [allSessions, dateBounds, intentKey, languageCode, searchToken]);

  const totalPages = useMemo(() => {
    const total = filteredSessions.length;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [filteredSessions.length]);

  useEffect(() => {
    setPage(1);
    setExpandedSessionId(null);
  }, [
    datePreset,
    customStart,
    customEnd,
    intentKey,
    languageCode,
    searchToken,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedSessions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredSessions.slice(start, end);
  }, [filteredSessions, page]);

  const ensureDetailsFor = useCallback(
    async (sessionId) => {
      if (!sessionId) return;

      const summaryLoaded = Object.prototype.hasOwnProperty.call(
        detailSummaries,
        sessionId,
      );
      const exchangesLoaded = Object.prototype.hasOwnProperty.call(
        detailExchanges,
        sessionId,
      );

      if (!summaryLoaded) {
        setDetailSummaryLoadingId(sessionId);
        try {
          const summary = await summaryAPI.getSessionSummary(sessionId);
          setDetailSummaries((prev) => ({
            ...prev,
            [sessionId]: summary ?? null,
          }));
        } catch {
          setDetailSummaries((prev) => ({ ...prev, [sessionId]: null }));
        } finally {
          setDetailSummaryLoadingId(null);
        }
      }

      if (!exchangesLoaded) {
        setDetailExchangesLoadingId(sessionId);
        try {
          const res = await api.get(`/sessions/${sessionId}/exchanges`);
          const items = Array.isArray(res.data?.exchanges)
            ? res.data.exchanges
            : [];
          setDetailExchanges((prev) => ({
            ...prev,
            [sessionId]: items,
          }));
        } catch {
          setDetailExchanges((prev) => ({ ...prev, [sessionId]: [] }));
        } finally {
          setDetailExchangesLoadingId(null);
        }
      }
    },
    [detailSummaries, detailExchanges],
  );

  const handleToggleExpand = useCallback(
    async (session) => {
      const nextId = expandedSessionId === session.id ? null : session.id;
      setExpandedSessionId(nextId);
      if (!nextId) return;
      await ensureDetailsFor(session.id);
    },
    [expandedSessionId, ensureDetailsFor],
  );

  const handleExportPDF = useCallback(
    async (session) => {
      const sessionId = session?.id;
      if (!sessionId) return;

      setExportingSessionId(sessionId);
      try {
        // Single call — backend generates summary + PDF on the fly if needed
        const blob = await summaryAPI.downloadPDFBlob(sessionId);
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `VaaniBank_Summary_${session?.token_number ?? "session"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

        toast.success("PDF downloaded successfully! 📄");
      } catch (err) {
        console.error("[HistoryPage] PDF export error:", err);
        const detail =
          err?.response?.data?.detail ??
          err?.message ??
          "PDF export failed. Please try again.";
        toast.error(detail);
      } finally {
        setExportingSessionId(null);
      }
    },
    [],
  );




  const renderSessionStatus = useCallback((status) => {
    if (status === "completed") {
      return (
        <Badge variant="success" size="sm">
          Completed
        </Badge>
      );
    }
    if (status === "abandoned") {
      return (
        <Badge variant="error" size="sm">
          Abandoned
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        {String(status ?? "—")}
      </Badge>
    );
  }, []);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--body-bg)" }}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Session History
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Filter, expand sessions, and export bilingual PDFs.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              border: "1px solid var(--border-color, rgba(0,48,135,0.10))",
              background: "var(--card-bg)",
            }}
          >
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[180px]">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Date
                </label>
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--body-bg)",
                    border:
                      "1px solid var(--border-color, rgba(0,48,135,0.15))",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {datePreset === "custom" && (
                <>
                  <div className="min-w-[170px]">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      From
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{
                        background: "var(--body-bg)",
                        border:
                          "1px solid var(--border-color, rgba(0,48,135,0.15))",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div className="min-w-[170px]">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      To
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{
                        background: "var(--body-bg)",
                        border:
                          "1px solid var(--border-color, rgba(0,48,135,0.15))",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </>
              )}

              <div className="min-w-[180px]">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Language
                </label>
                <select
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--body-bg)",
                    border:
                      "1px solid var(--border-color, rgba(0,48,135,0.15))",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All languages</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[190px]">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Intent
                </label>
                <select
                  value={intentKey}
                  onChange={(e) => setIntentKey(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--body-bg)",
                    border:
                      "1px solid var(--border-color, rgba(0,48,135,0.15))",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All intents</option>
                  {intentKeys.map((k) => (
                    <option key={k} value={k}>
                      {INTENTS[k]?.label ?? k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[220px]">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Search by token
                </label>
                <div
                  className="flex items-center gap-2 mt-1 rounded-xl px-3 py-2"
                  style={{
                    background: "var(--body-bg)",
                    border:
                      "1px solid var(--border-color, rgba(0,48,135,0.15))",
                  }}
                >
                  <Search size={16} style={{ color: "var(--text-muted)" }} />
                  <input
                    value={searchToken}
                    onChange={(e) => setSearchToken(e.target.value)}
                    placeholder="e.g. MRT-2847"
                    className="w-full outline-none text-sm"
                    style={{
                      background: "transparent",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--border-color, rgba(0,48,135,0.10))",
              background: "var(--card-bg)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between gap-4"
              style={{
                borderBottom:
                  "1px solid var(--border-color, rgba(0,48,135,0.08))",
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight
                  size={16}
                  style={{ color: "var(--text-muted)" }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {filteredSessions.length} session
                  {filteredSessions.length === 1 ? "" : "s"} found
                </p>
              </div>

              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,48,135,0.04)" }}>
                    {[
                      "Token",
                      "Language",
                      "Intent",
                      "Sentiment",
                      "Duration",
                      "Exchanges",
                      "Date",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold px-4 py-3"
                        style={{
                          color: "var(--text-muted)",
                          borderBottom:
                            "1px solid var(--border-color, rgba(0,48,135,0.08))",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <tr key={`sk-${i}`}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td
                            key={`sk-${i}-${j}`}
                            className="px-4 py-4"
                            style={{
                              borderBottom: "1px solid rgba(0,48,135,0.06)",
                            }}
                          >
                            <div
                              style={{
                                height: 12,
                                width: `${60 + ((i + j) % 4) * 10}%`,
                                borderRadius: 8,
                                background: "rgba(148,163,184,0.20)",
                                animation:
                                  "skeleton-pulse 1.2s ease-in-out infinite",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <style>{`
                      @keyframes skeleton-pulse {
                        0% { opacity: 0.55; }
                        50% { opacity: 0.95; }
                        100% { opacity: 0.55; }
                      }
                    `}</style>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center">
                          <p
                            style={{ color: "var(--text-muted)" }}
                            className="text-sm font-semibold"
                          >
                            No sessions found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence initial={false}>
                        {paginatedSessions.map((s, idx) => {
                          const isExpanded = expandedSessionId === s.id;
                          const isActive = activeSession?.id === s.id;
                          const detailSummary = detailSummaries[s.id];
                          const isSummaryLoading =
                            detailSummaryLoadingId === s.id;
                          const statusBadge = renderSessionStatus(s.status);

                          return (
                            <Fragment key={s.id}>
                              <motion.tr
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{
                                  duration: 0.18,
                                  delay: idx * 0.01,
                                }}
                                onClick={() => handleToggleExpand(s)}
                                style={{ cursor: "pointer" }}
                              >
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {s.token_number}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {s.customer_language ?? "—"}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {s.intent_detected
                                      ? (INTENTS[s.intent_detected]?.label ??
                                        s.intent_detected)
                                      : "—"}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {s.sentiment_overall ?? "—"}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {formatDuration(s.duration_seconds)}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {s.total_exchanges ?? 0}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {formatDate(
                                      s.ended_at ??
                                        s.started_at ??
                                        s.created_at,
                                    )}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-4"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(0,48,135,0.06)",
                                  }}
                                >
                                  {statusBadge}
                                </td>
                              </motion.tr>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.tr
                                    key={`detail-${s.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <td colSpan={8} className="p-0">
                                      <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                          padding: 16,
                                          background: "rgba(0,48,135,0.02)",
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                          <div className="min-w-[240px]">
                                            <p
                                              className="text-xs font-bold uppercase tracking-wider"
                                              style={{
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              Session Details
                                            </p>
                                            <p
                                              className="text-sm font-semibold mt-2"
                                              style={{
                                                color: "var(--text-primary)",
                                              }}
                                            >
                                              {s.token_number} •{" "}
                                              {s.customer_language ?? "—"}
                                            </p>
                                            <p
                                              className="text-xs mt-1"
                                              style={{
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              Intent:{" "}
                                              {s.intent_detected
                                                ? (INTENTS[s.intent_detected]
                                                    ?.label ??
                                                  s.intent_detected)
                                                : "—"}{" "}
                                              • Sentiment:{" "}
                                              {s.sentiment_overall ?? "—"}
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="danger"
                                              size="sm"
                                              icon={FileDown}
                                              onClick={() => handleExportPDF(s)}
                                              disabled={
                                                exportingSessionId === s.id
                                              }
                                            >
                                              Export PDF
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div
                                            className="rounded-2xl p-4"
                                            style={{
                                              border:
                                                "1px solid var(--border-color, rgba(0,48,135,0.10))",
                                              background: "var(--body-bg)",
                                            }}
                                          >
                                            <p
                                              className="text-xs font-bold uppercase tracking-wider"
                                              style={{
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              Summary
                                            </p>

                                            {isSummaryLoading ? (
                                              <div className="mt-3 flex items-center gap-2">
                                                <Spinner size="sm" />
                                                <span
                                                  className="text-sm"
                                                  style={{
                                                    color: "var(--text-muted)",
                                                  }}
                                                >
                                                  Loading summary…
                                                </span>
                                              </div>
                                            ) : detailSummary ? (
                                              <div className="mt-3 flex flex-col gap-3">
                                                <div>
                                                  <p
                                                    className="text-sm font-semibold"
                                                    style={{
                                                      color:
                                                        "var(--text-primary)",
                                                    }}
                                                  >
                                                    Key Points
                                                  </p>
                                                  <div className="mt-2 grid gap-2">
                                                    {Array.from({
                                                      length: Math.max(
                                                        detailSummary
                                                          .key_points_hindi
                                                          .length,
                                                        detailSummary
                                                          .key_points_customer
                                                          .length,
                                                        1,
                                                      ),
                                                    }).map((_, i) => (
                                                      <div
                                                        key={`kp-${s.id}-${i}`}
                                                        className="grid grid-cols-2 gap-2"
                                                      >
                                                        <div
                                                          className="px-3 py-2 rounded-xl"
                                                          style={{
                                                            background:
                                                              "rgba(0,48,135,0.05)",
                                                            border:
                                                              "1px solid rgba(0,48,135,0.10)",
                                                          }}
                                                        >
                                                          <p
                                                            className="text-xs font-semibold"
                                                            style={{
                                                              color:
                                                                "var(--blue, #003087)",
                                                            }}
                                                          >
                                                            Hindi
                                                          </p>
                                                          <p
                                                            className="text-sm"
                                                            style={{
                                                              color:
                                                                "var(--text-primary)",
                                                            }}
                                                          >
                                                            {detailSummary
                                                              .key_points_hindi[
                                                              i
                                                            ] ?? "—"}
                                                          </p>
                                                        </div>
                                                        <div
                                                          className="px-3 py-2 rounded-xl"
                                                          style={{
                                                            background:
                                                              "rgba(232,35,26,0.03)",
                                                            border:
                                                              "1px solid rgba(232,35,26,0.08)",
                                                          }}
                                                        >
                                                          <p
                                                            className="text-xs font-semibold"
                                                            style={{
                                                              color:
                                                                "var(--red, #E8231A)",
                                                            }}
                                                          >
                                                            {s.customer_language ??
                                                              "Customer"}
                                                          </p>
                                                          <p
                                                            className="text-sm"
                                                            style={{
                                                              color:
                                                                "var(--text-primary)",
                                                            }}
                                                          >
                                                            {detailSummary
                                                              .key_points_customer[
                                                              i
                                                            ] ?? "—"}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>

                                                <div>
                                                  <p
                                                    className="text-sm font-semibold"
                                                    style={{
                                                      color:
                                                        "var(--text-primary)",
                                                    }}
                                                  >
                                                    Next Steps
                                                  </p>
                                                  <div className="mt-2 grid gap-2">
                                                    {Array.from({
                                                      length: Math.max(
                                                        detailSummary
                                                          .next_steps_hindi
                                                          .length,
                                                        detailSummary
                                                          .next_steps_customer
                                                          .length,
                                                        1,
                                                      ),
                                                    }).map((_, i) => (
                                                      <div
                                                        key={`ns-${s.id}-${i}`}
                                                        className="grid grid-cols-2 gap-2"
                                                      >
                                                        <div
                                                          className="px-3 py-2 rounded-xl"
                                                          style={{
                                                            background:
                                                              "rgba(0,48,135,0.04)",
                                                            border:
                                                              "1px solid rgba(0,48,135,0.08)",
                                                          }}
                                                        >
                                                          <p
                                                            className="text-xs font-semibold"
                                                            style={{
                                                              color:
                                                                "var(--blue, #003087)",
                                                            }}
                                                          >
                                                            Hindi
                                                          </p>
                                                          <p
                                                            className="text-sm"
                                                            style={{
                                                              color:
                                                                "var(--text-primary)",
                                                            }}
                                                          >
                                                            {detailSummary
                                                              .next_steps_hindi[
                                                              i
                                                            ] ?? "—"}
                                                          </p>
                                                        </div>
                                                        <div
                                                          className="px-3 py-2 rounded-xl"
                                                          style={{
                                                            background:
                                                              "rgba(232,35,26,0.03)",
                                                            border:
                                                              "1px solid rgba(232,35,26,0.08)",
                                                          }}
                                                        >
                                                          <p
                                                            className="text-xs font-semibold"
                                                            style={{
                                                              color:
                                                                "var(--red, #E8231A)",
                                                            }}
                                                          >
                                                            {s.customer_language ??
                                                              "Customer"}
                                                          </p>
                                                          <p
                                                            className="text-sm"
                                                            style={{
                                                              color:
                                                                "var(--text-primary)",
                                                            }}
                                                          >
                                                            {detailSummary
                                                              .next_steps_customer[
                                                              i
                                                            ] ?? "—"}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>

                                                {!detailSummary.pdf_generated && (
                                                  <p
                                                    className="text-xs"
                                                    style={{
                                                      color:
                                                        "var(--text-muted)",
                                                    }}
                                                  >
                                                    PDF generation pending. Use
                                                    “Export PDF” to generate.
                                                  </p>
                                                )}
                                              </div>
                                            ) : (
                                              <p
                                                className="text-sm mt-3"
                                                style={{
                                                  color: "var(--text-muted)",
                                                }}
                                              >
                                                Summary not generated yet.
                                              </p>
                                            )}
                                          </div>

                                          <div
                                            className="rounded-2xl p-4"
                                            style={{
                                              border:
                                                "1px solid var(--border-color, rgba(0,48,135,0.10))",
                                              background: "var(--body-bg)",
                                            }}
                                          >
                                            <p
                                              className="text-xs font-bold uppercase tracking-wider"
                                              style={{
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              Exchanges
                                            </p>

                                            {detailExchangesLoadingId === s.id ? (
                                              <div className="mt-3 flex items-center gap-2">
                                                <Spinner size="sm" />
                                                <span
                                                  className="text-sm"
                                                  style={{
                                                    color: "var(--text-muted)",
                                                  }}
                                                >
                                                  Loading conversation…
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="mt-3 flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                                {(detailExchanges[s.id] || []).length > 0 ? (
                                                  (detailExchanges[s.id] || []).map((ex, i) => {
                                                    const isStaff = ex.direction === "staff_to_customer";
                                                    const shownText = isStaff
                                                      ? ex.staff_original_text || ex.staff_response_final
                                                      : ex.customer_text_original || ex.text_original;

                                                    return (
                                                      <div
                                                        key={`ex-hist-${s.id}-${i}`}
                                                        className={`flex flex-col gap-1 p-3 rounded-xl ${
                                                          isStaff
                                                            ? "items-end bg-blue-50/30 border border-blue-100/50"
                                                            : "items-start bg-slate-50 border border-slate-100"
                                                        }`}
                                                      >
                                                        <div className="flex items-center gap-1.5">
                                                          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                                            {isStaff ? "Staff" : "Customer"}
                                                          </span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                                          {shownText}
                                                        </p>
                                                        {ex.text_translated && !isStaff && (
                                                          <p className="text-xs italic opacity-60 mt-0.5" style={{ color: "var(--text-primary)" }}>
                                                            {ex.text_translated}
                                                          </p>
                                                        )}
                                                      </div>
                                                    );
                                                  })
                                                ) : (
                                                  <p className="text-sm text-slate-400 italic">
                                                    No messages recorded for this session.
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    </td>
                                  </motion.tr>
                                )}
                              </AnimatePresence>
                            </Fragment>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </tbody>
                )}
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredSessions.length)} of{" "}
              {filteredSessions.length}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>

          {fetchError && (
            <div
              className="mt-4 text-sm"
              style={{ color: "var(--accent-red)", fontWeight: 600 }}
            >
              {fetchError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
