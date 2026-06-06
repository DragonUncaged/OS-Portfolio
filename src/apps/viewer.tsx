"use client";

import { ArrowSquareOut, Code, FileX, FolderOpen, Globe } from "@phosphor-icons/react";
import { Fragment, useState, type ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";
import { Empty, Page } from "@/components/kit";
import { useInstance } from "@/hooks/use-instance";
import { launch, openExternal } from "@/lib/launch";
import { canonical, pathFromKey, resolve } from "@/lib/vfs";
import { usePlatform } from "@/stores/session";
import { appName } from "./registry";

function inline(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part))
      return (
        <a
          key={i}
          href={part}
          className="k-link break-all"
          onClick={(e) => {
            e.preventDefault();
            openExternal(part);
          }}
        >
          {part}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part))
      return (
        <a key={i} href={`mailto:${part}`} className="k-link break-all">
          {part}
        </a>
      );
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul${blocks.length}`}>
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  source.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) return void list.push(line.slice(2));
    flush();
    if (!line) return;
    if (line.startsWith("### ")) blocks.push(<h3 key={i}>{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={i}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) blocks.push(<h1 key={i}>{inline(line.slice(2))}</h1>);
    else if (line.startsWith("> ")) blocks.push(<blockquote key={i}>{inline(line.slice(2))}</blockquote>);
    else blocks.push(<p key={i}>{inline(line)}</p>);
  });
  flush();
  return <div className="os-doc selectable">{blocks}</div>;
}

export default function Viewer() {
  const platform = usePlatform();
  const { args } = useInstance();
  const [source, setSource] = useState(false);
  const path = canonical(pathFromKey(args.path ?? ""));
  const node = path && resolve(path);

  if (!path || !node || node.type !== "file") {
    return (
      <AppFrame compact>
        <Empty icon={FileX} title="No document open">
          Open a file from {appName("files", platform)} or with <code>open &lt;file&gt;</code> in the terminal.
        </Empty>
      </AppFrame>
    );
  }

  const parent = path.slice(0, -1);
  return (
    <AppFrame
      title={node.name}
      subtitle={["~", ...parent].join("/")}
      compact
      actions={[
        ...(node.kind === "markdown"
          ? [{ id: "source", label: source ? "Show formatted" : "Show source", icon: Code, on: source, onClick: () => setSource((v) => !v) }]
          : []),
        ...(node.href
          ? [{ id: "open", label: "Open link", icon: ArrowSquareOut, onClick: () => openExternal(node.href as string) }]
          : []),
        {
          id: "reveal",
          label: `Show in ${appName("files", platform)}`,
          icon: FolderOpen,
          onClick: () => launch("files", { path: parent.join("/") }),
        },
      ]}
    >
      <Page>
        {node.kind === "link" && node.href ? (
          <div className="k-card flex flex-col items-start gap-3 p-5">
            <Globe size={36} weight="duotone" className="text-accent" />
            <div>
              <div className="text-[15px] font-semibold">{node.name.replace(/\.url$/, "")}</div>
              <div className="selectable break-all text-[13px] text-fg2">{node.href.replace("mailto:", "")}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!node.href.startsWith("mailto:") && (
                <button type="button" className="k-btn k-btn-primary" onClick={() => launch("browser", { url: node.href })}>
                  Open in {appName("browser", platform)}
                </button>
              )}
              <button type="button" className="k-btn" onClick={() => openExternal(node.href as string)}>
                {node.href.startsWith("mailto:") ? "Write an email" : "Open in a new tab"}
              </button>
            </div>
          </div>
        ) : node.kind === "markdown" && !source ? (
          <Markdown source={node.content} />
        ) : (
          <pre className="selectable whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed">{node.content}</pre>
        )}
      </Page>
    </AppFrame>
  );
}
