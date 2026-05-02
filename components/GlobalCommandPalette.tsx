"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { Search } from "lucide-react";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
  section: "Navigation" | "People Lists" | "Company Lists" | "Movements";
};

function matchesQuery(item: CommandItem, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  const normalizedQuery = query.toLowerCase();
  const haystack = [item.label, item.description, item.href, ...item.keywords].join(" ").toLowerCase();
  return haystack.includes(normalizedQuery);
}

export default function GlobalCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: peopleLists = [] } = trpc.peopleLists.getAll.useQuery();
  const { data: companyLists = [] } = trpc.companyLists.getAll.useQuery();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo<CommandItem[]>(() => {
    const base: CommandItem[] = [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        description: "Go to dashboard overview",
        href: "/app",
        keywords: ["home", "overview"],
        section: "Navigation",
      },
      {
        id: "nav-people",
        label: "People Lists",
        description: "Open all people lists",
        href: "/app/people",
        keywords: ["profiles", "people"],
        section: "Navigation",
      },
      {
        id: "nav-companies",
        label: "Company Lists",
        description: "Open all company lists",
        href: "/app/companies",
        keywords: ["accounts", "companies"],
        section: "Navigation",
      },
      {
        id: "nav-settings",
        label: "Settings",
        description: "Open workspace settings",
        href: "/app/settings",
        keywords: ["preferences", "config"],
        section: "Navigation",
      },
    ];

    const peopleListCommands: CommandItem[] = peopleLists.flatMap((list) => [
      {
        id: `people-list-${list.id}`,
        label: list.name,
        description: "Open people list",
        href: `/app/people/${list.id}`,
        keywords: ["people", "list", "profiles"],
        section: "People Lists" as const,
      },
      {
        id: `people-movements-${list.id}`,
        label: `${list.name} Movements`,
        description: "Open people list movements",
        href: `/app/people/${list.id}/movements`,
        keywords: ["movement", "signals", "people"],
        section: "Movements" as const,
      },
    ]);

    const companyListCommands: CommandItem[] = companyLists.flatMap((list) => [
      {
        id: `company-list-${list.id}`,
        label: list.name,
        description: "Open company list",
        href: `/app/companies/${list.id}`,
        keywords: ["company", "list", "accounts"],
        section: "Company Lists" as const,
      },
      {
        id: `company-movements-${list.id}`,
        label: `${list.name} Movements`,
        description: "Open company list movements",
        href: `/app/companies/${list.id}/movements`,
        keywords: ["movement", "signals", "companies"],
        section: "Movements" as const,
      },
    ]);

    return [...base, ...peopleListCommands, ...companyListCommands];
  }, [companyLists, peopleLists]);

  const filtered = useMemo(() => commands.filter((item) => matchesQuery(item, query)), [commands, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const hasResults = filtered.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 border-2 border-border rounded-base bg-background text-sm text-foreground/70 hover:text-foreground transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
        <span className="text-xs text-foreground/50">⌘K</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <DialogHeader className="p-4 border-b-2 border-border">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>
              Jump to lists, companies, people movements, and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 border-b-2 border-border">
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a command or route..."
              aria-label="Search commands"
            />
          </div>

          <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
            {!hasResults ? (
              <p className="text-sm text-foreground/60">No matches found.</p>
            ) : (
              Object.entries(grouped).map(([section, items]) => (
                <div key={section}>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2">{section}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          router.push(item.href);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="w-full text-left p-3 rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-foreground/60">{item.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
