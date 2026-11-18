import {detectPlatform} from './platform-controls.js';
export function setupDesktopMenu({doc=document,view,onOpen=()=>{},nav=navigator}){
 const body=doc.body,isIPhone=detectPlatform(nav).isIPhone;if(!isIPhone&&!body.classList.contains('ipad-device')&&!body.classList.contains('windows-device'))return null;
 if(isIPhone)body.classList.add('iphone-compact');
 body.classList.add('desktop-ui');
 const make=(tag,className,text)=>{const e=doc.createElement(tag);e.className=className;if(text)e.textContent=text;return e;};
 const bar=make('div','desktop-toolbar');bar.setAttribute('aria-label','Woningbediening');
 const roomsButton=make('button','desktop-menu-button','☰ Ruimtes'),settingsButton=make('button','desktop-menu-button','Instellingen');
 roomsButton.type=settingsButton.type='button';
 const rooms=make('section','desktop-drawer desktop-rooms'),settings=make('section','desktop-drawer desktop-settings');
 rooms.id='desktop-rooms';settings.id='desktop-settings';rooms.setAttribute('aria-label','Verdiepingen en kamers');settings.setAttribute('aria-label','Instellingen');
 roomsButton.setAttribute('aria-controls',rooms.id);settingsButton.setAttribute('aria-controls',settings.id);
 function close(){rooms.hidden=settings.hidden=true;roomsButton.setAttribute('aria-expanded','false');settingsButton.setAttribute('aria-expanded','false');}
 function toggle(panel,button){const open=panel.hidden;close();if(open){onOpen();view.classList.remove('styles-open');doc.querySelector('#style-panel')?.classList.remove('open');doc.querySelector('#style-toggle')?.setAttribute('aria-expanded','false');panel.hidden=false;button.setAttribute('aria-expanded','true');}}
 roomsButton.onclick=()=>toggle(rooms,roomsButton);settingsButton.onclick=()=>toggle(settings,settingsButton);
 const measure=doc.querySelector('#measure-toggle');
 bar.append(roomsButton,doc.querySelector('.view-heading'),measure,settingsButton);
 measure.addEventListener('click',close);
 if(isIPhone){roomsButton.textContent='☰';settingsButton.textContent='⚙';roomsButton.setAttribute('aria-label','Ruimtes en verdiepingen');settingsButton.setAttribute('aria-label','Instellingen');}
 const zoom=make('div','desktop-zoom');zoom.setAttribute('aria-label','Zoomen');for(const id of ['exterior-closer','exterior-farther','zoom-reset'])zoom.append(doc.getElementById(id));
 rooms.append(make('h2','desktop-drawer-title','Waar wil je kijken?'),doc.querySelector('.navigation-card'),doc.querySelector('#rooms'),doc.querySelector('#mini-wrap'));
 settings.append(make('h2','desktop-drawer-title','Jouw weergave'),doc.querySelector('.view-tools'),doc.querySelector('.experience-controls'),doc.querySelector('.style-dock'),doc.querySelector('.scene-links'));
 view.append(bar,zoom,rooms,settings);close();
 rooms.addEventListener('click',e=>{if(e.target.closest('#rooms button'))close();});
 settings.addEventListener('click',e=>{if(e.target.closest('#style-toggle,#materials,#source,#gallery'))close();});
 view.addEventListener('pointerdown',e=>{if(!e.target.closest('.desktop-toolbar,.desktop-drawer,.style-panel,.tarkan-panel,.tv-surface-player'))close();});
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'){close();view.classList.remove('styles-open');doc.querySelector('#style-panel')?.classList.remove('open');doc.querySelector('#style-toggle')?.setAttribute('aria-expanded','false');}});
 return {close};
}
