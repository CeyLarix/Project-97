// Curated design proposals, informed by the linked 2026 colour forecasts.
// These are screen approximations, not matches to the named paint manufacturers.
// The supplied Ambiant Warm Oak herringbone floor and selected kitchen stay fixed in every proposal.
// Kitchen reference photos supply colour/material/shape cues; exact dimensions follow the indicative building plan.
export const STYLES = [
  {
    id: 'japandi',
    name: 'Jouw Japandi',
    subtitle: 'Warm, zacht en rustig',
    description: 'Jouw keuken met crème-zandkleurige fronten, geribbeld walnoot, licht geaderd steen en geborsteld brons. Warme greige kalkwanden, linnen en zachte ronde vormen sluiten aan op de Warm Oak-visgraatvloer.',
    label: 'JOUW RICHTING',
    swatches: ['#ddd8cd', '#795543', '#dfd2bf', '#9c8570'],
    colors: {
      wall: '#ded6c9', ceiling: '#f3eee5', cabinet: '#b8aa94',
      wood: '#b39b77', fabric: '#e0d5c2', accent: '#887b62',
      stone: '#e6ddca', metal: '#4a4438', rug: '#d4c8b4',
      wallAccent: '#c9bdab', secondaryFabric: '#b2a389', artwork: '#d4c7ae'
    },
    materials: { wallRoughness: .98, fabricRoughness: .94, stoneRoughness: .62, metalRoughness: .43, metalness: .5 },
    furniture: {
      sofa: 'soft-linen', tables: 'organic-nesting', dining: 'light-oak-oval',
      pendants: 'paper', artwork: 'mineral-relief', headboard: 'linen',
      cabinetDetail: 'plain', accentVase: 'chalk-ceramic', curtain: 'natural-linen'
    },
    features: { slatPanel: false, accentWall: false, sculpturalObjects: true, paperShade: true, brassDetail: false },
    lighting: { kelvin: 3000, warmth: '#ffebd3', eveningWarmth: '#ffd9aa' },
    note: 'De keuken volgt jouw aangeleverde ontwerp- en materiaalfoto’s en blijft in alle vier de sferen gelijk. De foto’s bepalen de materiaalindruk en opzet; exacte keukenmaten zijn niet uit de foto’s af te leiden.',
    sources: []
  },
  {
    id: 'walnut',
    name: 'Walnoot & travertin',
    subtitle: 'Warm hedendaags met meer diepte',
    description: 'Rondom jouw vaste keuken: zandkleurige wanden, walnootmeubels, licht travertin en crème bekleding. Geribbelde houtdetails en brons geven de overige kamers meer contrast en warmte.',
    label: 'ALTERNATIEF 01',
    swatches: ['#c8b89e', '#70523d', '#e3d8c2', '#665044'],
    colors: {
      wall: '#d2c5ae', ceiling: '#f0e9dc', cabinet: '#70523d',
      wood: '#79583f', fabric: '#e2d7c3', accent: '#715346',
      stone: '#d7c5a3', metal: '#8b7450', rug: '#bfb09b',
      wallAccent: '#a68d70', secondaryFabric: '#aa8b6c', artwork: '#9c8264'
    },
    materials: { wallRoughness: .94, fabricRoughness: .88, stoneRoughness: .48, metalRoughness: .34, metalness: .65 },
    furniture: {
      sofa: 'tailored-cream', tables: 'travertine-drum', dining: 'walnut-oval',
      pendants: 'bronze-sculpture', artwork: 'warm-abstract', headboard: 'channelled-fabric',
      cabinetDetail: 'fluted', accentVase: 'smoked-glass', curtain: 'warm-ivory'
    },
    features: { slatPanel: true, accentWall: true, sculpturalObjects: true, paperShade: false, brassDetail: true },
    lighting: { kelvin: 2800, warmth: '#ffe6c6', eveningWarmth: '#ffd49d' },
    note: 'De geselecteerde keuken en Warm Oak-vloer blijven behouden. De overige kamers variëren op warme neutralen en walnoot uit de 2026-kleurprognose; geen exacte verfkleuren.',
    sources: [{
      title: 'Sherwin-Williams · 2026 Universal Khaki & Special Walnut',
      url: 'https://blog.sherwin-williams.com/color/a-year-in-color/color-of-the-year-2026/'
    }]
  },
  {
    id: 'olive',
    name: 'Olijf & klei',
    subtitle: 'Natuurlijk, aards en persoonlijk',
    description: 'Jouw keuken blijft de basis, met daaromheen gedempt olijfgroen, warm eiken en kleine kleikleurige accenten. Kalksteen, geweven stoffen en keramiek brengen een natuurlijke sfeer in de overige kamers.',
    label: 'ALTERNATIEF 02',
    swatches: ['#d9cfbb', '#72775a', '#b28265', '#d7c7ad'],
    colors: {
      wall: '#ddd2be', ceiling: '#f2ecdf', cabinet: '#72775a',
      wood: '#a78c65', fabric: '#d8c7aa', accent: '#b28265',
      stone: '#d9ccb6', metal: '#4c4c3b', rug: '#c6b69b',
      wallAccent: '#8a8e72', secondaryFabric: '#ac785e', artwork: '#9b7957'
    },
    materials: { wallRoughness: .99, fabricRoughness: .95, stoneRoughness: .72, metalRoughness: .6, metalness: .35 },
    furniture: {
      sofa: 'woven-flax', tables: 'oak-and-clay', dining: 'natural-oak',
      pendants: 'woven', artwork: 'botanical-abstract', headboard: 'oak-slat',
      cabinetDetail: 'plain', accentVase: 'terracotta', curtain: 'unbleached-linen'
    },
    features: { slatPanel: false, accentWall: true, sculpturalObjects: true, paperShade: false, brassDetail: false },
    lighting: { kelvin: 3000, warmth: '#ffe9cd', eveningWarmth: '#ffdaac' },
    note: 'De geselecteerde keuken en Warm Oak-vloer blijven behouden. Aardetinten en groenen in de overige kamers zijn geïnspireerd op de Dulux-kleurprognose voor 2026.',
    sources: [{
      title: 'Dulux · Colour Forecast 2026',
      url: 'https://www.duluxpowders.com.au/colour-forecast-2026/'
    }]
  },
  {
    id: 'indigo',
    name: 'Indigo & linnen',
    subtitle: 'Verfijnd contrast, zacht gehouden',
    description: 'Vergrijsd blauw en diep indigo in de overige kamers, naast roomwit linnen en donker hout. Jouw keuken blijft behouden; de warme eikenvloer en kleiaccenten verbinden deze uitgesproken kleurvariant.',
    label: 'ALTERNATIEF 03',
    swatches: ['#cdd3d1', '#49576a', '#e4dbc8', '#956f59'],
    colors: {
      wall: '#d0d5d2', ceiling: '#f2eee5', cabinet: '#49576a',
      wood: '#7b5d43', fabric: '#e4dbc8', accent: '#956f59',
      stone: '#e4dfd0', metal: '#42474b', rug: '#c9c5b7',
      wallAccent: '#7e929d', secondaryFabric: '#778b99', artwork: '#617887'
    },
    materials: { wallRoughness: .95, fabricRoughness: .9, stoneRoughness: .55, metalRoughness: .48, metalness: .45 },
    furniture: {
      sofa: 'tailored-linen', tables: 'pale-stone', dining: 'dark-oak-oval',
      pendants: 'opal-glass', artwork: 'blue-abstract', headboard: 'upholstered-blue',
      cabinetDetail: 'plain', accentVase: 'earth-ceramic', curtain: 'oyster-linen'
    },
    features: { slatPanel: false, accentWall: true, sculpturalObjects: true, paperShade: false, brassDetail: false },
    lighting: { kelvin: 3000, warmth: '#ffebd4', eveningWarmth: '#ffddb0' },
    note: 'De geselecteerde keuken en Warm Oak-vloer blijven behouden. De overige kamers zijn een vrije interpretatie van Dulux Colours of the Year 2026; digitale tinten zijn geen verfstaal.',
    sources: [{
      title: 'Dulux · Colours of the Year 2026: indigo blues',
      url: 'https://www.dulux.co.uk/en/dulux-colours-of-the-year-2026'
    }]
  }
];

export const DESIGN_REFERENCES = [
  {
    name: 'Planner 5D',
    url: 'https://support.planner5d.com/en/articles/10581383-how-to-use-the-360-walkthrough-feature',
    detail: 'Referentie voor rondkijken op ooghoogte en meerdere gezichtspunten. De officiële 360 Walkthrough is een Planner 5D PRO-functie.'
  },
  {
    name: 'Homestyler',
    url: 'https://www.homestyler.com/solution/visualization_video-rendering?lang=en_US',
    detail: 'Referentie voor materiaal, licht en rondgangen als samenhangende interieurpresentatie.'
  },
  {
    name: 'Coohom',
    url: 'https://www.coohom.com/helpcenter/3FO4K4WAJ4P2',
    detail: 'Referentie voor ruimtekeuze, stijlvarianten en herkenbare gezichtspunten in een rondgang.'
  }
];
