# Mijn huis · Interieurstudio 97

Interactive 3-storey home studio, built from the supplied ground, first-floor and attic drawings. Static browser application, local Three.js r170 and addons.

## Experience
- Walk with WASD/arrow keys and drag to look. iPhone/iPad use a proportional thumb joystick plus simultaneous touch-look, with scoped Safari gesture suppression and adjustable sensitivity.
- Material menu: eight wall tints plus custom colour picker, and the official Rivièra Maison PVC catalogue and complete published Floer flooring catalogue, plus the original Ambiant choices. Apply to the current storey or whole house. Choices persist locally and survive style changes; the selected kitchen remains fixed.
- Floor catalogue snapshot checked 17 November 2026: 12 Rivièra Maison PVC executions (6 designs × 2 patterns) and 212 Floer flooring products, including 84 PVC. Four original Ambiant choices remain. Search, brand, pattern and material filters, and 24-item pagination keep it usable on mobile.
- Product names, dimensions and unchanged thumbnails come from official supplier pages/API. Floor appearance remains an uncalibrated procedural approximation; perspective product photos are not stretched onto the 3D floor. Product source URLs and formats are visible.
- Floer coverage: all 321 official Store API products across four pages crossmatched to 321 sitemap URLs; 109 accessories, wall panels, roomdividers and samples excluded. Rivièra Maison coverage: six official design pages with two PVC patterns each. Raw sources: dist/catalog-floer.json and dist/catalog-riviera.json; normalized data: dist/catalog.js.
- Catalogue materials are generated only on selection. A pinned eight-material LRU cache preserves the three active floor selections and bounds GPU memory.
- Three levels, fourteen room viewpoints, minimap and staircase navigation controls.
- Four coordinated styles: Japandi, walnut/travertine, olive/clay, indigo/linen.
- Two realistic sofa variants, physically based furniture assets, plaster/linen/stone textures, environment lighting and optional GTAO contact shading.
- Day/evening, guided viewpoint tour, floor overview, fullscreen and PNG capture.
- Public sharing audience preserved, as explicitly authorized by the user.

## Sources and assumptions
The user's PDF and Warm Oak photo remain available in the app. Main ground-floor interior about 5.4 × 13.6 m; upper floors about 5.4 × 10 m. Storey elevations +2.920/+5.840 m follow the sale section; ceiling 2.70 m remains a visualisation assumption. Attic knee walls 1.63 m follow drawing; roof ridge~5.5m is inferred, not a surveyed height. The building is a conceptual measured-plan approximation.

The ground-floor Ambiant XL herringbone floor is a procedural colour/material approximation; upper-floor materials and furniture are proposals. The kitchen now follows the supplied design and material-board photographs: cream-sand tall units, two black ovens side by side, illuminated sink niche, fluted walnut island, pale polished veined stone, champagne-bronze fittings and an integrated wine cooler. The selected kitchen remains fixed across all four style palettes. Its dimensions follow the building-plan kitchen footprint, with details interpreted from the photographs. Style palettes are custom digital interpretations, with current source links in styles.js and the in-app credits. Asset licenses and source URLs: dist/assets/credits.json and CREDITS.md.

## Validation
- Syntax and local module/image references.
- All 224 imported products and 230 supplier images audited; every imported product selected through actual menu button handlers.
- Filters, search, pagination, aliases, persistence and the eight-material cache verified.
- All 14 room spawn positions free; internal navigation checked with furniture collision boxes on 5 cm grid (external storage intentionally separate).
- All 3 levels, room navigation, 4 styles, overview/walk and startup defaults checked with DOM/renderer stubs.
- Actual GLB files parsed through GLTFLoader; finite bounds/materials/triangles checked (image decode mocked for Node).
- All geometry/transforms finite.
- Selected kitchen fixed-material invariance and appliance placement checked.
- iOS pointer/touch fallback two-finger, cancellation and release logic simulated; actual iOS Safari device testing unavailable.
- Browser visual/render QA unavailable: required managed cua_repl.js tool not exposed. This verification limit is reported at handoff.

Serve dist/ through a static server. No build or dependency install needed for deployment; optional npm run check performs syntax checks.

## Official BPD reference update
Retrieved the supplied public configurator and property page, the B9097 sale drawing, B9001 legal situation and technical specification. Official storey elevations are +2.920/+5.840m. Standard sale drawing and earlier user-selected options differ; user options retained. Outdoor movement now passes through the rear glazing into a provisional garden. The property page states approximately265m² plot,102m² rear garden and27m² front garden; no dimensioned garden boundary was found. Exact garden shape/dimensions remain unverified pending a measured plot drawing. The configurator enforces SAMEORIGIN framing and is linked externally rather than embedded.

## Orientation and exterior view
The original plan-to-Three conversion used the opposite X handedness when facing the front elevation. A single reflected scene root (worldX=5.4-planX) now includes all floors, furniture and garden; camera positions, walking collision checks and minimap headings use the corresponding inverse conversion. From the street the side annex appears to the right, matching the supplied front elevation.

The Exterior toggle now uses converted original BPD geometry and project texture assignments, with signed-option rear facade overrides (see Original exterior geometry below). Drag/touch orbits and desktop wheel zooms; toggling off restores the exact prior viewpoint. Garden dimensions remain provisional.

## User site drawing and ViSoft bathroom
The uploaded A4 site drawing is a reduced reprint of B9001, without dimension chains. The original full-size BPD sheet was used for nominal graphic measurement of plot097. The drawn plot is roughly10.8m wide and25.0m deep; graphic area~270.7m² differs from marketingapprox265m². House placement uses an indicative roof/wall alignment, so gardenwidth~10.8m andopenrear depth~7.6m are NOT surveyed measurements. Bounds and source notes:dist/plot97.js.

Bathroom source:https://visoft360.com/en/projectmodel3d/viewer/PYCfEWM, publiclydownloadableGLB titled25-5010bnr97O-1. Geometry/material assignments unchanged; embeddedimages resized to512px forGPUmemory (~7MB instead38MB). Model lazyloads onfirstfloorvisit; provisionalbathroom thenhides andsourcegeometry replacesit. Bathroomstiles/sanitary remainfixed toViSoftdesign. Sourcehashandtransformrecorded inassets/badkamer/source.json.


## Dimension audit · 17 November 2026
The newly supplied signed option PDF (9648 nieuw, 25 September 2026) governs chosen extensions; B9097 is the standard reference and supplies storey levels. Do not substitute its smaller standard living/kitchen or single garage for the selected configuration.

Ground clear envelope 5.40 × 13.60 m is retained. The kitchen-side rear face of the stair/hall/toilet core was 8.25 m and is now 8.40 m from the interior front face. Core envelope 2.77 × 3.85 m leaves 5.40×13.60−2.77×3.85=62.7755 m², matching the drawing's 62.8 m². Kitchen zone is 5.20 m deep. The toilet clear footprint is corrected from 1.28×0.83 to 1.33×0.93 m. Stair enclosure front/back faces and the L-shaped hall, WC/meter cupboard doors and entrance opening follow the actual wall faces instead of guessed centre lines.

The annex's shared wall was too thin. Its clear left/right faces move from x5.65/8.65 to x5.82/8.82, maintaining the explicit 3.00 m clear width with a 0.42 m shared wall. Office is 3.00×3.55 m (was 3.00×3.65); storage is 3.00×1.85 m, separated by a 0.10 m partition. Shell, furniture, walk boundaries and exterior use the corrected geometry. Kitchen furniture moves 0.15 m rearward to clear the corrected core.

First floor 5.40×10.00 m, front setback 1.20 m, master width3.10/depth4.00, bath width2.20/depth4.00, bedroom2 width2.63, bedroom3 2.67×3.35 m and attic knee clear depth7.435 m were checked against both PDFs and retained. The ViSoft bathroom remains at actual model scale. Roof ridge, finished ceiling heights, some window details and the plot-to-house position remain indicative; this audit does not convert them to surveyed dimensions.

Validation: npm run check; node scripts/check-dimensions.mjs; full app geometry/navigation/material/touch/Bathroom regression harness. Browser visual QA unavailable in this managed environment.


## Original exterior geometry · 17 November 2026
The previous envelope mistakenly reused interior walls, room ceilings and knee-wall roof surfaces. It is replaced by the publicly available BPD binary geometry for Type E / 97, combined with its extension2400, annex-converted-to-home, default roof, sliding rear door, storage door, under-stair cupboard and default layout option models. This retains real gables, full eave-to-ridge roof surfaces, tall ground glazing, recessed entrance, facade bands, roof trims, downpipes and roof plant. Public material assignments supply beige masonry, vertical masonry, brown frames and dark roof textures. No arbitrary scaling: sourceZ is up, planX=135.55−sourceX, planZ=sourceY−58.95, then the existing houseRoot street orientation applies.

The generic BPD rear slider was narrower than signed9648 page1: the main rear facade is explicitly rebuilt with a4.07m opening and the annex rear glazed door1.70m to follow options101A/102. These are drawing-derived approximations, not BIM-exact option objects. Internal walkthrough geometry and measured room dimensions remain independent.

Regenerate with `python scripts/build-exterior.py` (NumPy required). Source binaries/metadata are retained in sources/exterior; no credentials. Exported model is about6.6MB,416 meshes,53325 triangles. Excludes IfcSpace and IfcOpeningElement solids. Texture resolution is capped1024 for mobile. GLB loads on demand, retries after network failure and is reused. Garden walking displays the same source envelope once loaded; returning inside restores the interior.

Validation: actual GLTFLoader parse, finite geometry/UV/material checks, expected facade/roof features, left/right alignment, loader concurrency/retry and full app navigation/touch/material tests. A CPU geometry projection checked the facade silhouettes against the PDF; this is not browser/WebGL visual QA, which is unavailable.


## Kitchen handedness correction · 17 November 2026
The earlier houseRoot X reflection also reversed the user's kitchen design in a frontal view. Restore only the cabinet run and island's along-wall handedness, each about its own existing Z midpoint (10.175 / 10.525 m before the existing0.15m parent offset). With the established houseRoot orientation, oven-left/oven-right and the wine fridge now project to the left of the sink niche / hob when facing the kitchen, matching keuken-ontwerp.jpg. Distinct assembly midpoints preserve both plan footprints, cabinet wall location, island clearance and the unchanged symmetric AABB collision bounds. Lights and all detailing travel with their respective assembly. Floors, architecture, exterior and other storeys keep their established orientation.

Validation: perspective screen projection of the actual kitchen mesh feature positions under the real houseRoot transform, cabinet/island depth bounds and collision coordinates, fixed materials across palettes, and the full app door-route/navigation/touch/exterior regression. Browser visual QA remains unavailable.


## Forecourt, annex and window audit · 17 November 2026
Forecourt geometry is in dist/forecourt.js; all plot/design zones and outside walk limits are in plot97.js. No plot extent was enlarged. The retained graphically measured estimate is10.83×25.01m, which is not a cadastral measurement (marketing ca265m² versus drawn270.7m²). Design: warm staggered clinker driveway, two2.25×5.10m parking bays, a1.20m side path and1.28m open wooden gate beside the annex. Low planted beds, a multi-stem tree and path lanterns fit within the existing parcel estimate. Street/neighbor context moved outside the front boundary instead of crossing the front garden. Planting uses instanced geometry for mobile. Gate is shown open; it is not an interactive gate mechanism.

Front garden, driveway and side passage are navigable from room buttons and via the existing hall/storage doors. The outside shell is shown in every outdoor zone, the mini-map includes the front boundary, planting/fence/post collision boxes protect the free route, and crossing back indoors restores the interior.

All ground-floor annex office furniture and storage shelving/colliders have been removed; office room label is now Bijkeuken. Attic technical appliances remain. The existing hall console, legs and vase are relocated to the free kitchen wall (console centre x0.24/z11.4); its mirror remains in the hall.

Window positions and frame heights checked against B9097 elevations and public BPD geometry (sources/exterior/geometry-audit.json). Corrected interior ground front pair to x0.525–2.225 /3.235–4.935, side to z2.430–3.464, opening lower level0.02m and upper2.546m. Front fixed glass has no invented centre mullions. First floor sill0.366m and frame top2.546m (relative to +2.920), not the former0.75/1.20m assumptions; paired front/rear openings and mullion split positions corrected. Side gable window is local z4.886–5.586 with0.366m sill above +5.840. Bathroom ViSoft source already has a low window (frame bottom~0.352m) and remains untouched. Signed option rear openings retain the4.07m sliding opening and1.70m annex glazed door, now aligned between interior and exterior. Window glass blocks walking; glazed door openings remain passable. These are interpreted clear-frame positions, not fabrication dimensions or a complete door hardware audit.

Validation: node scripts/check-yard.mjs (geometry contained in retained plot, gate/path clearance, window heights/pane rules), all room spawn checks and collision BFS from kitchen through hall to front/drive/side/rear/storage, empty-annex and moved-console checks, and the existing touch/material/exterior/Bathroom regressions. Browser visual QA unavailable.


## Street and neighbour visits · 17 November 2026
Added original public BPD models96(Type F),98(F1),99(G) and100(H) from the supplied phase2 street configurator. Original source metadata/binaries are in sources/neighborhood; regenerate with `python scripts/build-neighborhood.py` (NumPy). The transform preserves each unit's WGS84 offset, rotation and family mirror relative to the existing97 frame, rather than cloning97 or guessing distances.96 adjoins97,98/99 form the next pair,100 is farther along the same street. Gardens/aprons of other owners are indicative landscaping, not surveyed parcels. The previous invented houses across the road were removed.

For96/98/99, full source envelopes and actual ground-floor partitions/windows are walkable with source-derived wall/window collision segments at1.10m eye-body height. Door leaves are omitted for virtual passage. These are unfurnished standard building configurations, not the neighbours' private interior designs. Upper storeys are visible externally but do not have a separate visiting navigation mode.100's envelope uses the selected shell geometry published by the linked CasaBakici app (public bpd-upper-data.js), preserving its extension/options. Entering100's actual front door opens the original public CasaBakici site in a full-screen iframe. Return closes/unloads that iframe and restores the outside doorstep. This preserves the owner's actual furnishings and navigation, and does not edit or host a fork of their Site. Original-origin fallback link remains available. Parent rendering and movement pause during the child visit for iOS performance. No frame-ancestor restrictions were present in either public page's response headers, but actual browser execution is unverified here.

Neighbour geometry loads sequentially after the owner's initial scene is ready, or on first street navigation. Static geometry is merged by material (179 mesh batches instead of1586 source meshes across the four houses). Material textures are shared; collision segments use spatial bins for mobile. All four door approaches and room-menu destinations are reachable from97's kitchen via its hall, driveway and pavement. Street map includes neighbour labels only while visiting the street; own interior mini-map keeps its original scale.

Validation: `node scripts/check-neighborhood.mjs` parses all four actual GLBs, checks mesh/normal finiteness, placement ordering, wall/doorway passage and100 trigger. Full app harness traversed584003 free cells from97, verified all four entry points, original CasaBakici URL, automatic doorway opening, return/unload and restoring own interior. Existing geometry, finishes, kitchen handedness, touch controls, bathroom and yard checks passed. Browser visual/iframe execution QA is unavailable. Source/limitations:dist/assets/neighborhood/source.json.


## Ghost mode and kitchen dining · 17 November 2026
Continues saved Sites version 12 (9483e4914003b38e0b2219bd19114438f3e296e2). Ghost mode toggles collision-free movement for keyboard, onscreen buttons and joystick on every storey. Switching it off inside a solid finds a nearby free position, with a room-spawn fallback. Normal collision queries and the existing house, materials, garden and neighborhood remain intact.

The existing oval table and four original chairs move to the free side of the kitchen island, centered at plan x1.25/z10.10. Their dimensions and materials are retained. A ceiling lamp above has one oval plate, four shared-geometry fluted warm shades and three slim pendants at staggered heights; its warm light remains fixed across style palettes. Room viewpoints follow the new table.

Validation: syntax; check-ghost (actual movement/toggle functions, all three input paths/storeys, solid recovery); check-dining (actual meshes, collisions and navigation); existing dimension, kitchen orientation, yard, exterior and original neighbor-model checks. Managed browser preview was attempted but its relay timed out; visual WebGL QA remains unverified.


## Girls' rooms and person at house 100 · 17 November 2026
Continues version 13. Bedroom 2 now uses blush/old-rose fabrics, a rainbow print and a teddy; bedroom 3 uses lilac/sage, a moon/star print and a teddy. Each has one 90 × 200 cm mattress and one pillow. Their room-local furnishing palettes and white PAX finishes remain fixed while house style choices retain their existing behavior elsewhere. Room-menu names are Meisjeskamer 2/3.

The IKEA PAX frame dimensions are based on the official [75 × 58 × 201 cm frame](https://www.ikea.com/nl/nl/p/pax-basiselement-kledingkast-wit-80458231/) and [100 × 58 × 201 cm frame](https://www.ikea.com/nl/nl/p/pax-basiselement-kledingkast-wit-70458203/). Doors/handles/shelving are a procedural visual interpretation: the narrow frame has a 50 cm door plus a 25 cm open shelf bay; the wide frame has two plain doors. Both fit inside the bedrooms and leave the approaches clear. Master bedroom, source bathroom, landing and attic geometry/materials are checked against version 13.

The uploaded persoon_met_pakket.glb is retained at its original metre scale, about 1.815 m tall, with its original embedded image/material data. It stands near the entrance to house 100, offset from the doorway and portal route. A body/parcel collision preserves normal walking around it; Ghost mode keeps its existing behavior. It loads once with the street models and retains its original face/parcel handedness under the house orientation transform.

Validation: syntax, check-kids (run with `git show e40633599b4eff2943918f00f5c9e19d5c2a45f0:dist/interiors.js | node scripts/check-kids.mjs`), existing dining/Ghost/navigation checks, and original-model/texture/scale/placement checks for the uploaded person. Managed browser preview was retried, but its relay still times out; visual WebGL QA remains unverified.


## Kitchen completion, reversed living room, mancave and ambience · 17 November 2026
Continues version 14, preserving the previously added girls' rooms/PAX, Ghost mode, dining lamp and person at house 100. The sink wall now has three distinct full-height cream upper cupboard fronts and a genuinely open walnut display shelf above the tap, with warm upper/undershelf lighting. The shelf remains within the retained kitchen footprint; oven placement, island, appliances, materials and handedness are unchanged. The two newly supplied kitchen photos guide the cabinet/plank appearance.

A procedural model of the user's [Barco Sora 46244 sand/champagne spotlight bar](https://www.barco.nl/p/zandkleurige-opbouwspot-120cm-mini-gu10-verstelbare-lichtpunten/46244) is centred over the island: 120 cm long, 3 cm bar width, 10 cm mounting block and six angled MINI GU10 heads. These published dimensions and the product image guide the interpretation; it is not a manufacturer CAD asset. Its warm lights and sand finish stay fixed across palettes.

Only the living furnishings are reflected across the room: TV and console on the opposite wall, sofas/armchair/coffee tables/rug/lamp/art together, including actual loaded GLBs, fallbacks, colliders and entry viewpoint. The existing house/street orientation and kitchen dining set remain intact. The former Bijkeuken is now Mancave, with a compact two-seat sofa facing a wall TV, a white/black PlayStation-style console/controller, an 8-rod/22-player table-football model, and a separate-door refrigerator/freezer. Furniture and handles fit the retained shell, while kitchen and garden routes remain navigable.

Movement now offers Normaal (2 m/s), Vlot (3.2 m/s) and Rennen (5 m/s), with the selected speed persisted. Movement substeps prevent running through thin walls in normal mode, and apply to keyboard/buttons/joystick. Jazz starts off and plays only after a user action: a local Web Audio lounge arrangement with seventh/ninth chord voicings, bass and swung brushes. There are no external audio files or copyrighted recordings. The toggle fades/stops playback, frees voices and pauses while the tab is hidden.

Validation: syntax; actual retained living GLBs/fallbacks and routes; cabinet/shelf visibility raycast and island spotlight geometry/target placement; mancave prop bounds and routes; speed/collision/Ghost and audio lifecycle checks. Managed browser/WebGL visual verification remains unavailable in this environment.
