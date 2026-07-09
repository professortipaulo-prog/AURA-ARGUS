export type ResolvedLocation = {
  lat: number;
  lon: number;
  label: string;
};

/**
 * Geocodificacao reversa via Nominatim (OpenStreetMap) -- servico publico,
 * gratuito, sem chave de API. Politica de uso exige um User-Agent
 * identificando a aplicacao e limite de ~1 requisicao/segundo, o que e
 * mais que suficiente para o volume pessoal deste projeto.
 */
export async function resolveLocationLabel(lat: number, lon: number): Promise<ResolvedLocation> {
  const fallback: ResolvedLocation = { lat, lon, label: `latitude ${lat.toFixed(4)}, longitude ${lon.toFixed(4)}` };

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AURA-ARGUS-AI-Operating-System/1.0 (contato: profpaulofilho@gmail.com)' },
      // Evita cache indevido de localizacao entre usuarios/requisicoes.
      cache: 'no-store'
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const address = data?.address ?? {};
    const city = address.city || address.town || address.municipality || address.village || address.suburb;
    const state = address.state;

    if (city && state) return { lat, lon, label: `${city} - ${state}` };
    if (city) return { lat, lon, label: city };
    if (data?.display_name) return { lat, lon, label: String(data.display_name).split(',').slice(0, 3).join(',') };

    return fallback;
  } catch {
    return fallback;
  }
}
