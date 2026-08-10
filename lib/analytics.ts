"use client";

// Analytics and tracking utilities — Google Analytics 4 with Consent Mode v2
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private isInitialized = false;
  private userId: string | null = null;

  init(userId?: string) {
    if (this.isInitialized) return;

    this.userId = userId || null;
    this.isInitialized = true;

    // Initialize Google Analytics 4
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      this.initGA4();
    } else {
      console.warn('[analytics] NEXT_PUBLIC_GA_ID not set — GA4 disabled');
    }

    console.log('Analytics initialized');
  }

  // Google Analytics 4 initialization with Google Consent Mode v2 (UK GDPR)
  private initGA4() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return;

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function () {
      (window as any).dataLayer.push(arguments);
    };

    // Consent Mode v2 — default all to denied until user opts in via cookie banner
    (window as any).gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
      region: ['GB', 'EU'],
    });

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
      user_id: this.userId,
    });

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);
  }

  /** Call this when user accepts cookies — lifts consent flags so GA4 can resume */
  grantConsent() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
  }

  // Track page views
  trackPageView(url: string, title?: string) {
    if (!this.isInitialized) return;

    // GA4 page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title || document.title,
        page_location: url,
        user_id: this.userId
      });
    }

    this.track({
      action: 'page_view',
      category: 'navigation',
      properties: {
        url,
        title: title || document.title,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.isInitialized) return;

    // GA4 event tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: this.userId,
        custom_parameters: event.properties
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event);
  }

  // Business-specific tracking methods
  trackQuoteRequest(tradeType: string, location: string, urgency: string) {
    this.track({
      action: 'quote_request',
      category: 'conversion',
      label: tradeType,
      properties: {
        trade_type: tradeType,
        location,
        urgency,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackUserRegistration(userType: 'client' | 'tradesperson', method: string) {
    this.track({
      action: 'user_registration',
      category: 'conversion',
      label: userType,
      properties: {
        user_type: userType,
        registration_method: method,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackChatInteraction(action: 'open' | 'message' | 'close', messageType?: string) {
    this.track({
      action: `chat_${action}`,
      category: 'engagement',
      label: messageType,
      properties: {
        chat_action: action,
        message_type: messageType,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackSearchQuery(query: string, results: number) {
    this.track({
      action: 'search',
      category: 'engagement',
      label: query,
      value: results,
      properties: {
        search_query: query,
        results_count: results,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackButtonClick(buttonName: string, location: string) {
    this.track({
      action: 'button_click',
      category: 'engagement',
      label: buttonName,
      properties: {
        button_name: buttonName,
        page_location: location,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Set user ID
  setUserId(userId: string) {
    this.userId = userId;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        user_id: userId
      });
    }
  }

  // Send to custom analytics endpoint
  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackQuoteRequest: analytics.trackQuoteRequest.bind(analytics),
    trackUserRegistration: analytics.trackUserRegistration.bind(analytics),
    trackChatInteraction: analytics.trackChatInteraction.bind(analytics),
    trackSearchQuery: analytics.trackSearchQuery.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    grantConsent: analytics.grantConsent.bind(analytics),
  };
}
