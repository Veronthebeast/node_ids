/**
 * Zustand store for project list management.
 *
 * @remarks
 * Holds the set of projects the current user has access to, which
 * project is currently active, and a loading flag so the UI can show
 * a spinner during fetch.
 *
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project } from '@/types/project';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapDbToProject(db: any): Project {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    ownerId: db.owner_id,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface ProjectsState {
  /** All projects visible to the current user. */
  projects: Project[];
  /** ID of the project currently open in the workspace (`null` = no project open). */
  currentProjectId: string | null;
  /** Whether the project list is being fetched. */
  isLoading: boolean;

  // ---- Actions -----------------------------------------------------------

  /** Replace the project list entirely. */
  setProjects: (projects: Project[]) => void;
  /** Set the currently active project ID. */
  setCurrentProject: (id: string | null) => void;
  /** Prepend a newly-created project. */
  addProject: (project: Project) => void;
  /** Merge updates into the matching project. */
  updateProject: (id: string, data: Partial<Project>) => void;
  /** Remove a project from the list (does NOT touch the backend). */
  removeProject: (id: string) => void;
  /** Toggle the loading flag. */
  setLoading: (loading: boolean) => void;

  // ---- Database Actions --------------------------------------------------

  /** Fetch projects for the logged in user from Supabase. */
  fetchProjects: () => Promise<void>;
  /** Create a new project in Supabase. */
  createProject: (name: string, description: string) => Promise<string | null>;
  /** Update a project in Supabase. */
  updateProjectDb: (id: string, name: string, description: string) => Promise<void>;
  /** Delete a project from Supabase. */
  deleteProjectDb: (id: string) => Promise<void>;

  // ---- Sharing Database Actions ------------------------------------------

  /** Invite a user by email to share access. */
  shareProject: (projectId: string, email: string, permission: 'read' | 'write') => Promise<boolean>;
  /** Fetch all shares/invitations for a project. */
  fetchProjectShares: (projectId: string) => Promise<any[]>;
  /** Revoke share access for a user. */
  removeProjectShare: (shareId: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useProjectsStore = create<ProjectsState>()(
  immer((set, get) => ({
    projects: [],
    currentProjectId: null,
    isLoading: false,

    setProjects: (projects) => {
      set((state) => {
        state.projects = projects;
      });
    },

    setCurrentProject: (id) => {
      set((state) => {
        state.currentProjectId = id;
      });
    },

    addProject: (project) => {
      set((state) => {
        state.projects.unshift(project); // Prepend for immediate listing
      });
    },

    updateProject: (id, data) => {
      set((state) => {
        const project = state.projects.find((p) => p.id === id);
        if (project) {
          Object.assign(project, data);
        }
      });
    },

    removeProject: (id) => {
      set((state) => {
        state.projects = state.projects.filter((p) => p.id !== id);
        if (state.currentProjectId === id) {
          state.currentProjectId = null;
        }
      });
    },

    setLoading: (loading) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    fetchProjects: async () => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);

        const projects = (data || []).map(mapDbToProject);
        set((state) => {
          state.projects = projects;
        });
      } catch (err: any) {
        console.error('Error fetching projects:', err?.message || err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    createProject: async (name, description) => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User must be authenticated to create a project');
        }

        const id = nanoid();
        const now = new Date().toISOString();

        const { error } = await supabase.from('projects').insert({
          id,
          name,
          description,
          owner_id: user.id,
          created_at: now,
          updated_at: now,
        });

        if (error) throw error;

        const newProject: Project = {
          id,
          name,
          description,
          ownerId: user.id,
          createdAt: now,
          updatedAt: now,
        };

        get().addProject(newProject);
        return id;
      } catch (err) {
        console.error('Error creating project:', err);
        return null;
      }
    },

    updateProjectDb: async (id, name, description) => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error } = await supabase
          .from('projects')
          .update({
            name,
            description,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;

        get().updateProject(id, { name, description, updatedAt: now });
      } catch (err) {
        console.error('Error updating project:', err);
      }
    },

    deleteProjectDb: async (id) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('projects').delete().eq('id', id);

        if (error) throw error;

        get().removeProject(id);
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    },

    // ---- Sharing Database Actions ----

    shareProject: async (projectId, email, permission) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('project_shares').insert({
          project_id: projectId,
          user_email: email,
          permission,
        });
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error sharing project:', err);
        return false;
      }
    },

    fetchProjectShares: async (projectId) => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('project_shares')
          .select('*')
          .eq('project_id', projectId);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching project shares:', err);
        return [];
      }
    },

    removeProjectShare: async (shareId) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('project_shares')
          .delete()
          .eq('id', shareId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error removing project share:', err);
        return false;
      }
    },
  })),
);
