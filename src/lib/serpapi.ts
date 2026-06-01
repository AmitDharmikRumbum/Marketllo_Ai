export interface TrendingData {
  keywords: string[];
  relatedTopics: string[];
}

export async function getTrendingKeywords(query: string): Promise<TrendingData> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return { keywords: [], relatedTopics: [] };

  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: query,
      data_type: "RELATED_QUERIES",
      api_key: apiKey,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return { keywords: [], relatedTopics: [] };

    const data = await res.json();

    const rising: string[] = (data.related_queries?.rising ?? [])
      .slice(0, 8)
      .map((item: { query: string }) => item.query);

    const top: string[] = (data.related_queries?.top ?? [])
      .slice(0, 5)
      .map((item: { query: string }) => item.query);

    return { keywords: rising, relatedTopics: top };
  } catch {
    return { keywords: [], relatedTopics: [] };
  }
}
