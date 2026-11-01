"use client";

import {
  ArrowSquareOut,
  Check,
  Clock,
  Copy,
  EnvelopeSimple,
  LinkSimple,
  MapPin,
  PaperPlaneTilt,
  PencilSimple,
} from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Avatar, Heading, Page } from "@/components/kit";
import { LinkedInGlyph, TechIcon } from "@/components/tech-icon";
import { links, profile, type SocialLink } from "@/data/portfolio";
import { openExternal } from "@/lib/launch";

const SECTIONS = [
  { id: "links", label: "Links", icon: LinkSimple },
  { id: "message", label: "Message", icon: PencilSimple },
];

function LinkIcon({ id }: { id: SocialLink["id"] }) {
  if (id === "email") return <EnvelopeSimple size={22} weight="fill" />;
  if (id === "linkedin") return <LinkedInGlyph size={22} />;
  return <TechIcon name={id} size={22} mono />;
}

function LinkRow({ link }: { link: SocialLink }) {
  const [copied, setCopied] = useState(false);
  const text = link.href.replace("mailto:", "");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard access can be denied, the address is still selectable
    }
  };
  return (
    <div className="k-row">
      <span className="grid size-10 shrink-0 place-items-center rounded-ctl bg-accent-soft text-accent">
        <LinkIcon id={link.id} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">{link.label}</span>
        <span className="selectable block truncate text-[12.5px] text-fg2">{link.handle}</span>
      </span>
      <button type="button" className="k-icon-btn" aria-label={`Copy ${link.label}`} title="Copy" onClick={copy}>
        {copied ? <Check size={17} weight="bold" className="text-accent" /> : <Copy size={17} />}
      </button>
      <button
        type="button"
        className="k-icon-btn"
        aria-label={`Open ${link.label}`}
        title="Open"
        onClick={() => openExternal(link.href)}
      >
        <ArrowSquareOut size={17} />
      </button>
    </div>
  );
}

function Compose() {
  const [subject, setSubject] = useState(`Hello ${profile.firstName}!`);
  const [body, setBody] = useState("");
  const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return (
    <form
      className="k-card overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        openExternal(href);
      }}
    >
      <div className="k-row !py-2.5">
        <span className="w-[62px] shrink-0 text-[13px] text-fg2">To</span>
        <span className="selectable min-w-0 flex-1 truncate text-[13.5px]">{profile.email}</span>
      </div>
      <label className="k-row !py-1.5">
        <span className="w-[62px] shrink-0 text-[13px] text-fg2">Subject</span>
        <input
          name="subject"
          className="k-input !border-transparent !bg-transparent !px-0"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
        />
      </label>
      <label className="block border-t border-line">
        <span className="sr-only">Message</span>
        <textarea
          name="message"
          className="k-input !min-h-[150px] resize-none !rounded-none !border-transparent !bg-transparent !px-3.5 !py-3 leading-relaxed"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Write to ${profile.firstName}…`}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
        <span className="text-[12px] text-fg3">Sends from your own mail app. Nothing is stored here.</span>
        <button type="submit" className="k-btn k-btn-primary">
          <PaperPlaneTilt size={16} weight="fill" />
          Send
        </button>
      </div>
    </form>
  );
}

export default function Contact() {
  const [section, setSection] = useState("links");
  return (
    <AppFrame sections={SECTIONS} section={section} onSection={setSection}>
      <Page>
        <div className="flex items-center gap-3.5">
          <Avatar size={56} />
          <div className="min-w-0">
            <div className="selectable text-[17px] font-semibold">{profile.name}</div>
            <div className="flex flex-wrap items-center gap-x-3 text-[12.5px] text-fg2">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {profile.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                Replies {profile.responseTime}
              </span>
            </div>
          </div>
        </div>
        <p className="selectable mt-4 text-[14px] leading-relaxed">{profile.availability}</p>

        {section === "links" ? (
          <>
            <Heading>Find me</Heading>
            <div className="k-card overflow-hidden">
              {links.map((l) => (
                <LinkRow key={l.id} link={l} />
              ))}
            </div>
          </>
        ) : (
          <>
            <Heading>New message</Heading>
            <Compose />
          </>
        )}
      </Page>
    </AppFrame>
  );
}
