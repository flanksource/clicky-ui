import{r as b,j as e,az as x,a_ as u}from"./iframe-CiA63uuc.js";import{I as v}from"./Icon-ChAy_Zq6.js";import{c as h}from"./utils-DW-IJACk.js";import{C as S}from"./ContextMenu-B2c0IJLi.js";import"./preload-helper-DqldIB3Q.js";import"./floating-ui.react-BzcB7PEn.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./DropdownMenuSubmenu-DGyluL-z.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";function r({contextTarget:n,menuLabel:t,menuItems:l,children:a,className:d}){return b.useEffect(()=>{if(n)return n.classList.add("group/cell-actions"),()=>n.classList.remove("group/cell-actions")},[n]),e.jsxs(e.Fragment,{children:[e.jsx("span",{className:h("ms-1 inline-flex items-center gap-0.5 align-middle",d),contentEditable:!1,children:a}),e.jsx(S,{contextTarget:n,menuLabel:t,menuItems:l})]})}function o({label:n,icon:t,onSelect:l,className:a,title:d=n,onMouseDown:p,...I}){return e.jsx("button",{...I,type:"button",title:d,"aria-label":n,className:h("inline-flex size-5 items-center justify-center rounded-full p-1 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:opacity-100 focus-visible:outline-none group-hover/cell-actions:opacity-95",a),onMouseDown:s=>{s.preventDefault(),p==null||p(s)},onClick:s=>{s.preventDefault(),s.stopPropagation(),l()},children:e.jsx(v,{icon:t,className:"text-sm"})})}try{r.displayName="CellActions",r.__docgenInfo={description:"",displayName:"CellActions",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx",methods:[],props:{contextTarget:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"contextTarget",required:!0,tags:{},type:{name:"HTMLElement | null"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"menuLabel",required:!0,tags:{},type:{name:"string"}},menuItems:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"menuItems",required:!0,tags:{},type:{name:"DropdownMenuItem[]"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}try{o.displayName="CellActionButton",o.__docgenInfo={description:"",displayName:"CellActionButton",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx",methods:[],props:{label:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"label",required:!0,tags:{},type:{name:"string"}},icon:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/overlay/CellActions.tsx",name:"TypeLiteral"}],description:"",name:"icon",required:!0,tags:{},type:{name:"StaticIconComponent"}}},tags:{}}}catch{}const{fn:i}=__STORYBOOK_MODULE_TEST__,M={title:"Overlay/CellActions",component:r,parameters:{docs:{description:{component:"Muted inline actions paired with an accessible right-click menu on the owning cell."}}}},c={render:()=>{const[n,t]=b.useState(null),l=i(),a=i();return e.jsxs("div",{ref:t,tabIndex:0,className:"inline-flex items-center rounded border border-border px-3 py-2 text-sm",children:["Revenue 120",e.jsxs(r,{contextTarget:n,menuLabel:"Cell actions",menuItems:[{label:"Add comment",icon:x,onSelect:l},{label:"Ask AI",icon:u,onSelect:a}],children:[e.jsx(o,{label:"Ask AI",icon:u,onSelect:a}),e.jsx(o,{label:"Add comment",icon:x,onSelect:l})]})]})}},m={render:()=>{const[n,t]=b.useState(null);return e.jsxs("div",{ref:t,tabIndex:0,className:"inline-flex items-center rounded border border-border px-3 py-2 text-sm",children:["Cash 100",e.jsxs(r,{contextTarget:n,menuLabel:"Cell actions",menuItems:[{label:"Open 2 comments",icon:x,onSelect:i()},{label:"Ask AI",icon:u,onSelect:i()}],children:[e.jsx(o,{label:"Ask AI",icon:u,onSelect:i()}),e.jsxs("button",{type:"button","aria-label":"2 comments",className:"inline-flex h-5 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-[9px] font-medium text-primary/70",children:[e.jsx("span",{className:"size-1.5 rounded-full bg-blue-500"}),"2"]})]})]})}};var f,y,A;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(A=(y=c.parameters)==null?void 0:y.docs)==null?void 0:A.source}}};var C,g,k;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(k=(g=m.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};const V=["InlineAndContextMenu","ExistingCommentBadge"];export{m as ExistingCommentBadge,c as InlineAndContextMenu,V as __namedExportsOrder,M as default};
