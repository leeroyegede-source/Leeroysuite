"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWidget from "@/components/chat/ChatWidget";

function ChatWidgetContent() {
    const searchParams = useSearchParams();
    const supportEmail = searchParams.get('supportEmail') || undefined;

    return (
        <div className="w-screen h-screen bg-transparent flex items-end justify-end p-0 m-0">
            <ChatWidget embedded={true} supportEmail={supportEmail} />
        </div>
    );
}

export default function ChatWidgetStandalonePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChatWidgetContent />
        </Suspense>
    );
}
