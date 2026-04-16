"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

interface AutoTranslatorProps {
    translations: Record<string, string>;
    locale: string;
    enabled: boolean;
}

// Elements to skip during translation
const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "SVG", "PATH", "CIRCLE", "RECT", "LINE", "POLYLINE",
    "POLYGON", "ELLIPSE", "G", "DEFS", "CLIPPATH", "MASK", "PATTERN",
    "CODE", "PRE", "TEXTAREA", "NOSCRIPT", "IFRAME", "INPUT", "SELECT",
]);

// Attributes that contain translatable text
const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label", "alt"];

// Minimum text length to consider for translation
const MIN_TEXT_LENGTH = 2;

// WeakMap to store original text for each node — avoids data attribute conflicts
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

/**
 * AutoTranslator - Automatically translates all visible text in the DOM.
 * 
 * How it works:
 * 1. Admin adds translation keys as the actual English text (e.g., "Welcome back")
 * 2. This component scans all text nodes in the DOM
 * 3. For each text node, it checks if the text matches any translation key
 * 4. If matched, it replaces the text with the translated value
 * 5. Original text is stored in a WeakMap for restoration
 * 6. MutationObserver watches for new DOM content and translates it too
 */
export function AutoTranslator({ translations, locale, enabled }: AutoTranslatorProps) {
    const pathname = usePathname();
    const observerRef = useRef<MutationObserver | null>(null);
    const translationMapRef = useRef<Map<string, string>>(new Map());
    const isTranslatingRef = useRef(false);
    const translatedNodesRef = useRef<Set<Node>>(new Set());
    const translatedElementsRef = useRef<Set<Element>>(new Set());

    // Build a lookup map: English text → translated text
    const buildTranslationMap = useCallback((trans: Record<string, string>) => {
        const map = new Map<string, string>();
        for (const [key, value] of Object.entries(trans)) {
            if (value && value.trim()) {
                map.set(key, value);
                // Also add lowercase version for case-insensitive matching
                const lower = key.toLowerCase();
                if (!map.has(lower)) {
                    map.set(lower, value);
                }
            }
        }
        return map;
    }, []);

    // Try to find a translation for given text
    const findTranslation = useCallback((text: string): string | null => {
        const map = translationMapRef.current;
        if (map.size === 0) return null;

        const trimmed = text.trim();
        if (trimmed.length < MIN_TEXT_LENGTH) return null;

        // 1. Exact match
        if (map.has(trimmed)) return map.get(trimmed)!;

        // 2. Case-insensitive exact match
        const lower = trimmed.toLowerCase();
        if (map.has(lower)) return map.get(lower)!;

        // 3. Substring replacement — find and replace translatable phrases within the text
        let result = text;
        let hasMatch = false;

        // Sort keys by length (longest first) to handle overlapping phrases
        const sortedKeys = Array.from(new Set(
            Array.from(map.keys()).filter(k => k.length >= MIN_TEXT_LENGTH)
        )).sort((a, b) => b.length - a.length);

        // Track already replaced ranges to avoid double-replacing
        const replacedRanges: Array<[number, number]> = [];

        for (const key of sortedKeys) {
            const translation = map.get(key);
            if (!translation) continue;

            const keyLower = key.toLowerCase();
            const resultLower = result.toLowerCase();
            const idx = resultLower.indexOf(keyLower);

            if (idx !== -1) {
                const end = idx + key.length;

                // Word-boundary check: for shorter keys (< 15 chars), ensure
                // the match is not embedded inside a larger word.
                // e.g. "View" should NOT match inside "Overview"
                if (key.length < 15) {
                    const charBefore = idx > 0 ? result[idx - 1] : " ";
                    const charAfter = end < result.length ? result[end] : " ";
                    const isWordBoundaryBefore = /[\s,.:;!?'"()\-/\[\]{}]/.test(charBefore) || idx === 0;
                    const isWordBoundaryAfter = /[\s,.:;!?'"()\-/\[\]{}]/.test(charAfter) || end === result.length;
                    if (!isWordBoundaryBefore || !isWordBoundaryAfter) continue;
                }

                // Check if this range overlaps with an already-replaced range
                const overlaps = replacedRanges.some(
                    ([start, stop]) => idx < stop && end > start
                );
                if (overlaps) continue;

                result = result.substring(0, idx) + translation + result.substring(end);
                replacedRanges.push([idx, idx + translation.length]);
                hasMatch = true;
            }
        }

        return hasMatch ? result : null;
    }, []);

    // Translate a single text node
    const translateTextNode = useCallback((node: Text) => {
        if (isTranslatingRef.current) return;

        const text = node.nodeValue;
        if (!text || text.trim().length < MIN_TEXT_LENGTH) return;

        // Skip nodes in untranslatable elements
        const parent = node.parentElement;
        if (!parent) return;
        if (SKIP_TAGS.has(parent.tagName)) return;
        // Skip the language switcher itself to avoid translating language names
        if (parent.closest("[data-no-translate]")) return;

        // Use the original text for lookup (if we've translated before)
        const sourceText = originalTextMap.get(node) || text;
        const translation = findTranslation(sourceText);

        if (translation && translation !== text) {
            isTranslatingRef.current = true;
            // Store original text before first translation
            if (!originalTextMap.has(node)) {
                originalTextMap.set(node, text);
            }
            node.nodeValue = translation;
            translatedNodesRef.current.add(node);
            isTranslatingRef.current = false;
        }
    }, [findTranslation]);

    // Translate attributes on an element
    const translateAttributes = useCallback((element: Element) => {
        if (SKIP_TAGS.has(element.tagName)) return;
        if (element.closest("[data-no-translate]")) return;

        for (const attr of TRANSLATABLE_ATTRS) {
            const value = element.getAttribute(attr);
            if (!value || value.trim().length < MIN_TEXT_LENGTH) continue;

            // Get the original attribute value
            const originals = originalAttrMap.get(element) || {};
            const sourceValue = originals[attr] || value;
            const translation = findTranslation(sourceValue);

            if (translation && translation !== value) {
                if (!originals[attr]) {
                    originals[attr] = value;
                    originalAttrMap.set(element, originals);
                }
                element.setAttribute(attr, translation);
                translatedElementsRef.current.add(element);
            }
        }
    }, [findTranslation]);

    // Walk the DOM tree and translate everything inside a root
    const translateSubtree = useCallback((root: Node) => {
        // Process the root itself if it's an element
        if (root.nodeType === Node.ELEMENT_NODE) {
            translateAttributes(root as Element);
        } else if (root.nodeType === Node.TEXT_NODE) {
            translateTextNode(root as Text);
        }

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
                        if (el.hasAttribute("data-no-translate")) return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                },
            }
        );

        let currentNode: Node | null;
        while ((currentNode = walker.nextNode())) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                translateTextNode(currentNode as Text);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                translateAttributes(currentNode as Element);
            }
        }
    }, [translateTextNode, translateAttributes]);

    // Restore all text to original English
    const restoreOriginalText = useCallback(() => {
        // Restore text nodes
        for (const node of translatedNodesRef.current) {
            const original = originalTextMap.get(node);
            if (original && node.nodeValue !== original) {
                node.nodeValue = original;
            }
        }
        translatedNodesRef.current.clear();

        // Restore attributes
        for (const element of translatedElementsRef.current) {
            const originals = originalAttrMap.get(element);
            if (originals) {
                for (const [attr, value] of Object.entries(originals)) {
                    element.setAttribute(attr, value);
                }
            }
        }
        translatedElementsRef.current.clear();
    }, []);

    // Main effect: translate or restore
    useEffect(() => {
        if (!locale) return;

        if (!enabled || locale === "en") {
            restoreOriginalText();
            return;
        }

        // Build the translation map
        translationMapRef.current = buildTranslationMap(translations);

        if (translationMapRef.current.size === 0) {
            restoreOriginalText();
            return;
        }

        restoreOriginalText();
        
        // Aggressively translate on mount/locale change to catch React rendering
        let retries = 0;
        const intervalId = setInterval(() => {
            requestAnimationFrame(() => {
                translateSubtree(document.body);
            });
            retries++;
            // Stop aggressive polling after 2 seconds
            if (retries > 10) clearInterval(intervalId);
        }, 200);

        return () => clearInterval(intervalId);
    }, [translations, locale, enabled, pathname, buildTranslationMap, restoreOriginalText, translateSubtree]);

    // MutationObserver for dynamically added content
    useEffect(() => {
        if (!enabled || locale === "en" || translationMapRef.current.size === 0) {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            return;
        }

        observerRef.current = new MutationObserver((mutations) => {
            if (isTranslatingRef.current) return;

            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    for (const node of Array.from(mutation.addedNodes)) {
                        translateSubtree(node);
                    }
                } else if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
                    translateTextNode(mutation.target as Text);
                } else if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
                    translateAttributes(mutation.target as Element);
                }
            }
        });

        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: TRANSLATABLE_ATTRS
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [enabled, locale, translateTextNode, translateSubtree]);

    return null;
}
