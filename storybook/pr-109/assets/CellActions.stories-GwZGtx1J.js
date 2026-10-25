import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Gn as r,n as i,oi as a}from"./icons-N6BqLuiz.js";import{n as o,t as s}from"./utils-CEDXhWC6.js";import{r as c,t as l}from"./Icon-IwKVFFs1.js";import{n as u,t as d}from"./ContextMenu-BNROaYkn.js";function f({contextTarget:e,menuLabel:t,menuItems:n,children:r,className:i}){return(0,m.useEffect)(()=>{if(e)return e.classList.add(`group/cell-actions`),()=>e.classList.remove(`group/cell-actions`)},[e]),(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`span`,{className:s(`ms-1 inline-flex items-center gap-0.5 align-middle`,i),contentEditable:!1,children:r}),(0,h.jsx)(d,{contextTarget:e,menuLabel:t,menuItems:n})]})}function p({label:e,icon:t,onSelect:n,className:r,title:i=e,onMouseDown:a,...o}){return(0,h.jsx)(`button`,{...o,type:`button`,title:i,"aria-label":e,className:s(`inline-flex size-5 items-center justify-center rounded-full p-1 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:opacity-100 focus-visible:outline-none group-hover/cell-actions:opacity-95`,r),onMouseDown:e=>{e.preventDefault(),a?.(e)},onClick:e=>{e.preventDefault(),e.stopPropagation(),n()},children:(0,h.jsx)(l,{icon:t,className:`text-sm`})})}var m,h;function g(){return(g=e((()=>{m=t(),c(),o(),u(),h=n();try{f.displayName=`CellActions`,f.__docgenInfo={description:``,displayName:`CellActions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx`,methods:[],props:{contextTarget:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`contextTarget`,required:!0,tags:{},type:{name:`HTMLElement | null`}},menuLabel:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`menuLabel`,required:!0,tags:{},type:{name:`string`}},menuItems:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`menuItems`,required:!0,tags:{},type:{name:`DropdownMenuItem[]`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}try{p.displayName=`CellActionButton`,p.__docgenInfo={description:``,displayName:`CellActionButton`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/CellActions.tsx`,methods:[],props:{label:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`label`,required:!0,tags:{},type:{name:`string`}},icon:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/CellActions.tsx`,name:`TypeLiteral`}],description:``,name:`icon`,required:!0,tags:{},type:{name:`StaticIconComponent`}}},tags:{}}}catch{}})))()}var _,v,y,b,x,S,C;function w(){return(w=e((()=>{_=t(),i(),g(),v=n(),{fn:y}=__STORYBOOK_MODULE_TEST__,b={title:`Overlay/CellActions`,component:f,parameters:{docs:{description:{component:`Muted inline actions paired with an accessible right-click menu on the owning cell.`}}}},x={render:()=>{let[e,t]=(0,_.useState)(null),n=y(),i=y();return(0,v.jsxs)(`div`,{ref:t,tabIndex:0,className:`inline-flex items-center rounded border border-border px-3 py-2 text-sm`,children:[`Revenue 120`,(0,v.jsxs)(f,{contextTarget:e,menuLabel:`Cell actions`,menuItems:[{label:`Add comment`,icon:r,onSelect:n},{label:`Ask AI`,icon:a,onSelect:i}],children:[(0,v.jsx)(p,{label:`Ask AI`,icon:a,onSelect:i}),(0,v.jsx)(p,{label:`Add comment`,icon:r,onSelect:n})]})]})}},S={render:()=>{let[e,t]=(0,_.useState)(null);return(0,v.jsxs)(`div`,{ref:t,tabIndex:0,className:`inline-flex items-center rounded border border-border px-3 py-2 text-sm`,children:[`Cash 100`,(0,v.jsxs)(f,{contextTarget:e,menuLabel:`Cell actions`,menuItems:[{label:`Open 2 comments`,icon:r,onSelect:y()},{label:`Ask AI`,icon:a,onSelect:y()}],children:[(0,v.jsx)(p,{label:`Ask AI`,icon:a,onSelect:y()}),(0,v.jsxs)(`button`,{type:`button`,"aria-label":`2 comments`,className:`inline-flex h-5 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-[9px] font-medium text-primary/70`,children:[(0,v.jsx)(`span`,{className:`size-1.5 rounded-full bg-blue-500`}),`2`]})]})]})}},C=[`InlineAndContextMenu`,`ExistingCommentBadge`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}}})))()}w();export{S as ExistingCommentBadge,x as InlineAndContextMenu,C as __namedExportsOrder,b as default};