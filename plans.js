import {HOUSES} from './neighborhood-data.js';
import {PLOT97,GARDEN97} from './plot97.js';
// Geometry transcribed from the supplied drawing, bouwnummer 97.
// Metres. Every polygon, wall and opening uses LOCAL floor coordinates:
// x=left -> right, z=front -> rear. Add level.origin.z for alignment with ground.
// Audit 2026-11-18: explicit dimensions from option drawing 9648 nieuw (25-9-2026).
// Dimensions describe clear wall faces, never wall centre lines. Signed source stays private.
// Main clear envelope 5.40 × 13.60; core 2.77 × 3.85 gives 62.7755 m² living/kitchen.
// Storey levels +2.920/+5.840 are from the sale section; ceiling height remains indicative.
const rect=(x1,z1,x2,z2)=>[[x1,z1],[x2,z1],[x2,z2],[x1,z2]];
const bounds=(x1,z1,x2,z2)=>({x1,z1,x2,z2});
const door=(axis,fixed,from,to,connectsTo)=>({axis,fixed,from,to,bottom:0,top:2.3,height:2.3,type:'door',connectsTo});
const opening=(from,to,bottom=.366,top=2.546,type='window')=>({from,to,bottom,top,type});
const wall=(x1,z1,x2,z2,openings=[],thickness=.1)=>({from:[x1,z1],to:[x2,z2],openings,thickness});
const room=(id,name,area,polygon,extra={})=>({id,name,area,polygon,ceilingHeight:2.7,...extra});
const upperStairs={bounds:bounds(2.73,3.45,5.4,4.65),opening:door('x',4.65,3.65,4.4,'stairs'),frontElevationDirection:'rear',note:'Trap bevindt zich boven dezelfde kern als begane grond; bovenste vlucht is indicatief.'};

export const levels=[
  {
    id:'ground',name:'Begane grond',floorElevation:0,height:2.7,origin:{x:0,z:0},
    bounds:bounds(0,0,8.82,13.6),footprints:[rect(-.1,-.1,5.55,13.75),rect(5.55,7.95,9.02,13.75)],
    ceilingHeight:2.7,
    rooms:[
      room('living','Woonkamer',null,rect(0,0,5.4,4.55),{bounds:bounds(0,0,5.4,4.55),spawn:[1.05,1.65,4],look:[4.2,1.15,1.9]}),
      room('dining','Eethoek',null,rect(0,8.4,2.5,11.7),{bounds:bounds(0,8.4,2.5,11.7),spawn:[1.1,1.65,8.5],look:[1.10,1.45,11.8]}),
      room('kitchen','Keuken',null,rect(0,8.4,5.4,13.6),{bounds:bounds(0,8.4,5.4,13.6),spawn:[2.2,1.65,8.8],look:[3.8,1.05,11.3]}),
      room('hall','Entree & hal',5.4,[[2.7,6],[5.4,6],[5.4,7.83],[4.1,7.83],[4.1,7.37],[2.7,7.37]],{bounds:bounds(2.7,6,5.4,7.83),doors:[door('z',2.665,6.07,7.07,'dining'),door('z',5.5,6.086,7.22,'outside')],spawn:[4.7,1.65,6.55],look:[2.9,1.2,6.45]}),
      room('toilet','Toilet',null,rect(2.7,7.37,4.03,8.3),{bounds:bounds(2.7,7.37,4.03,8.3),spawn:[3.55,1.65,7.55],look:[3.3,.6,8],doors:[door('x',7.335,2.75,3.7,'hall')]}),
      room('office','Werkruimte',null,rect(5.82,10.05,8.82,13.6),{bounds:bounds(5.82,10.05,8.82,13.6),doors:[door('z',5.61,12.15,13.1,'kitchen')],spawn:[6,1.65,12.65],look:[7.9,1.05,11.1]}),
      room('storage','Berging',null,rect(5.82,8.1,8.82,9.95),{bounds:bounds(5.82,8.1,8.82,9.95),doors:[door('x',8,7.216,8.35,'outside')],spawn:[7.65,1.65,8.4],look:[6.25,1.05,9.5]})
    ],
    stairwell:{bounds:bounds(2.7,4.7,5.4,6),opening:door('x',6.05,3.72,4.41,'hall')},
    note:'Woonkamer/keuken totaal 62,8 m² volgens tekening. Rechter berging heeft een eigen buitendeur.'
  },
  {
    id:'first',name:'Eerste verdieping',floorElevation:2.92,height:2.7,origin:{x:0,z:1.2},
    bounds:bounds(0,0,5.4,10),footprints:[rect(0,0,5.4,10)],ceilingHeight:2.7,
    rooms:[
      room('bedroom1','Slaapkamer 1',15,[[0,4.19],[1.43,4.19],[1.43,6],[3.1,6],[3.1,10],[0,10]],{bounds:bounds(0,4.19,3.1,10),doors:[door('z',1.48,4.95,5.9,'landing')],spawn:[1.8,1.65,6.75],look:[1.25,.95,8.7],windows:[{axis:'x',fixed:10,from:.51,to:2.21,bottom:.366,top:2.546}]}),
      room('bedroom2','Meisjeskamer 2',8.5,[[0,0],[2.63,0],[2.63,2.2],[1.43,2.2],[1.43,4.09],[0,4.09]],{bounds:bounds(0,0,2.63,4.09),doors:[door('z',1.48,2.35,3.3,'landing')],spawn:[1.92,1.65,1.9],look:[.65,.9,1.25],windows:[{axis:'x',fixed:0,from:.525,to:1.225,bottom:.366,top:2.546}]}),
      room('bedroom3','Meisjeskamer 3',8.9,rect(2.73,0,5.4,3.35),{bounds:bounds(2.73,0,5.4,3.35),doors:[door('z',2.68,2.35,3.3,'landing')],spawn:[3.15,1.65,2.7],look:[4.5,.9,1.3],windows:[{axis:'x',fixed:0,from:3.235,to:4.935,bottom:.366,top:2.546}]}),
      room('bathroom','Badkamer',7.9,rect(3.2,6,5.4,10),{bounds:bounds(3.2,6,5.4,10),doors:[door('x',5.95,3.3,4.25,'landing')],spawn:[3.8,1.65,6.65],look:[4.6,1.1,8.8],windows:[{axis:'x',fixed:10,from:3.67,to:4.37,bottom:.366,top:2.546}],note:'Aannemelijke sanitairposities uit optieschets: bad rechtsachter, douche rechtsmidden, toilet rechtsvoor, wastafel linksachter.'}),
      room('landing','Overloop',10.6,[[1.53,2.3],[2.63,2.3],[2.63,4.8],[5.4,4.8],[5.4,5.9],[1.53,5.9]],{bounds:bounds(1.53,2.3,5.4,5.9),spawn:[2.05,1.65,4.9],look:[4.3,1.1,5.3],note:'Oppervlak 10,6 m² omvat trapzone volgens tekening.'})
    ],
    walls:[
      wall(-.1,-.1,5.5,-.1,[opening(.525,1.225),{...opening(3.235,4.935),mullion:4.25}],.2),
      wall(-.1,10.1,5.5,10.1,[{...opening(.51,2.21),mullion:1.525},opening(3.67,4.37)],.2),
      wall(-.1,-.1,-.1,10.1,[],.2),wall(5.5,-.1,5.5,10.1,[],.2),
      wall(2.68,0,2.68,3.4,[opening(2.35,3.3,0,2.3,'door')]),
      wall(0,4.14,1.48,4.14),
      wall(1.48,2.25,1.48,5.95,[opening(2.35,3.3,0,2.3,'door'),opening(4.95,5.9,0,2.3,'door')]),
      wall(1.48,2.25,2.68,2.25),
      wall(1.48,5.95,5.4,5.95,[opening(3.3,4.25,0,2.3,'door')]),
      wall(3.15,5.95,3.15,10),
      wall(2.68,3.4,5.4,3.4),
      wall(2.68,3.4,2.68,4.75),
      wall(2.68,4.75,5.4,4.75,[opening(2.91,5.15,0,2.7,'stairs')])
    ],
    stairwell:upperStairs,
    note:'Buitenwerkse terugligging is afgeleid uit plattegronden: circa 1,2 m aan voorzijde en 2,4 m aan achterzijde. L-vorm van slaapkamers 1 en 2 behouden.'
  },
  {
    id:'attic',name:'Zolder',floorElevation:5.84,height:5.5,origin:{x:0,z:1.2},
    bounds:bounds(0,0,5.4,10),footprints:[rect(0,0,5.4,10)],
    walkableBounds:bounds(0,1.28,5.37,8.715),ceilingHeight:null,
    roof:{axis:'z',kneeFrom:1.28,kneeTo:8.715,ridgeAxis:'x',ridgeZ:5,ridgeHeight:5.5,slope:1.04,kneeHeight:1.63,frontKneeZ:1.28,rearKneeZ:8.715,frontHeight230Z:1.95,frontHeight260Z:2.23,rearHeight260Z:7.80,rearHeight230Z:8.10,eavesAccessible:false,note:'Schuin dak met knieschotten op 1,63 m volgens tekening. Nokhoogte afgeleid uit 2,30/2,60 m hoogtelijnen; indicatief.'},
    rooms:[
      room('attic-room','Zolder',28.6,[[0,1.28],[5.37,1.28],[5.37,5.895],[2.5,5.895],[2.5,8.715],[0,8.715]],{bounds:bounds(0,1.28,5.37,8.715),ceilingHeight:null,spawn:[1.65,1.65,4.9],look:[3.6,1.2,2.6],note:'Open zolder, met trapgat en afzonderlijke techniekruimte. Hoogte neemt af naar voor- en achterzijde.'}),
      room('utility','Techniekruimte',7.1,rect(2.6,5.995,5.37,8.715),{bounds:bounds(2.6,5.995,5.37,8.715),ceilingHeight:null,doors:[door('x',5.945,3.3,4.25,'attic-room')],spawn:[3.25,1.65,6.65],look:[4.8,1.2,7.9],note:'Wasmachine/droger links, warmtepomp/ventilatie rechts; HydroTop op dak ter hoogte van achterste midden. Geen extra buitenramen verondersteld.'})
    ],
    walls:[
      {...wall(-.1,1.23,5.47,1.23,[],.1),height:1.63},{...wall(-.1,8.765,5.47,8.765,[],.1),height:1.63},
      wall(-.1,1.23,-.1,8.765,[],.2),wall(5.47,1.23,5.47,8.765,[opening(4.886,5.586,.366,2.546)],.2),
      wall(2.55,5.945,2.55,8.715),
      wall(2.55,5.945,5.37,5.945,[opening(3.3,4.25,0,2.3,'door')])
    ],
    stairwell:upperStairs,
    note:'Zoldermaat tussen knieschotten 7,435 m; breedte onderzijde 5,370 m. Niet-gebruikte bergruimte achter de knieschotten blijft gesloten.'
  }
];

// Ground shell mirrors the original walkthrough, including opening clearances.
levels[0].walls=[
 wall(-.1,-.1,-.1,13.7,[],.2),
 wall(-.1,-.1,5.5,-.1,[{...opening(.525,2.225,.02,2.546),mullion:false},{...opening(3.235,4.935,.02,2.546),mullion:false}],.2),
 wall(-.1,13.7,5.5,13.7,[opening(.55,4.62,0,2.56,'glazed-door')],.2),
 wall(5.5,-.1,5.5,8.0,[opening(2.43,3.464,.02,2.546),opening(6.086,7.22,0,2.546,'door')],.2),
 wall(5.61,8.0,5.61,13.7,[opening(12.15,13.1,0,2.35,'door')],.42),
 wall(5.61,8.0,8.92,8.0,[opening(7.216,8.35,0,2.546,'door')],.2),
 wall(8.92,8,8.92,13.7,[],.2),
 wall(5.61,13.7,8.92,13.7,[{...opening(6.62,8.32,0,2.56,'glazed-door'),mullion:7.27}],.2),
 wall(5.61,10,8.92,10,[],.1),
 wall(2.665,4.55,2.665,8.4,[opening(6.07,7.07,0,2.35,'door')],.07),
 wall(2.63,4.625,5.4,4.625,[],.15),wall(2.63,8.35,5.4,8.35,[],.1),
 wall(2.7,7.335,4.065,7.335,[opening(2.75,3.7,0,2.3,'door')],.07),
 wall(4.1,7.865,5.4,7.865,[opening(4.15,4.9,0,2.2,'door')],.07),
 wall(4.065,7.37,4.065,8.4,[],.07),
 wall(2.7,6.05,5.4,6.05,[opening(2.75,3.7,0,2.35,'door'),opening(2.91,5.15,0,2.7,'door')],.1)
];

export const levelById=Object.fromEntries(levels.map(level=>[level.id,level]));
export function atticCeilingHeight(z){const r=levelById.attic.roof;return Math.max(.25,Math.min(r.ridgeHeight,r.kneeHeight+(z-r.frontKneeZ)*r.slope,r.kneeHeight+(r.rearKneeZ-z)*r.slope));}

// Exterior remains a provisional layout until a dimensioned plot is supplied.
levels[0].rooms.push({id:'garden',name:'Tuin · situatietekening',polygon:GARDEN97,bounds:{x1:PLOT97.minX,z1:13.7,x2:PLOT97.maxX,z2:PLOT97.rearZ},spawn:[4,1.65,17],look:[2.8,1.4,13.7],note:PLOT97.note});

// User-designed forecourt and accessible side route; parcel limits stay unchanged.
levels[0].rooms.push(
 {id:'frontgarden',name:'Voortuin',polygon:rect(PLOT97.minX,PLOT97.frontZ,5.9,-.15),bounds:bounds(PLOT97.minX,PLOT97.frontZ,5.9,-.15),spawn:[4.85,1.65,-1.65],look:[2.1,1.15,-2.8]},
 {id:'driveway',name:'Oprit',polygon:rect(5.72,PLOT97.frontZ,PLOT97.maxX,8.27),bounds:bounds(5.72,PLOT97.frontZ,PLOT97.maxX,8.27),spawn:[7.1,1.65,3.8],look:[6.4,1.25,6.7]},
 {id:'sidepath',name:'Zijpad & tuinpoort',polygon:rect(9.25,8.27,PLOT97.maxX,13.7),bounds:bounds(9.25,8.27,PLOT97.maxX,13.7),spawn:[10.02,1.65,10.6],look:[10.02,1.2,13.9]}
);

levels[0].rooms.push({id:'street',name:'Straat · Het Lint',polygon:rect(-12,-11.2,49,-3.76),bounds:bounds(-12,-11.2,49,-3.76),spawn:[7.5,1.65,-5.0],look:[20,1.3,2]});
for(const h of HOUSES){const b=h.bounds;levels[0].rooms.push({id:'neighbor'+h.number,name:h.number===100?'100 · CasaBakici':'Bezoek '+h.number+' · bouwmodel',polygon:rect(b.minX,b.minZ,b.maxX,b.maxZ),bounds:bounds(b.minX,b.minZ,b.maxX,b.maxZ),spawn:h.approach,look:[h.entry.x,1.35,h.entry.z]});}
