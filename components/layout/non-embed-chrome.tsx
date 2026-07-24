"use client"

import { usePathname } from "next/navigation"
import { ChatWidget } from "@/components/chat/ChatWidget"

/**
 * Site-wide floating chrome (chat). Hidden on /embed/* routes so it never leaks
 * into a third-party iframe and breaks the widget.
 *
 * The PWA install banner and the 60-second feedback popup were removed at the
 * product owner's request.
 */
export function NonEmbedChrome() {
  const pathname = usePathname()
  if (pathname?.startsWith("/embed")) return null

  return (
    <>
      <ChatWidget />
    </>
  )
}
