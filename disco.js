import {Vector3} from './assets/three.module.js';
// Reuse existing fixtures: changing the light count recompiles every lit material.
export function createDisco({camera,fixtures,getLevel=()=>0,onState=()=>{}}){
  let enabled=false,level=-1,last=-Infinity,selected=[];
  function restore(){for(const s of selected){s.light.position.copy(s.position);s.light.color.copy(s.color);s.light.intensity=s.intensity;}selected=[];level=-1;}
  const worldPosition=new Vector3();
  function select(index){
    restore();level=index;
    selected=(fixtures[index]||[]).filter(l=>l.isPointLight&&!l.castShadow).map(light=>({light,distance:light.getWorldPosition(worldPosition).distanceToSquared(camera.position)})).sort((a,b)=>a.distance-b.distance).slice(0,3).map(({light})=>({light,position:light.position.clone(),color:light.color.clone(),intensity:light.intensity}));
  }
  return {
    get enabled(){return enabled},
    setEnabled(value){value=Boolean(value);if(value===enabled)return;restore();enabled=value;last=-Infinity;onState(enabled);},
    update(time){
      if(!enabled||time-last<33)return;last=time;
      const index=getLevel();if(index!==level)select(index);
      const t=time/1000;
      // One short shared pulse every 400ms: no additional lights or screen overlay.
      const flash=(time%400)<72;
      for(let i=0;i<selected.length;i++){
        const s=selected[i],angle=t*1.8+i*Math.PI*2/3;
        // Positions stay in the storey's local coordinate frame.
        s.light.position.set(s.position.x+Math.cos(angle)*.45,s.position.y,s.position.z+Math.sin(angle)*.45);
        s.light.color.setHSL((Math.floor(time/400)*.075+i/3)%1,.92,.58);s.light.intensity=flash?32:.2;
      }
    }
  };
}
