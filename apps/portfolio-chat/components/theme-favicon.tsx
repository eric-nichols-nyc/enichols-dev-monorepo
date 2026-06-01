"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const FAVICON_LIGHT_THEME = "/icon-light-theme.svg";
const FAVICON_DARK_THEME = "/icon-dark-theme.svg";

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }

    const href =
      resolvedTheme === "dark" ? FAVICON_DARK_THEME : FAVICON_LIGHT_THEME;

    let link = document.querySelector<HTMLLinkElement>(
      'link[data-theme-favicon="true"]',
    );

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.setAttribute("data-theme-favicon", "true");
      document.head.appendChild(link);
    }

    link.href = href;
  }, [resolvedTheme]);

  return null;
}
