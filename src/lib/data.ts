import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Website = Database["public"]["Tables"]["websites"]["Row"];
export type Audit = Database["public"]["Tables"]["audits"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Prefs = Database["public"]["Tables"]["notification_preferences"]["Row"];

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  displayValue: string | null;
  savingsMs?: number | null;
  score: number | null;
};

function unwrap<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export const useAudits = () =>
  useQuery({
    queryKey: ["audits"],
    queryFn: async () =>
      unwrap(await supabase.from("audits").select("*").order("created_at", { ascending: false }).limit(500)),
  });

export const useAudit = (id: string) =>
  useQuery({
    queryKey: ["audit", id],
    queryFn: async () => unwrap<Audit | null>((await supabase.from("audits").select("*").eq("id", id).maybeSingle()) as never),
  });

export const useWebsites = () =>
  useQuery({
    queryKey: ["websites"],
    queryFn: async () =>
      unwrap(await supabase.from("websites").select("*").order("created_at", { ascending: false })),
  });

export const useClients = () =>
  useQuery({
    queryKey: ["clients"],
    queryFn: async () =>
      unwrap(await supabase.from("clients").select("*").order("created_at", { ascending: false })),
  });

export const useProfile = (userId?: string) =>
  useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap<Profile | null>((await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle()) as never),
  });

export const usePrefs = (userId?: string) =>
  useQuery({
    queryKey: ["prefs", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap<Prefs | null>((await supabase.from("notification_preferences").select("*").eq("user_id", userId!).maybeSingle()) as never),
  });

type Tbl = "clients" | "websites" | "audits";

export function useUpsert(table: "clients" | "websites") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: Record<string, unknown> }) => {
      if (id) {
        unwrap(await supabase.from(table).update(values as never).eq("id", id).select());
      } else {
        unwrap(await supabase.from(table).insert(values as never).select());
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["websites"] });
    },
  });
}

export function useDelete(table: Tbl) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from(table).delete().eq("id", id).select());
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function friendlyDbError(msg: string) {
  if (/duplicate key|unique/i.test(msg)) return "That item already exists.";
  if (/check constraint/i.test(msg)) return "Some fields are too long or empty.";
  return "Something went wrong saving your changes. Please try again.";
}
