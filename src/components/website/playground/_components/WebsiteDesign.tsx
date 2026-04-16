"use client";

import React, { useEffect, useRef, useState } from "react";
import WebpageTools from "./WebpageTools";
import ElementSetting from "./ElementSetting";
import ImageSettingSection from "./ImageSettingsSection";

import { HTML_TEMPLATE, cleanupCode } from "@/utils/htmlProcessor";

type Props = {
  generatedCode: string;
  onSave?: () => void;
  isSaving: boolean;
  loading: boolean;
};

const WebsiteDesign = ({
  generatedCode,
  onSave,
  isSaving,
  loading,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [SelectedScreenSize, setSelectedScreenSize] = useState("web");

  // 🔥 FIX: keep generic HTMLElement, then safely narrow later
  const [selectedElement, setSelectedElement] =
    useState<HTMLElement | null>(null);

  const hoverEl = useRef<HTMLElement | null>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    selectedElRef.current = selectedElement;
  }, [selectedElement]);

  // 🔥 FIX IMAGES + CHARTS SAFELY
  function fixContent(html: string) {
    let updated = html;

    // Replace broken images
    updated = updated.replace(
      /<img[^>]*src=["'][^"']*["'][^>]*>/g,
      (tag) => tag.replace(/src=["'][^"']*["']/, `src="/1.jpg"`)
    );

    // Fix chart/canvas sizing
    updated = updated.replace(
      /<canvas([^>]*)><\/canvas>/g,
      `<div class="w-full h-[300px] min-h-[300px]"><canvas $1></canvas></div>`
    );

    return updated;
  }

  const safeHTML = fixContent(cleanupCode(generatedCode));

  // INIT IFRAME ONCE
  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(HTML_TEMPLATE);
    doc.close();

    const handleMouseOver = (e: MouseEvent) => {
      if (selectedElRef.current) return;

      const target = e.target as HTMLElement;

      if (hoverEl.current && hoverEl.current !== target) {
        hoverEl.current.style.outline = "";
      }

      hoverEl.current = target;
      hoverEl.current.style.outline = "2px dotted blue";
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (selectedElRef.current) return;

      const target = e.target as HTMLElement;

      if (hoverEl.current === target) {
        hoverEl.current.style.outline = "";
        hoverEl.current = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;

      if (hoverEl.current) {
        hoverEl.current.style.outline = "";
        hoverEl.current = null;
      }

      setSelectedElement(target);
    };

    doc.addEventListener("mouseover", handleMouseOver);
    doc.addEventListener("mouseout", handleMouseOut);
    doc.addEventListener("click", handleClick);

    return () => {
      doc.removeEventListener("mouseover", handleMouseOver);
      doc.removeEventListener("mouseout", handleMouseOut);
      doc.removeEventListener("click", handleClick);
    };
  }, []);

  // UPDATE IFRAME CONTENT
  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");

    if (root) {
      root.innerHTML = safeHTML;

      try {
        (doc.defaultView as any)?.initFlowbite?.();
      } catch {
        console.warn("Flowbite init failed");
      }
    }
  }, [safeHTML]);

  return (
    <div className="flex gap-2 w-full">
      <div className="p-5 w-full flex items-center flex-col">
        <iframe
          ref={iframeRef}
          className={`${
            SelectedScreenSize === "web" ? "w-full" : "w-[600px]"
          } h-[600px] border-2 rounded-xl`}
          sandbox="allow-scripts allow-same-origin"
        />

        <WebpageTools
          SelectedScreenSize={SelectedScreenSize}
          setSelectedScreenSize={setSelectedScreenSize}
          generatedCode={safeHTML}
          onSave={onSave}
          isSaving={isSaving}
          loading={loading}
        />
      </div>

      {/* 🔥 FIXED TYPE SAFETY FOR IMAGE ELEMENT */}
      {selectedElement && selectedElement.tagName === "IMG" ? (
        <ImageSettingSection
          selectedEl={selectedElement as HTMLImageElement}
          clearSelection={() => setSelectedElement(null)}
        />
      ) : selectedElement ? (
        <ElementSetting
          selectedEl={selectedElement}
          clearSelection={() => setSelectedElement(null)}
        />
      ) : null}
    </div>
  );
};

export default WebsiteDesign;