export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

type EventAliasConfig = {
  canonicalName: string;
  paramAliases?: Record<string, string>;
};

const EVENT_ALIASES: Record<string, EventAliasConfig> = {
  cta_click: {
    canonicalName: "lead_cta_click",
    paramAliases: {
      cta_name: "cta_id",
      cta_text: "cta_label",
      location: "ui_location",
    },
  },
  contact_click: {
    canonicalName: "lead_contact_click",
    paramAliases: {
      contact_method: "channel",
      location: "ui_location",
    },
  },
  social_click: {
    canonicalName: "engagement_social_click",
    paramAliases: {
      platform: "social_platform",
      location: "ui_location",
    },
  },
  project_click: {
    canonicalName: "portfolio_project_click",
    paramAliases: {
      click_target: "project_action",
      location: "ui_location",
    },
  },
  navigation_click: {
    canonicalName: "navigation_menu_click",
    paramAliases: {
      location: "ui_location",
    },
  },
  dashboard_action: {
    canonicalName: "admin_dashboard_action",
    paramAliases: {
      location: "ui_location",
    },
  },
  ui_interaction: {
    canonicalName: "engagement_ui_interaction",
    paramAliases: {
      location: "ui_location",
    },
  },
};

function normalizeEvent(
  eventName: string,
  params: AnalyticsEventParams
): { name: string; params: AnalyticsEventParams } {
  const alias = EVENT_ALIASES[eventName];

  if (!alias) {
    return {
      name: eventName,
      params,
    };
  }

  const nextParams: AnalyticsEventParams = {
    source_event_name: eventName,
  };

  for (const [key, value] of Object.entries(params)) {
    const mappedKey = alias.paramAliases?.[key] ?? key;
    nextParams[mappedKey] = value;
  }

  if (typeof window !== "undefined") {
    nextParams.page_path = window.location.pathname;
  }

  return {
    name: alias.canonicalName,
    params: nextParams,
  };
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams): void {
  if (typeof window === "undefined") return;

  const payload = params ?? {};
  const normalized = normalizeEvent(eventName, payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", normalized.name, normalized.params);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: normalized.name, ...normalized.params });
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "page_view",
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
