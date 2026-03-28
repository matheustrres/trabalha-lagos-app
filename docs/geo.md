# Geolocalização — TrabalhaLagos

## Cidades da Região dos Lagos

```typescript
// src/common/constants/cities.ts
export const LAGOS_CITIES = [
  { slug: 'cabo-frio', name: 'Cabo Frio', lat: -22.8789, lng: -42.0187 },
  { slug: 'buzios', name: 'Armação dos Búzios', lat: -22.7469, lng: -41.8817 },
  { slug: 'arraial-do-cabo', name: 'Arraial do Cabo', lat: -22.9660, lng: -42.0275 },
  { slug: 'sao-pedro-da-aldeia', name: 'São Pedro da Aldeia', lat: -22.8394, lng: -42.1027 },
  { slug: 'araruama', name: 'Araruama', lat: -22.8729, lng: -42.3431 },
  { slug: 'saquarema', name: 'Saquarema', lat: -22.9200, lng: -42.5103 },
  { slug: 'iguaba-grande', name: 'Iguaba Grande', lat: -22.8392, lng: -42.2289 },
] as const;
```

## Raios de busca

Valores aceitos: 5, 10, 20, 30, 50, 100 km. O valor 100 cobre toda a Região dos Lagos.

## Bounding box da região

Para validar se uma vaga está na região:
- Latitude: -23.10 a -22.60
- Longitude: -42.60 a -41.80

## Geocoding

Módulo `geo` usa Nominatim (OpenStreetMap). Rate limit: 1 req/s. Resultados cacheados em Redis 24h.

**User-Agent obrigatório**: `trabalhalagos-backend` (Nominatim bloqueia requests sem identificação).

## Obtenção de coordenadas

**Candidato**: `navigator.geolocation` (browser) OU seleção manual de cidade (usar coordenadas do seed).

**Empregador**: busca de endereço com geocoding OU pin no mapa OU seleção de cidade.