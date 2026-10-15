import { useCallback, useEffect, useRef, useState } from "react";
import { tasksApi } from "../api/tasks";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [phase, setPhase] = useState("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const serial = useRef(0);
  const read = useRef(null);
  const lock = useRef(false);
  const mounted = useRef(true);

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    const id = ++serial.current;
    read.current?.abort();
    const controller = new AbortController();
    read.current = controller;
    setRefreshing(true);
    if (!quiet) setPhase("loading");
    setListError(null);
    try {
      const result = await tasksApi.list(controller.signal);
      if (id !== serial.current || !mounted.current) return false;
      setTasks(result);
      setPhase("success");
      setNeedsRefresh(false);
      return true;
    } catch (error) {
      if (
        error.name === "AbortError" ||
        id !== serial.current ||
        !mounted.current
      )
        return false;
      setListError(error.message);
      setPhase("error");
      return false;
    } finally {
      if (id === serial.current && mounted.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
      ++serial.current;
      read.current?.abort();
    };
  }, [refresh]);

  const mutate = async (kind, id, input) => {
    if (lock.current || needsRefresh) return null;
    lock.current = true;
    ++serial.current;
    read.current?.abort();
    setRefreshing(false);
    setBusy({ kind, id });
    setNotice(null);
    try {
      const result =
        kind === "create"
          ? await tasksApi.create(input)
          : kind === "delete"
            ? await tasksApi.remove(id)
            : await tasksApi.update(id, input);
      if (!mounted.current) return null;
      setTasks((previous) =>
        kind === "delete"
          ? previous.filter((item) => item.id !== id)
          : kind === "create"
            ? [result, ...previous]
            : previous.map((item) => (item.id === id ? result : item)),
      );
      setPhase("success");
      setNotice({
        kind: "success",
        message:
          kind === "create"
            ? "Task created. A little more clarity."
            : kind === "delete"
              ? "Task deleted."
              : kind === "status"
                ? `Task moved to ${result.status}.`
                : "Changes saved.",
      });
      void refresh({ quiet: true });
      return result;
    } catch (error) {
      if (mounted.current) {
        if (error.unknownOutcome) setNeedsRefresh(true);
        setNotice({ kind: "error", message: error.message });
        if (error.status === 404) void refresh({ quiet: true });
      }
      throw error;
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(null);
    }
  };
  return {
    tasks,
    phase,
    refreshing,
    listError,
    busy,
    notice,
    needsRefresh,
    refresh,
    mutate,
    dismissNotice: () => setNotice(null),
  };
}
