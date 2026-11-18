// Graphic measurement of plot 097 from the original BPD legal situation sheet,
// 594x1400mm at nominal 1:200. The user PDF is an A4 reprint of that sheet.
// These are drawing-derived estimates, NOT dimensioned cadastral measurements.
export const PLOT97={
 minX:.09,maxX:10.92,frontZ:-3.76,rearZ:21.25,gardenFrontZ:13.7,
 width:10.83,depth:25.01,graphicPlotArea:270.7,marketingPlotArea:265,
 method:'Erfgrenslijnen grafisch gemeten op de oorspronkelijke 1:200-tekening; positionering op de woning is indicatief.',
 source:'assets/woning97/situatie-gebruiker.pdf',
 note:'Geen uitgeschreven maatketting. Tuinmaten zijn grafisch afgeleid; afwijkingen door afdruk, dakoverstek en gekozen uitbouw zijn mogelijk.'
};
export const GARDEN97=[[PLOT97.minX,13.7],[PLOT97.maxX,13.7],[PLOT97.maxX,PLOT97.rearZ],[PLOT97.minX,PLOT97.rearZ]];

// Design zones use the same retained plot estimate, without enlarging the parcel.
export const OUTDOOR_ROOM_IDS=['garden','frontgarden','driveway','sidepath','street','neighbor96','neighbor98','neighbor99','neighbor100'];
export const FORECOURT97={
 driveway:{x1:5.9,x2:10.7,z1:PLOT97.frontZ+.08,z2:7.60},
 sidepath:{x1:9.42,x2:10.62,z1:7.6,z2:14.1},
 gate:{hingeX:9.38,z:8.05,width:1.28,height:1.75},
 frontPath:{x1:.35,x2:5.9,z1:-2.2,z2:-1.1}
};
export function outsideWalkable(x,z,r=.17){
 if(x<=PLOT97.minX+r||x>=PLOT97.maxX-r||z<=PLOT97.frontZ+r||z>=PLOT97.rearZ-r)return false;
 return z<-.15||(x>5.23&&z<8.27)||(x>9.25&&z<14.15)||(z>13.25);
}
