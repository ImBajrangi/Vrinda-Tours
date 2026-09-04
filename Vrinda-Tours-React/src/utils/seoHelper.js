/**
 * SEO & Dynamic Metadata Manager for Vrinda Vihar
 * Handles client-side meta title, description, canonical, and OpenGraph updates
 * for all destinations, temples, packages, and categories across Mathura, Vrindavan & Brij Dham.
 */

const BASE_URL = 'https://to.vrindopnishad.in';
const DEFAULT_TITLE = 'Vrinda Vihar — Mathura Vrindavan Tour, Brij 84 Kos Yatra & Darshan Guide';
const DEFAULT_DESC = 'Official Vrinda Vihar pilgrimage guide & booking platform. Book electric rickshaws in Vrindavan, verified ashram stays, sattvic dining, and guided darshan tours across Mathura, Vrindavan, Barsana, Govardhan & Gokul.';

export function updatePageSEO({
  title,
  description,
  url,
  image,
  keywords,
  type = 'website'
} = {}) {
  try {
    const finalTitle = title ? `${title} | Vrinda Vihar` : DEFAULT_TITLE;
    const finalDesc = description || DEFAULT_DESC;
    const finalUrl = url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : BASE_URL;
    const finalImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : `${BASE_URL}/handdrawn_vrinda_hero.webp`;

    // 1. Document Title
    document.title = finalTitle;

    // 2. Standard Meta Tags
    setMetaTag('name', 'title', finalTitle);
    setMetaTag('name', 'description', finalDesc);
    if (keywords) setMetaTag('name', 'keywords', keywords);

    // 3. OpenGraph Social Tags
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:url', finalUrl);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:type', type);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalImage);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);
  } catch (e) {
    // Fail silently in non-browser environments
  }
}

function setMetaTag(attrName, attrVal, content) {
  let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrVal);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
