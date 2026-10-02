import { apiPath } from '../../apiPath';

export const R2_LOGO_URL = 'https://pub-5a1825f2dbec4d2eb0b6c533f4b0fa5f.r2.dev/logos/universal_movers_logo.png';

export const resolveLogoUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return R2_LOGO_URL;
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
  const cached = localStorage.getItem('logoUrl');
  let currentLogo = (cached && cached.startsWith('http')) ? resolveLogoUrl(cached) : R2_LOGO_URL;

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
    console.warn('Could not fetch latest company logo, using R2 cloud fallback:', err);
  }

  return currentLogo || R2_LOGO_URL;
};
