import { create } from "zustand";

interface DisplayProject {
  id: string;
  name: string;
  url: string;
  desc: string;
  color: string;
  status: "active" | "paused";
  platforms: string[];
}

interface ProjectsStore {
  projects: DisplayProject[];
  user: { name: string; email: string } | null;
  loaded: boolean;
  setProjects: (projects: DisplayProject[]) => void;
  setUser: (user: { name: string; email: string }) => void;
  setLoaded: (loaded: boolean) => void;
  reset: () => void;
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  user: null,
  loaded: false,
  setProjects: (projects) => set({ projects }),
  setUser: (user) => set({ user }),
  setLoaded: (loaded) => set({ loaded }),
  reset: () => set({ projects: [], user: null, loaded: false }),
}));
