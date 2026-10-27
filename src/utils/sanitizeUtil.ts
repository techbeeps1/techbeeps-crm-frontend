import DOMPurify from 'dompurify';

/**
 * Universal Sanitizer Utility for CRM HTML Content
 * Compliant with EXEC-06: Raw HTML rendering sanitization (dangerouslySetInnerHTML) & CSP
 */

/**
 * Sanitizes rich HTML content (e.g., email messages, financial templates, quotation previews).
 * Strips active executable scripts, javascript: pseudo-protocols, iframes, and dangerous handlers
 * while preserving safe typography, formatting, layout, inline CSS, tables, and images.
 */
export const sanitizeHtml = (content?: string | null): string => {
  if (!content || typeof content !== 'string') return '';
  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_ATTR: ['target', 'style', 'class', 'id', 'align', 'valign', 'border', 'cellpadding', 'cellspacing'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
  });
};

/**
 * Sanitizes inline SVG icons (e.g., room icons, service icons, furniture representations).
 * Strictly enforces SVG safe profile to prevent SVG-based XSS (such as <svg onload=...>)
 * while ensuring valid SVG tags (<svg>, <path>, <g>, <circle>, etc.) render flawlessly.
 */
export const sanitizeSvg = (svgContent?: string | null): string => {
  if (!svgContent || typeof svgContent !== 'string') return '';
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
      'use', 'pattern', 'defs', 'image', 'g', 'path', 'circle', 'rect',
      'polygon', 'polyline', 'line', 'svg', 'clipPath', 'linearGradient', 'radialGradient', 'stop'
    ],
    ADD_ATTR: [
      'style', 'class', 'id', 'fill', 'stroke', 'stroke-width', 'viewBox',
      'xmlns', 'xmlns:xlink', 'xlink:href', 'href', 'd', 'width', 'height',
      'transform', 'preserveAspectRatio', 'patternContentUnits', 'x', 'y', 'r', 'cx', 'cy',
      'x1', 'y1', 'x2', 'y2', 'offset', 'stop-color', 'stop-opacity'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  });
};

export default sanitizeHtml;
