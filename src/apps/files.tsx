"use client";

import {
  AppWindow,
  Briefcase,
  Eye,
  EyeSlash,
  FileCode,
  FileMd,
  FileText,
  Folder,
  GlobeSimple,
  GraduationCap,
  House,
  LinkSimple,
  ListBullets,
  RocketLaunch,
  SquaresFour,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { AppIcon } from "@/components/app-icon";
import { Empty } from "@/components/kit";
import { showContextMenu } from "@/components/menu";
import { useInstance, useRelaunch } from "@/hooks/use-instance";
import { displayPath } from "@/lib/commands";
import { launch, openExternal } from "@/lib/launch";
import { canonical, kindLabel, pathFromKey, resolve, sizeOf, type VNode, type VPath } from "@/lib/vfs";
import { usePlatform, useSession } from "@/stores/session";
import { appName, launchable } from "./registry";

const SECTIONS = [
  { id: "home", label: "Home", icon: House },
  { id: "Projects", label: "Projects", icon: RocketLaunch },
  { id: "Experience", label: "Experience", icon: Briefcase },
  { id: "Education", label: "Education", icon: GraduationCap },
  { id: "Links", label: "Links", icon: LinkSimple },
  { id: "apps", label: "Applications", icon: AppWindow },
  { id: "trash", label: "Trash", icon: Trash },
];

function NodeIcon({ node, size }: { node: VNode; size: number }) {
  if (node.type === "dir") return <Folder size={size} weight="fill" style={{ color: "var(--folder, var(--accent))" }} />;
  const cls = "text-fg2";
  if (node.kind === "markdown") return <FileMd size={size} weight="duotone" className={cls} />;
  if (node.kind === "json") return <FileCode size={size} weight="duotone" className={cls} />;
  if (node.kind === "link") return <GlobeSimple size={size} weight="duotone" className="text-accent" />;
  return <FileText size={size} weight="duotone" className={cls} />;
}

function openNode(path: VPath, node: VNode) {
  if (node.type === "dir") launch("files", { path: path.join("/") });
  else if (node.kind === "link" && node.href) {
    if (node.href.startsWith("mailto:")) openExternal(node.href);
    else launch("browser", { url: node.href });
  } else launch("viewer", { path: path.join("/") });
}

export default function Files() {
  const platform = usePlatform();
  const phone = useSession((s) => s.form === "phone");
  const { args } = useInstance();
  const initial = canonical(pathFromKey(args.path ?? "")) ?? [];
  const [path, setPath] = useState<VPath>(initial);
  const specialOf = (section?: string) => (section === "apps" || section === "trash" ? section : null);
  const [special, setSpecial] = useState<"apps" | "trash" | null>(() => specialOf(args.section));
  const [list, setList] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const go = (next: VPath) => {
    setPath(next);
    setSpecial(null);
    setSelected(null);
  };
  useRelaunch((a) => {
    go(canonical(pathFromKey(a.path ?? "")) ?? []);
    setSpecial(specialOf(a.section));
  });

  const node = resolve(path);
  const dir = node?.type === "dir" ? node : null;
  const items = dir ? dir.children.filter((c) => hidden || !c.hidden) : [];
  const section = special ?? (path[0] && SECTIONS.some((s) => s.id === path[0]) ? path[0] : "home");

  const open = (child: VNode) => {
    if (child.type === "dir") go([...path, child.name]);
    else openNode([...path, child.name], child);
  };

  const menu = (e: React.MouseEvent, child: VNode) => {
    setSelected(child.name);
    showContextMenu(e, [
      { label: "Open", onSelect: () => open(child) },
      ...(child.type === "file" && child.href && !child.href.startsWith("mailto:")
        ? [{ label: "Open in new tab", onSelect: () => openExternal(child.href as string) }]
        : []),
      { type: "separator" as const },
      {
        label: "Copy path",
        onSelect: () => void navigator.clipboard?.writeText(displayPath(platform, [...path, child.name], true)).catch(() => {}),
      },
    ]);
  };

  const title = special === "apps" ? "Applications" : special === "trash" ? "Trash" : (path[path.length - 1] ?? "Home");

  return (
    <AppFrame
      title={title}
      subtitle={special ? undefined : displayPath(platform, path)}
      sections={SECTIONS}
      section={section}
      onSection={(id) => {
        if (id === "apps" || id === "trash") {
          setSpecial(id);
          setSelected(null);
        } else go(id === "home" ? [] : [id]);
      }}
      onBack={!special && path.length > 0 ? () => go(path.slice(0, -1)) : null}
      actions={[
        { id: "view", label: list ? "Icons" : "List", icon: list ? SquaresFour : ListBullets, onClick: () => setList((v) => !v) },
        {
          id: "hidden",
          label: hidden ? "Hide hidden files" : "Show hidden files",
          icon: hidden ? EyeSlash : Eye,
          on: hidden,
          onClick: () => setHidden((v) => !v),
        },
      ]}
    >
      {special === "trash" ? (
        <Empty icon={Trash} title="Trash is empty">
          Nothing here was ever thrown away. The portfolio is read-only.
        </Empty>
      ) : special === "apps" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1 p-3">
          {launchable(platform).map((id) => (
            <button
              key={id}
              type="button"
              className="os-file flex flex-col items-center gap-1.5 rounded-ctl p-2.5 text-center"
              onDoubleClick={() => launch(id)}
              onClick={() => phone && launch(id)}
              onKeyDown={(e) => e.key === "Enter" && launch(id)}
            >
              <AppIcon id={id} size={44} />
              <span className="line-clamp-2 text-[12px] leading-tight">{appName(id, platform)}</span>
            </button>
          ))}
        </div>
      ) : !dir ? (
        <Empty icon={Folder} title="Folder not found" />
      ) : items.length === 0 ? (
        <Empty icon={Folder} title="This folder is empty" />
      ) : list ? (
        <div className="min-w-0 p-2">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 px-2.5 pb-1.5 text-[11.5px] text-fg3 @min-[520px]:grid-cols-[1fr_150px_80px]">
            <span>Name</span>
            <span className="hidden @min-[520px]:block">Kind</span>
            <span className="text-right">Size</span>
          </div>
          {items.map((c) => (
            <button
              key={c.name}
              type="button"
              className="os-file grid w-full grid-cols-[1fr_auto] items-center gap-x-4 rounded-ctl px-2.5 py-1.5 text-left text-[13px] @min-[520px]:grid-cols-[1fr_150px_80px]"
              data-on={selected === c.name}
              onClick={() => (phone ? open(c) : setSelected(c.name))}
              onDoubleClick={() => open(c)}
              onKeyDown={(e) => e.key === "Enter" && open(c)}
              onContextMenu={(e) => menu(e, c)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <NodeIcon node={c} size={20} />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="hidden truncate text-fg2 @min-[520px]:block">{kindLabel(c)}</span>
              <span className="text-right tabular-nums text-fg2">{sizeOf(c)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div
          className="grid min-h-full grid-cols-[repeat(auto-fill,minmax(98px,1fr))] content-start gap-1 p-3"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          {items.map((c) => (
            <button
              key={c.name}
              type="button"
              className="os-file flex flex-col items-center gap-1 rounded-ctl p-2.5 text-center"
              data-on={selected === c.name}
              onClick={() => (phone ? open(c) : setSelected(c.name))}
              onDoubleClick={() => open(c)}
              onKeyDown={(e) => e.key === "Enter" && open(c)}
              onContextMenu={(e) => menu(e, c)}
            >
              <NodeIcon node={c} size={52} />
              <span className="line-clamp-2 break-all text-[12px] leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      )}
      {dir && !special && (
        <div className="os-statusbar pointer-events-none sticky bottom-0 px-3 py-1 text-[11.5px] text-fg3">
          {items.length} {items.length === 1 ? "item" : "items"}
          {selected ? ` · "${selected}" selected` : ""}
        </div>
      )}
    </AppFrame>
  );
}
