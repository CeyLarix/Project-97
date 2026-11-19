// Animate the original static upload; retain all meshes, UVs and materials.
export function createPersonDance(getModel){
 let model=null,base=null,parts=[],amount=0,last=null,lastPose=-Infinity,ringAt=null,escort=null,escorted=false,standingEscort=false;
 function setup(next){model=next;base={position:model.position.clone(),rotation:model.rotation.clone()};parts=[];
  model.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone();o.geometry=geometry;const p=geometry.attributes.position;parts.push({mesh:o,source:p.array.slice(),normals:geometry.attributes.normal?.array.slice(),leg:/^(leg_|front_seam_)/.test(o.name),foot:/^shoe/.test(o.name)});o.frustumCulled=false;});
 }
 function pose(crouch){const angle=crouch*1.22,drop=.77*(1-Math.cos(angle)),lean=crouch*.13;
  for(const {mesh,source,normals,leg,foot}of parts){const p=mesh.geometry.attributes.position;
   if(foot){p.array.set(source);p.needsUpdate=true;if(normals){mesh.geometry.attributes.normal.array.set(normals);mesh.geometry.attributes.normal.needsUpdate=true;}mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();continue;}
   for(let i=0;i<p.count;i++){const k=i*3,x=source[k],y=source[k+1],z=source[k+2];let yy=y,zz=z;
    if(leg){const along=Math.max(0,Math.min(.77,y-.14));yy=y-along*(1-Math.cos(angle));zz=z+Math.sin(angle)*Math.min(along,.77-along);}
    else{const dy=y-.94;yy=.94+Math.cos(lean)*dy-Math.sin(lean)*z-drop;zz=Math.sin(lean)*dy+Math.cos(lean)*z;}
    p.setXYZ(i,x,yy,zz);
   }p.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
   if(crouch===0&&normals){mesh.geometry.attributes.normal.array.set(normals);mesh.geometry.attributes.normal.needsUpdate=true;}else mesh.geometry.computeVertexNormals();
  }
 }
 function walking(phase){for(const {mesh,source,leg,foot}of parts){const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const k=i*3,x=source[k],y=source[k+1],z=source[k+2],angle=Math.sin(phase+(x<0?0:Math.PI))*.25;
   if(leg||foot){const dy=y-.91,dz=z-.02;p.setXYZ(i,x,Math.max(.004,.91+Math.cos(angle)*dy-Math.sin(angle)*dz),.02+Math.sin(angle)*dy+Math.cos(angle)*dz);}else p.setXYZ(i,x,y,z);
  }p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}}
 return {setEscort(value){escort=value;if(!value)standingEscort=false;},cancelRing(){ringAt=null;},ring(time){ringAt=time;},get ringing(){return ringAt!==null;},update(time,playing){
   const next=getModel();if(!next)return;if(next!==model){setup(next);amount=0;last=time;}
   if(escort){escorted=true;model.position.copy(base.position);model.rotation.copy(base.rotation);model.rotation.y=escort.heading;
    if(escort.walking)model.position.y+=Math.abs(Math.sin(escort.phase))*.012;
    if(time-lastPose>=1000/30&&(escort.walking||!standingEscort)){if(escort.walking)walking(escort.phase);else pose(0);standingEscort=!escort.walking;lastPose=time;}amount=0;return;
   }
   if(escorted){pose(0);model.position.copy(base.position);model.rotation.copy(base.rotation);escorted=false;}
   const elapsed=ringAt===null?-1:(time-ringAt)/1000;
   if(elapsed>=8)ringAt=null;
   const ringing=elapsed>=0&&elapsed<8,dt=Math.min(.1,Math.max(0,(time-(last??time))/1000));last=time;
   const active=Boolean(playing)||ringing;amount+=(Number(active)-amount)*Math.min(1,dt*9);
   if(!active&&amount<.001){if(amount!==0){pose(0);model.position.copy(base.position);model.rotation.copy(base.rotation);}amount=0;return;}
   const beat=time/1000*7;
   model.position.copy(base.position);model.position.x+=Math.sin(beat)*.025*amount;
   model.rotation.copy(base.rotation);model.rotation.y+=Math.sin(beat*.5)*.17*amount;model.rotation.z+=Math.sin(beat)*.018*amount;
   // Two deliberate deep squats, then stand up smoothly; shoes remain planted.
   let crouch=playing?.12*(.5+.5*Math.sin(beat)):0;
   if(ringing){const t=elapsed;const pulse=(start,end)=>t<=start||t>=end?0:Math.sin(Math.PI*(t-start)/(end-start))**2;crouch=Math.max(crouch,pulse(.7,3.7),pulse(3.8,7.3));}
   if(time-lastPose>=1000/30){pose(crouch*amount);lastPose=time;}
 }};
}
