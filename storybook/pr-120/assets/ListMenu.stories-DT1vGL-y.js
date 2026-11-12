import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{a as r,c as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./ListMenu-CxArGA6U.js";import{n as p,t as m}from"./esm-CEDnX218.js";function h(e){let t=(0,v.useContext)(o);return t?(0,y.jsx)(_,{...e,virtual:t}):(0,y.jsx)(g,{...e})}function g({items:e,getItemKey:t,children:n}){return e.map((e,r)=>(0,y.jsx)(v.Fragment,{children:n(e,r)},t(e)))}function _({items:e,getItemKey:t,children:n,virtual:r}){let[i,a]=(0,v.useState)(null),[o,s]=(0,v.useState)(null),{scrollElement:c,contentElement:l,estimateRowHeight:u,overscan:d}=r,f=o?.count===e.length&&o.estimate===u?o.margin:null;(0,v.useLayoutEffect)(()=>{if(!i||!c||!l)return;let t=()=>{let t=i.getBoundingClientRect().top-c.getBoundingClientRect().top+c.scrollTop-c.clientTop;s(n=>n?.count===e.length&&n.estimate===u&&n.margin===t?n:{count:e.length,estimate:u,margin:t})};if(t(),typeof ResizeObserver>`u`)return;let n=new ResizeObserver(t);return n.observe(l),n.observe(c),()=>n.disconnect()},[i,c,l,e.length,u]);let m=p({count:e.length,getScrollElement:()=>c,estimateSize:()=>u,getItemKey:n=>{let r=e[n];if(r===void 0)throw Error(`ListMenu item ${n} is outside its collection`);return t(r)},overscan:d,scrollMargin:f??0,enabled:f!==null}),h=m.scrollOffset??0,g=m.scrollRect?.height??0,_=m.getVirtualItems().filter(e=>e.end>=h-d*u&&e.start<=h+g+d*u);return(0,y.jsx)(`div`,{ref:a,"data-slot":`list-menu-items`,className:`relative w-full`,style:{height:f===null?e.length*u:m.getTotalSize()},children:_.map(t=>{let r=e[t.index];if(r===void 0)throw Error(`ListMenu item ${t.index} is outside its collection`);return(0,y.jsx)(`div`,{ref:m.measureElement,"data-index":t.index,className:`absolute left-0 top-0 w-full`,style:{transform:`translateY(${t.start-(f??0)}px)`},children:n(r,t.index)},t.key)})})}var v,y;function b(){return(b=e((()=>{v=t(),m(),f(),y=n();try{h.displayName=`ListMenuItems`,h.__docgenInfo={description:``,displayName:`ListMenuItems`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/ListMenuItems.tsx`,methods:[],props:{items:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/components/ListMenuItems.tsx`,name:`ListMenuItemsProps`}],description:``,name:`items`,parent:{fileName:`clicky-ui/packages/ui/src/components/ListMenuItems.tsx`,name:`ListMenuItemsProps`},required:!0,tags:{},type:{name:`readonly T[]`}},getItemKey:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/components/ListMenuItems.tsx`,name:`ListMenuItemsProps`}],description:``,name:`getItemKey`,parent:{fileName:`clicky-ui/packages/ui/src/components/ListMenuItems.tsx`,name:`ListMenuItemsProps`},required:!0,tags:{},type:{name:`(item: T) => string`}}},tags:{}}}catch{}})))()}function x(){let e=i({keys:D.map(e=>e.key)});return(0,w.jsxs)(d,{selection:e,className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`,children:[(0,w.jsx)(s,{actions:[{label:`Merge`,onClick:e=>window.alert(`Merge #${e.join(`, #`)}`)},{label:`Close`,variant:`destructive`,onClick:e=>window.alert(`Close #${e.join(`, #`)}`)}]}),(0,w.jsxs)(r,{children:[(0,w.jsxs)(l,{children:[(0,w.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Pull requests`}),(0,w.jsx)(`button`,{type:`button`,className:`ml-auto text-xs text-muted-foreground hover:text-foreground`,onClick:()=>e.allSelected?e.clear():e.selectAll(),children:e.allSelected?`Deselect all`:`Select all`})]}),D.map(e=>(0,w.jsxs)(a,{itemKey:e.key,className:`px-3 py-2`,children:[(0,w.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,w.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[`#`,e.key]}),(0,w.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:e.title})]}),(0,w.jsxs)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:[e.branch,` -> main`]})]},e.key))]})]})}function S(){let[e,t]=(0,C.useState)(new Set);return(0,w.jsx)(`div`,{className:`h-96 w-[min(100%,28rem)] border border-border`,children:(0,w.jsx)(d,{virtualize:{estimateRowHeight:40},children:A.map(n=>(0,w.jsxs)(r,{children:[(0,w.jsx)(l,{children:(0,w.jsxs)(`button`,{type:`button`,"aria-expanded":!e.has(n.name),onClick:()=>t(e=>{let t=new Set(e);return t.delete(n.name)||t.add(n.name),t}),children:[n.name,` (`,n.items.length,`)`]})}),!e.has(n.name)&&(0,w.jsx)(h,{items:n.items,getItemKey:e=>e.id,children:e=>(0,w.jsx)(a,{className:`px-3 py-2`,children:e.title})})]},n.name))})})}var C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{C=t(),b(),c(),u(),w=n(),T={title:`Components/ListMenu`,component:d,tags:[`autodocs`],args:{className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`},argTypes:{children:{control:!1},className:{control:`text`,description:`Classes applied to the outer divided menu container.`,table:{category:`Layout`}}},parameters:{docs:{description:{component:`List/sidebar menu primitives for grouped navigation or master-detail rows: divided groups, muted sticky headers, and left-border row state.`}}}},E={render:e=>(0,w.jsxs)(d,{...e,children:[(0,w.jsxs)(r,{children:[(0,w.jsxs)(l,{className:`z-20`,children:[(0,w.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`flanksource`}),(0,w.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`2`})]}),(0,w.jsxs)(l,{className:`top-9 z-10 pl-6`,children:[(0,w.jsx)(`span`,{className:`text-sm font-medium text-foreground`,children:`gavel`}),(0,w.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`2`})]}),(0,w.jsxs)(a,{className:`px-3 py-2`,children:[(0,w.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,w.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`#42`}),(0,w.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:`Extract PR row layout into a shared ListMenu`})]}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`feature/list-menu -> main`})]}),(0,w.jsxs)(a,{active:!0,className:`px-3 py-2`,children:[(0,w.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,w.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`#41`}),(0,w.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:`Selected row uses the primary left border`})]}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`selected/detail row`})]})]}),(0,w.jsxs)(r,{children:[(0,w.jsxs)(l,{children:[(0,w.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Todos`}),(0,w.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`1`})]}),(0,w.jsx)(a,{selected:!0,className:`flex items-stretch px-3 py-2`,children:(0,w.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Checked row state`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`multi-select rows use a softer state`})]})})]})]})},D=[{key:`42`,title:`Extract PR row layout into a shared ListMenu`,branch:`feature/list-menu`},{key:`41`,title:`Selected row uses the primary left border`,branch:`fix/active-row`},{key:`40`,title:`Add checkbox + Shift+Click selection`,branch:`feat/multi-select`},{key:`39`,title:`Bulk action bar across selected rows`,branch:`feat/action-bar`}],O={parameters:{docs:{description:{story:"Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."}}},render:()=>(0,w.jsx)(x,{})},k={parameters:{docs:{description:{story:"`ListMenuItem` exposes distinct row states for active detail rows, selected multi-select rows, passive rows, and caller-provided accent colors."}}},render:()=>(0,w.jsx)(d,{className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`,children:(0,w.jsxs)(r,{children:[(0,w.jsxs)(l,{children:[(0,w.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Rows`}),(0,w.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`5`})]}),(0,w.jsxs)(a,{className:`px-3 py-2`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Default interactive row`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Transparent left border with muted hover.`})]}),(0,w.jsxs)(a,{active:!0,className:`px-3 py-2`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Active detail row`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Primary border and stronger selected background.`})]}),(0,w.jsxs)(a,{selected:!0,className:`px-3 py-2`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Selected checkbox row`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Softer selected state for multi-select lists.`})]}),(0,w.jsxs)(a,{accentClassName:`border-amber-500`,className:`px-3 py-2`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Caller accent row`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Domain-specific left border before selection.`})]}),(0,w.jsxs)(a,{interactive:!1,className:`px-3 py-2`,children:[(0,w.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Passive row`}),(0,w.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`No pointer cursor or hover treatment.`})]})]})})},A=[`Backlog`,`Review`,`Completed`].map(e=>({name:e,items:Array.from({length:300},(t,n)=>({id:`${e}-${n}`,title:`${e} item ${n+1}`}))})),j={parameters:{docs:{description:{story:`Give ListMenu a bounded height and enable virtualize, then render each group's rows through ListMenuItems with stable getItemKey values. Groups share one scroll viewport, retain sticky headers, and measure variable row heights. Filtering, counts and selection still operate on the complete items collection. estimateRowHeight starts the layout estimate; overscan controls the extra mounted rows around the viewport.`}}},render:()=>(0,w.jsx)(S,{})},M=[`Default`,`MultiSelect`,`RowStates`,`Virtualized`],E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <ListMenu {...args}>
      <ListMenuSection>
        <ListMenuHeader className="z-20">
          <span className="text-sm font-semibold text-foreground">flanksource</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">2</span>
        </ListMenuHeader>
        <ListMenuHeader className="top-9 z-10 pl-6">
          <span className="text-sm font-medium text-foreground">gavel</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">2</span>
        </ListMenuHeader>
        <ListMenuItem className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#42</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              Extract PR row layout into a shared ListMenu
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">feature/list-menu -&gt; main</div>
        </ListMenuItem>
        <ListMenuItem active className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#41</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              Selected row uses the primary left border
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">selected/detail row</div>
        </ListMenuItem>
      </ListMenuSection>
      <ListMenuSection>
        <ListMenuHeader>
          <span className="text-sm font-semibold text-foreground">Todos</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">1</span>
        </ListMenuHeader>
        <ListMenuItem selected className="flex items-stretch px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">Checked row state</div>
            <div className="mt-1 text-xs text-muted-foreground">multi-select rows use a softer state</div>
          </div>
        </ListMenuItem>
      </ListMenuSection>
    </ListMenu>
}`,...E.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:'{\n  parameters: {\n    docs: {\n      description: {\n        story: "Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."\n      }\n    }\n  },\n  render: () => <MultiSelectDemo />\n}',...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "\`ListMenuItem\` exposes distinct row states for active detail rows, selected multi-select rows, passive rows, and caller-provided accent colors."
      }
    }
  },
  render: () => <ListMenu className="w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background">
      <ListMenuSection>
        <ListMenuHeader>
          <span className="text-sm font-semibold text-foreground">Rows</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">5</span>
        </ListMenuHeader>
        <ListMenuItem className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Default interactive row</div>
          <div className="mt-1 text-xs text-muted-foreground">Transparent left border with muted hover.</div>
        </ListMenuItem>
        <ListMenuItem active className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Active detail row</div>
          <div className="mt-1 text-xs text-muted-foreground">Primary border and stronger selected background.</div>
        </ListMenuItem>
        <ListMenuItem selected className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Selected checkbox row</div>
          <div className="mt-1 text-xs text-muted-foreground">Softer selected state for multi-select lists.</div>
        </ListMenuItem>
        <ListMenuItem accentClassName="border-amber-500" className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Caller accent row</div>
          <div className="mt-1 text-xs text-muted-foreground">Domain-specific left border before selection.</div>
        </ListMenuItem>
        <ListMenuItem interactive={false} className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Passive row</div>
          <div className="mt-1 text-xs text-muted-foreground">No pointer cursor or hover treatment.</div>
        </ListMenuItem>
      </ListMenuSection>
    </ListMenu>
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Give ListMenu a bounded height and enable virtualize, then render each group's rows through ListMenuItems with stable getItemKey values. Groups share one scroll viewport, retain sticky headers, and measure variable row heights. Filtering, counts and selection still operate on the complete items collection. estimateRowHeight starts the layout estimate; overscan controls the extra mounted rows around the viewport."
      }
    }
  },
  render: () => <VirtualizedDemo />
}`,...j.parameters?.docs?.source}}}})))()}N();export{E as Default,O as MultiSelect,k as RowStates,j as Virtualized,M as __namedExportsOrder,T as default};