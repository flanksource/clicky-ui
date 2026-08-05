import{j as n,r as o,av as L,aW as A}from"./iframe-CE2JtCgn.js";import{F as z,u as K,a as Y,b as Z,d as J,e as W,f as X,g as G,h as Q,i as $,j as ee,k as ne,l as te,o as le,m as se,s as oe}from"./floating-ui.react-ELsBZOw-.js";import{I as ae}from"./Icon-DjK-Ul0P.js";import{c as U}from"./utils-CR52uffu.js";import{b as ie,M as re,a as ce}from"./DropdownMenuSubmenu-BK-eDIsx.js";import{b as ue,u as me}from"./modalStack-BL3nM1Er.js";import"./preload-helper-DOqJbnTS.js";import"./index-CnTEniBU.js";import"./index-srCuUkvt.js";import"./zIndex-CigQ76av.js";function de(e,s,l){return{contextElement:l,getBoundingClientRect:()=>({x:e,y:s,top:s,left:e,right:e,bottom:s,width:0,height:0,toJSON:()=>({})})}}function pe({contextTarget:e,menuLabel:s,menuItems:l,children:c,className:h}){const[i,u]=o.useState(!1),[r,k]=o.useState(null),_=o.useRef(null),j=o.useRef([]),B=ue(),g=K(),v=Y(),m=o.useCallback(()=>{u(!1),queueMicrotask(()=>{var a;return(a=_.current)==null?void 0:a.focus({preventScroll:!0})})},[]),{refs:I,floatingStyles:D,context:x}=Z({...v?{nodeId:v}:{},open:i,onOpenChange:a=>a?u(!0):m(),placement:"right-start",middleware:[le(4),se({padding:8}),oe({padding:8})],whileElementsMounted:te}),T=J(x,{escapeKey:!1}),w=W(x,{role:"menu"}),q=X(x,{listRef:j,activeIndex:r,onNavigate:k,loop:!0}),{getFloatingProps:V,getItemProps:H}=G([T,w,q]),S=o.useCallback((a,b)=>{if(!e||l.length===0)return;const t=document.activeElement;_.current=t instanceof HTMLElement?t:e,I.setPositionReference(de(a,b,e)),k(null),u(!0)},[e,l.length,I]);return o.useEffect(()=>{if(!e||l.length===0)return;e.classList.add("group/cell-actions");const a=t=>{t.preventDefault(),t.stopPropagation(),S(t.clientX,t.clientY)},b=t=>{if(t.key!=="ContextMenu"&&!(t.key==="F10"&&t.shiftKey))return;t.preventDefault(),t.stopPropagation();const N=e.getBoundingClientRect();S(N.left+8,N.top+Math.min(N.height,24))};return e.addEventListener("contextmenu",a),e.addEventListener("keydown",b),()=>{e.classList.remove("group/cell-actions"),e.removeEventListener("contextmenu",a),e.removeEventListener("keydown",b)}},[e,l.length,S]),o.useEffect(()=>{if(g)return g.events.on("click",m),()=>g.events.off("click",m)},[m,g]),me(i,m),n.jsxs(Q,{id:v,children:[n.jsx("span",{className:U("ms-1 inline-flex items-center gap-0.5 align-middle",h),contentEditable:!1,children:c}),i&&n.jsx($,{children:n.jsx(ee,{context:x,modal:!1,returnFocus:!1,children:n.jsx("div",{ref:I.setFloating,role:"menu","aria-label":s,style:{...D,zIndex:B},className:ie,...V(),children:n.jsx(re.Provider,{value:{getItemProps:H,activeIndex:r,setActiveIndex:k,setHasFocusInside:()=>{},isOpen:i},children:n.jsx(ne,{elementsRef:j,children:n.jsx(ce,{items:l})})})})})})]})}function p(e){return n.jsx(z,{children:n.jsx(pe,{...e})})}function f({label:e,icon:s,onSelect:l,className:c,title:h=e,onMouseDown:i,...u}){return n.jsx("button",{...u,type:"button",title:h,"aria-label":e,className:U("inline-flex size-5 items-center justify-center rounded-full p-1 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:opacity-100 focus-visible:outline-none group-hover/cell-actions:opacity-95",c),onMouseDown:r=>{r.preventDefault(),i==null||i(r)},onClick:r=>{r.preventDefault(),r.stopPropagation(),l()},children:n.jsx(ae,{icon:s,className:"text-sm"})})}try{p.displayName="CellActions",p.__docgenInfo={description:"",displayName:"CellActions",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx",methods:[],props:{contextTarget:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"contextTarget",required:!0,tags:{},type:{name:"HTMLElement | null"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"menuLabel",required:!0,tags:{},type:{name:"string"}},menuItems:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"menuItems",required:!0,tags:{},type:{name:"DropdownMenuItem[]"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}try{f.displayName="CellActionButton",f.__docgenInfo={description:"",displayName:"CellActionButton",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx",methods:[],props:{label:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"label",required:!0,tags:{},type:{name:"string"}},icon:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"icon",required:!0,tags:{},type:{name:"StaticIconComponent"}}},tags:{}}}catch{}const{fn:d}=__STORYBOOK_MODULE_TEST__,Ie={title:"Overlay/CellActions",component:p,parameters:{docs:{description:{component:"Muted inline actions paired with an accessible right-click menu on the owning cell."}}}},y={render:()=>{const[e,s]=o.useState(null),l=d(),c=d();return n.jsxs("div",{ref:s,tabIndex:0,className:"inline-flex items-center rounded border border-border px-3 py-2 text-sm",children:["Revenue 120",n.jsxs(p,{contextTarget:e,menuLabel:"Cell actions",menuItems:[{label:"Add comment",icon:L,onSelect:l},{label:"Ask AI",icon:A,onSelect:c}],children:[n.jsx(f,{label:"Ask AI",icon:A,onSelect:c}),n.jsx(f,{label:"Add comment",icon:L,onSelect:l})]})]})}},C={render:()=>{const[e,s]=o.useState(null);return n.jsxs("div",{ref:s,tabIndex:0,className:"inline-flex items-center rounded border border-border px-3 py-2 text-sm",children:["Cash 100",n.jsxs(p,{contextTarget:e,menuLabel:"Cell actions",menuItems:[{label:"Open 2 comments",icon:L,onSelect:d()},{label:"Ask AI",icon:A,onSelect:d()}],children:[n.jsx(f,{label:"Ask AI",icon:A,onSelect:d()}),n.jsxs("button",{type:"button","aria-label":"2 comments",className:"inline-flex h-5 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-[9px] font-medium text-primary/70",children:[n.jsx("span",{className:"size-1.5 rounded-full bg-blue-500"}),"2"]})]})]})}};var E,F,M;y.parameters={...y.parameters,docs:{...(E=y.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => {
    const [cell, setCell] = useState<HTMLDivElement | null>(null);
    const onComment = fn();
    const onAskAI = fn();
    return <div ref={setCell} tabIndex={0} className="inline-flex items-center rounded border border-border px-3 py-2 text-sm">
        Revenue 120
        <CellActions contextTarget={cell} menuLabel="Cell actions" menuItems={[{
        label: "Add comment",
        icon: UiChatDots,
        onSelect: onComment
      }, {
        label: "Ask AI",
        icon: UiSparkles,
        onSelect: onAskAI
      }]}>
          <CellActionButton label="Ask AI" icon={UiSparkles} onSelect={onAskAI} />
          <CellActionButton label="Add comment" icon={UiChatDots} onSelect={onComment} />
        </CellActions>
      </div>;
  }
}`,...(M=(F=y.parameters)==null?void 0:F.docs)==null?void 0:M.source}}};var R,O,P;C.parameters={...C.parameters,docs:{...(R=C.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => {
    const [cell, setCell] = useState<HTMLDivElement | null>(null);
    return <div ref={setCell} tabIndex={0} className="inline-flex items-center rounded border border-border px-3 py-2 text-sm">
        Cash 100
        <CellActions contextTarget={cell} menuLabel="Cell actions" menuItems={[{
        label: "Open 2 comments",
        icon: UiChatDots,
        onSelect: fn()
      }, {
        label: "Ask AI",
        icon: UiSparkles,
        onSelect: fn()
      }]}>
          <CellActionButton label="Ask AI" icon={UiSparkles} onSelect={fn()} />
          <button type="button" aria-label="2 comments" className="inline-flex h-5 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-[9px] font-medium text-primary/70">
            <span className="size-1.5 rounded-full bg-blue-500" />2
          </button>
        </CellActions>
      </div>;
  }
}`,...(P=(O=C.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};const Se=["InlineAndContextMenu","ExistingCommentBadge"];export{C as ExistingCommentBadge,y as InlineAndContextMenu,Se as __namedExportsOrder,Ie as default};
