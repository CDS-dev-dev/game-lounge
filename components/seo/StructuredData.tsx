// 構造化データ（JSON-LD）コンポーネント

interface WebApplicationSchema {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Webアプリケーション用の構造化データ
 */
export function WebApplicationStructuredData({ name, description, url, applicationCategory, offers }: WebApplicationSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * パンくずリスト用の構造化データ
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
