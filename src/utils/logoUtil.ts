import { apiPath } from '../../apiPath';

export const resolveLogoUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '';
  }
  const cleanUrl = url.trim();
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }
  const leadingSlash = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${apiPath}${leadingSlash}`;
};

export const fetchCompanyLogo = async (): Promise<string> => {
  // First check localStorage for cached logo
  const cached = localStorage.getItem('logoUrl');
  let currentLogo = resolveLogoUrl(cached);

  try {
    const response = await fetch(`${apiPath}/api/company-details`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.logoUrl) {
        const resolved = resolveLogoUrl(data.logoUrl);
        localStorage.setItem('logoUrl', resolved);
        currentLogo = resolved;
      }
    }
  } catch (err) {
    console.warn('Could not fetch latest company logo, using fallback/cache:', err);
  }

  return currentLogo;
};
