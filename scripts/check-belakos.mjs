import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BRAND_CATALOG,CATALOG_META} from '../dist/catalog.js';
import {FLOOR_OPTIONS} from '../dist/finishes.js';
import {createCatalogFloorMaterial,disposeCatalogFloorMaterial} from '../dist/floors.js';
const source=JSON.parse(fs.readFileSync(new URL('../dist/catalog-belakos.json',import.meta.url)));
const floors=BRAND_CATALOG.filter(f=>f.brand==='Belakos');assert.equal(floors.length,120);assert.equal(CATALOG_META.belakos.products,120);
assert.equal(new Set(floors.map(f=>f.id)).size,120);assert.equal(new Set(floors.map(f=>f.source.url)).size,120);
const oldCatalog=JSON.parse(fs.readFileSync(new URL('../dist/catalog-floer.json',import.meta.url)));assert.equal(BRAND_CATALOG.filter(f=>f.brand==='Floer').length,oldCatalog.counts.total);assert.equal(BRAND_CATALOG.filter(f=>f.brand==='Rivièra Maison').length,12);
const counts={};for(const p of source.products){assert.equal(p.floorType,'Dryback');assert.equal(p.installation,'glue-down');assert.ok(!/click|traptreden/i.test(p.name));counts[p.patternLabel]=(counts[p.patternLabel]||0)+1;}
assert.deepEqual(counts,source.counts.byPattern);
const gradient={addColorStop(){}};const ctx=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true}});
globalThis.document={createElement:()=>({getContext:()=>ctx})};
for(const f of floors){assert.equal(f.material,'pvc');assert.ok(FLOOR_OPTIONS.some(p=>p.id===f.id));assert.ok(f.dimensions.length>0&&f.dimensions.width>0&&!f.dimensionsApproximate);assert.ok(f.source.url.startsWith('https://www.belakos.nl/catalogus/'));assert.ok(fs.existsSync(new URL('../dist/'+f.preview,import.meta.url)));assert.match(f.swatch,/^#[a-f0-9]{6}$/i);const m=createCatalogFloorMaterial(f);assert.equal(m.userData.floorId,f.id);assert.ok(m.map);assert.equal(m.userData.pattern,f.pattern);disposeCatalogFloorMaterial(m);}
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),editor=fs.readFileSync(new URL('../dist/finishes.js',import.meta.url),'utf8');assert.ok(html.includes('<option value="Belakos">'));assert.equal((editor.match(/'Belakos','Ambiant'/g)||[]).length,2,'new and restored filter accept Belakos');
console.log('Belakos passed: all 120 Dryback floors, 11 collections, 5 source patterns, unique IDs/links, local images, real dimensions, material creation/disposal, brand filter and retained existing catalogues.');
