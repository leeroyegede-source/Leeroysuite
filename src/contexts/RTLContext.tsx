"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface RTLContextType {
    isRTL: boolean;
    toggleRTL: () => void;
    setRTL: (isRTL: boolean) => void;
}

const RTLContext = createContext<RTLContextType>({
    isRTL: false,
    toggleRTL: () => { },
    setRTL: () => { },
});

export const useRTL = () => useContext(RTLContext);

export function RTLProvider({ children }: { children: React.ReactNode }) {
    const [isRTL, setIsRTL] = useState(false);

    // Load saved preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("ai-suite-rtl");
        if (saved === "true") {
            setIsRTL(true);
            document.documentElement.setAttribute("dir", "rtl");
        }
    }, []);

    const toggleRTL = () => {
        setIsRTL((prev) => {
            const next = !prev;
            document.documentElement.setAttribute("dir", next ? "rtl" : "ltr");
            localStorage.setItem("ai-suite-rtl", String(next));
            return next;
        });
    };

    const setRTL = useCallback((value: boolean) => {
        setIsRTL(value);
        document.documentElement.setAttribute("dir", value ? "rtl" : "ltr");
        localStorage.setItem("ai-suite-rtl", String(value));
    }, []);

    return (
        <RTLContext.Provider value={{ isRTL, toggleRTL, setRTL }}>
            {children}
        </RTLContext.Provider>
    );
}

