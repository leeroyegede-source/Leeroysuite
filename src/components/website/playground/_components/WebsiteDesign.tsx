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

  const [selectedElement, setSelectedElement] =
    useState<HTMLElement | null>(null);

  const hoverEl = useRef<HTMLElement | null>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    selectedElRef.current = selectedElement;
  }, [selectedElement]);

  // Fix images + canvas rendering
  function fixContent(html: string) {
    let updated = html;

    // Fix broken images
    updated = updated.replace(
      /<img[^>]*src=["'][^"']*["'][^>]*>/g,
      (tag) => tag.replace(/src=["'][^"']*["']/, `src="/1.jpg"`)
    );

    // Fix canvas height
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
    <div className="flex w-full h-screen overflow-hidden">

      {/* LEFT SIDE (PREVIEW + TOOLBAR) */}
      <div className="flex-1 flex flex-col h-full w-full p-3 gap-3">

        {/* ✅ 85% PREVIEW */}
        <div className="h-[85%] border rounded-xl overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* ✅ 15% TOOLBAR */}
        <div className="h-[15%] min-h-[100px]">
          <WebpageTools
            SelectedScreenSize={SelectedScreenSize}
            setSelectedScreenSize={setSelectedScreenSize}
            generatedCode={safeHTML}
            onSave={onSave}
            isSaving={isSaving}
            loading={loading}
          />
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="shrink-0">
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

    </div>
  );
};

export default WebsiteDesign;