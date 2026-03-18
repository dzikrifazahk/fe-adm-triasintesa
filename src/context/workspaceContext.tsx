"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useParams, usePathname } from "next/navigation";
import { IProject } from "@/types/project";
import { projectService } from "@/services";

interface WorkspaceContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  workspaceCode: string;
  setWorkspaceCode: React.Dispatch<React.SetStateAction<string>>;

  projectName: string;
  setProjectName: React.Dispatch<React.SetStateAction<string>>;

  project: IProject | null;
  loading: boolean;
  error: string | null;

  refreshProject: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

type ParamsShape = { workspace?: string; lang?: string };

const nameCacheKey = (code: string) => `ws:${code}:projectName`;
const objCacheKey = (code: string) => `ws:${code}:projectObj`;

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams() as ParamsShape;
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("ui:isCollapsed") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("ui:isCollapsed", isCollapsed ? "1" : "0");
    } catch {}
  }, [isCollapsed]);

  const [workspaceCode, setWorkspaceCode] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentReqId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readCache = (code: string) => {
    try {
      const n = sessionStorage.getItem(nameCacheKey(code));
      const o = sessionStorage.getItem(objCacheKey(code));
      return {
        name: n || "",
        obj: o ? (JSON.parse(o) as IProject) : null,
      };
    } catch {
      return { name: "", obj: null as IProject | null };
    }
  };

  const writeCache = (code: string, name: string, obj: IProject | null) => {
    try {
      sessionStorage.setItem(nameCacheKey(code), name ?? "");
      if (obj) sessionStorage.setItem(objCacheKey(code), JSON.stringify(obj));
    } catch {}
  };

  const doFetch = async (code: string, reqId: number) => {
    setLoading(true);
    setError(null);

    const cached = readCache(code);
    if (cached.name || cached.obj) {
      setProjectName(cached.name || cached.obj?.name || "");
      setProject(cached.obj);
    }

    try {
      const { data } = await projectService.getProject(String(code));

      const proj: IProject | null = Array.isArray(data)
        ? data[0] ?? null
        : null;

      if (reqId !== currentReqId.current) return;

      setProject(proj);
      setProjectName(proj?.name ?? "");
      writeCache(code, proj?.name ?? "", proj);
    } catch (e: any) {
      if (reqId !== currentReqId.current) return;
      setError(e?.message ?? "Failed to fetch project.");

      if (!cached.name && !cached.obj) {
        setProject(null);
        setProjectName("");
      }
    } finally {
      if (reqId === currentReqId.current) setLoading(false);
    }
  };

  const refreshProject = async () => {
    const code = (params?.workspace ?? "").toString();
    if (!code) return;
    currentReqId.current += 1;
    const reqId = currentReqId.current;
    await doFetch(code, reqId);
  };

  // sinkron setiap kali segmen [workspace] berubah
  useEffect(() => {
    const codeFromUrl = (params?.workspace ?? "").toString();

    // reset jika kosong
    if (!codeFromUrl) {
      setWorkspaceCode("");
      setProjectName("");
      setProject(null);
      setError(null);
      setLoading(false);
      return;
    }

    setWorkspaceCode(codeFromUrl);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      currentReqId.current += 1;
      const reqId = currentReqId.current;
      doFetch(codeFromUrl, reqId);
    }, 120);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [pathname, params?.workspace]);

  const value = useMemo<WorkspaceContextType>(
    () => ({
      isCollapsed,
      setIsCollapsed,
      workspaceCode,
      setWorkspaceCode,
      projectName,
      setProjectName,
      project,
      loading,
      error,
      refreshProject,
    }),
    [isCollapsed, workspaceCode, projectName, project, loading, error]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = (): WorkspaceContextType => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider"
    );
  }
  return ctx;
};
