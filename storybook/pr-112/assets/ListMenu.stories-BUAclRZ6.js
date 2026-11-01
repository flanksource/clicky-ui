import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{a as n,c as r,i,n as a,o,r as s,s as c,t as l}from"./ListMenu-D13Uv8Dt.js";function u(){let e=r({keys:m.map(e=>e.key)});return(0,d.jsxs)(l,{selection:e,className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`,children:[(0,d.jsx)(a,{actions:[{label:`Merge`,onClick:e=>window.alert(`Merge #${e.join(`, #`)}`)},{label:`Close`,variant:`destructive`,onClick:e=>window.alert(`Close #${e.join(`, #`)}`)}]}),(0,d.jsxs)(n,{children:[(0,d.jsxs)(s,{children:[(0,d.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Pull requests`}),(0,d.jsx)(`button`,{type:`button`,className:`ml-auto text-xs text-muted-foreground hover:text-foreground`,onClick:()=>e.allSelected?e.clear():e.selectAll(),children:e.allSelected?`Deselect all`:`Select all`})]}),m.map(e=>(0,d.jsxs)(i,{itemKey:e.key,className:`px-3 py-2`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,d.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[`#`,e.key]}),(0,d.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:e.title})]}),(0,d.jsxs)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:[e.branch,` -> main`]})]},e.key))]})]})}var d,f,p,m,h,g,_;function v(){return(v=e((()=>{o(),c(),d=t(),f={title:`Components/ListMenu`,component:l,tags:[`autodocs`],args:{className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`},argTypes:{children:{control:!1},className:{control:`text`,description:`Classes applied to the outer divided menu container.`,table:{category:`Layout`}}},parameters:{docs:{description:{component:`List/sidebar menu primitives for grouped navigation or master-detail rows: divided groups, muted sticky headers, and left-border row state.`}}}},p={render:e=>(0,d.jsxs)(l,{...e,children:[(0,d.jsxs)(n,{children:[(0,d.jsxs)(s,{className:`z-20`,children:[(0,d.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`flanksource`}),(0,d.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`2`})]}),(0,d.jsxs)(s,{className:`top-9 z-10 pl-6`,children:[(0,d.jsx)(`span`,{className:`text-sm font-medium text-foreground`,children:`gavel`}),(0,d.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`2`})]}),(0,d.jsxs)(i,{className:`px-3 py-2`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,d.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`#42`}),(0,d.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:`Extract PR row layout into a shared ListMenu`})]}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`feature/list-menu -> main`})]}),(0,d.jsxs)(i,{active:!0,className:`px-3 py-2`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,d.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`#41`}),(0,d.jsx)(`span`,{className:`min-w-0 flex-1 truncate text-sm font-medium text-foreground`,children:`Selected row uses the primary left border`})]}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`selected/detail row`})]})]}),(0,d.jsxs)(n,{children:[(0,d.jsxs)(s,{children:[(0,d.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Todos`}),(0,d.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`1`})]}),(0,d.jsx)(i,{selected:!0,className:`flex items-stretch px-3 py-2`,children:(0,d.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Checked row state`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`multi-select rows use a softer state`})]})})]})]})},m=[{key:`42`,title:`Extract PR row layout into a shared ListMenu`,branch:`feature/list-menu`},{key:`41`,title:`Selected row uses the primary left border`,branch:`fix/active-row`},{key:`40`,title:`Add checkbox + Shift+Click selection`,branch:`feat/multi-select`},{key:`39`,title:`Bulk action bar across selected rows`,branch:`feat/action-bar`}],h={parameters:{docs:{description:{story:"Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."}}},render:()=>(0,d.jsx)(u,{})},g={parameters:{docs:{description:{story:"`ListMenuItem` exposes distinct row states for active detail rows, selected multi-select rows, passive rows, and caller-provided accent colors."}}},render:()=>(0,d.jsx)(l,{className:`w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background`,children:(0,d.jsxs)(n,{children:[(0,d.jsxs)(s,{children:[(0,d.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:`Rows`}),(0,d.jsx)(`span`,{className:`ml-auto text-xs tabular-nums text-muted-foreground`,children:`5`})]}),(0,d.jsxs)(i,{className:`px-3 py-2`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Default interactive row`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Transparent left border with muted hover.`})]}),(0,d.jsxs)(i,{active:!0,className:`px-3 py-2`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Active detail row`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Primary border and stronger selected background.`})]}),(0,d.jsxs)(i,{selected:!0,className:`px-3 py-2`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Selected checkbox row`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Softer selected state for multi-select lists.`})]}),(0,d.jsxs)(i,{accentClassName:`border-amber-500`,className:`px-3 py-2`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Caller accent row`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`Domain-specific left border before selection.`})]}),(0,d.jsxs)(i,{interactive:!1,className:`px-3 py-2`,children:[(0,d.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:`Passive row`}),(0,d.jsx)(`div`,{className:`mt-1 text-xs text-muted-foreground`,children:`No pointer cursor or hover treatment.`})]})]})})},_=[`Default`,`MultiSelect`,`RowStates`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:'{\n  parameters: {\n    docs: {\n      description: {\n        story: "Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."\n      }\n    }\n  },\n  render: () => <MultiSelectDemo />\n}',...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}}})))()}v();export{p as Default,h as MultiSelect,g as RowStates,_ as __namedExportsOrder,f as default};