// Simplified outline of the contiguous USA, traced clockwise.
// Each entry is [lat, lon]. ~45 points — recognizable shape, low triangle count.

export const USA_OUTLINE: [number, number][] = [
  // East coast, north → south
  [47.46, -67.79], // Maine NE
  [44.81, -66.96], // Eastport ME
  [44.27, -68.27], // Bar Harbor
  [42.96, -70.62], // NH coast
  [42.36, -70.95], // Boston
  [41.62, -70.55], // Cape Cod
  [41.08, -71.85], // RI / Long Island Sound
  [40.71, -74.01], // NYC
  [39.36, -74.42], // Atlantic City
  [38.79, -75.06], // Cape May
  [37.94, -75.41], // Chincoteague
  [36.85, -75.97], // Virginia Beach
  [35.22, -75.53], // Cape Hatteras
  [34.69, -76.66], // Beaufort NC
  [32.78, -79.93], // Charleston
  [31.95, -80.85], // Hilton Head
  [30.40, -81.40], // Jacksonville
  [27.59, -80.34], // Vero Beach
  [25.77, -80.19], // Miami
  [24.55, -81.78], // Key West (tip)
  // Gulf coast, east → west
  [26.14, -81.79], // Naples
  [27.34, -82.55], // Sarasota
  [27.95, -82.46], // Tampa
  [29.65, -83.39], // Big Bend FL
  [30.40, -86.62], // Destin / Florida panhandle
  [30.27, -88.04], // Pascagoula
  [29.95, -90.07], // New Orleans
  [29.30, -94.79], // Galveston
  [27.80, -97.40], // Corpus Christi
  [25.96, -97.15], // Brownsville
  // Mexico border, east → west
  [29.12, -100.99], // Eagle Pass
  [29.55, -104.41], // Big Bend TX
  [31.76, -106.49], // El Paso
  [31.33, -109.55], // AZ corner
  [32.50, -114.78], // Yuma
  [32.53, -117.13], // Tijuana / San Diego
  // Pacific coast, south → north
  [33.74, -118.41], // LA
  [35.37, -120.85], // San Luis Obispo
  [37.81, -122.48], // SF Golden Gate
  [38.95, -123.73], // Point Arena
  [41.76, -124.20], // Crescent City
  [43.35, -124.31], // Bandon OR
  [46.18, -124.06], // Long Beach WA
  [48.39, -124.73], // Cape Flattery
  // Canada border, west → east
  [48.99, -123.05], // Bellingham
  [48.99, -117.03], // ID panhandle
  [48.99, -104.05], // ND/MT
  [49.00, -97.23],  // MN border
  [48.00, -89.50],  // Lake Superior
  [46.50, -84.36],  // Sault Ste Marie
  [44.36, -82.50],  // Lake Huron
  [42.05, -82.92],  // Detroit / Windsor
  [43.10, -78.95],  // Niagara
  [44.31, -76.50],  // Thousand Islands
  [44.99, -74.74],  // Plattsburgh
  [45.00, -71.50],  // VT/NH border
  [45.30, -68.30]   // Maine inland — close to start
];

// Point-in-polygon test using ray casting (works in lat/lon space).
export function pointInUSA(lat: number, lon: number): boolean {
  let inside = false;
  for (let i = 0, j = USA_OUTLINE.length - 1; i < USA_OUTLINE.length; j = i++) {
    const [yi, xi] = USA_OUTLINE[i];
    const [yj, xj] = USA_OUTLINE[j];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
