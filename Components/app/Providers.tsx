"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { curriculum, termCatalog, getDataset } from "@/lib/data/loaders";
import {
  IndexedProfileRepository,
  emptyProfile,
} from "@/lib/persistence/repository";
import type {
  Locale,
  StudentProfile,
  TermDataset,
  PulseAggregate,
} from "@/lib/domain/types";
import { translate, dynamicKey, type MessageKey } from "@/lib/i18n";
type State = {
  pulse: PulseAggregate[];
  setPulse: (p: PulseAggregate[]) => void;
  profile: StudentProfile;
  update: (fn: (p: StudentProfile) => StudentProfile) => Promise<void>;
  reset: () => Promise<void>;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
  mt: (key: string) => string;
  termId: string;
  setTermId: (id: string) => void;
  dataset: TermDataset | null;
  storage: "saved" | "saving" | "memory" | "error";
  ready: boolean;
};
const Context = createContext<State | null>(null);
export function Providers({ children }: { children: React.ReactNode }) {
  const [pulse, setPulse] = useState<PulseAggregate[]>([]);
  const [profile, setProfile] = useState(() => emptyProfile(curriculum)),
    [ready, setReady] = useState(false),
    [locale, setLocaleState] = useState<Locale>("en"),
    [termId, setTermIdState] = useState(termCatalog[0].id),
    [storage, setStorage] = useState<State["storage"]>("saved");
  const repo = useRef<IndexedProfileRepository | undefined>(undefined),
    current = useRef(profile),
    queue = useRef(Promise.resolve()),
    memory = useRef(false);
  useEffect(() => {
    let alive = true;
    repo.current = new IndexedProfileRepository(curriculum);
    try {
      setLocaleState(
        localStorage.getItem("schedulehaw-locale") === "de" ||
          (!localStorage.getItem("schedulehaw-locale") &&
            navigator.language.startsWith("de"))
          ? "de"
          : "en",
      );
      const term = localStorage.getItem("schedulehaw-term");
      if (termCatalog.some((x) => x.id === term)) setTermIdState(term!);
    } catch {}
    repo.current
      .load()
      .then((p) => {
        if (alive && p) {
          current.current = p;
          setProfile(p);
        }
      })
      .catch(() => {
        memory.current = true;
        setStorage("memory");
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    const onStorage = (event: StorageEvent) => {
      if (event.key === "schedulehaw-revision") {
        if (event.newValue?.startsWith("reset:"))
          try {
            sessionStorage.removeItem("schedulehaw-undo");
          } catch {}
        repo.current
          ?.load()
          .then((p) => {
            current.current = p || emptyProfile(curriculum);
            setProfile(current.current);
          })
          .catch(() => setStorage("error"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const update = useCallback((fn: (p: StudentProfile) => StudentProfile) => {
    const task = queue.current
      .catch(() => {})
      .then(async () => {
        setStorage(memory.current ? "memory" : "saving");
        const next = fn(current.current);
        try {
          const saved = memory.current
            ? {
                ...next,
                revision: current.current.revision + 1,
                updatedAt: new Date().toISOString(),
              }
            : await repo.current!.save(next, current.current.revision);
          current.current = saved;
          setProfile(saved);
          setStorage(memory.current ? "memory" : "saved");
          try {
            localStorage.setItem(
              "schedulehaw-revision",
              saved.revision + ":" + saved.updatedAt,
            );
          } catch {}
        } catch (e) {
          setStorage("error");
          throw e;
        }
      });
    queue.current = task;
    return task;
  }, []);
  const reset = useCallback(async () => {
    await queue.current.catch(() => {});
    if (!memory.current) await repo.current!.clear();
    try {
      sessionStorage.removeItem("schedulehaw-undo");
    } catch {}
    current.current = emptyProfile(curriculum);
    setProfile(current.current);
    try {
      localStorage.setItem("schedulehaw-revision", "reset:" + Date.now());
    } catch {}
  }, []);
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("schedulehaw-locale", l);
    } catch {}
  };
  const setTermId = (id: string) => {
    setTermIdState(id);
    try {
      localStorage.setItem("schedulehaw-term", id);
    } catch {}
  };
  const value: State = {
    pulse,
    setPulse,
    profile,
    update,
    reset,
    locale,
    setLocale,
    t: (key) => translate(locale, key),
    mt: (key) => translate(locale, dynamicKey(key)),
    termId,
    setTermId,
    dataset: getDataset(termId),
    storage,
    ready,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("MISSING_PROVIDER");
  return value;
}
