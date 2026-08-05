import{j as e}from"./iframe-DBr7zNeS.js";import{L as c,a as i,b as n,c as s,u as b,d as j}from"./ListMenu-CbedGfgc.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./button--5fQhbPU.js";import"./index-0zBpNI7D.js";import"./loading-BPm7-hB-.js";const P={title:"Components/ListMenu",component:c,tags:["autodocs"],args:{className:"w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background"},argTypes:{children:{control:!1},className:{control:"text",description:"Classes applied to the outer divided menu container.",table:{category:"Layout"}}},parameters:{docs:{description:{component:"List/sidebar menu primitives for grouped navigation or master-detail rows: divided groups, muted sticky headers, and left-border row state."}}}},a={render:r=>e.jsxs(c,{...r,children:[e.jsxs(i,{children:[e.jsxs(n,{className:"z-20",children:[e.jsx("span",{className:"text-sm font-semibold text-foreground",children:"flanksource"}),e.jsx("span",{className:"ml-auto text-xs tabular-nums text-muted-foreground",children:"2"})]}),e.jsxs(n,{className:"top-9 z-10 pl-6",children:[e.jsx("span",{className:"text-sm font-medium text-foreground",children:"gavel"}),e.jsx("span",{className:"ml-auto text-xs tabular-nums text-muted-foreground",children:"2"})]}),e.jsxs(s,{className:"px-3 py-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"#42"}),e.jsx("span",{className:"min-w-0 flex-1 truncate text-sm font-medium text-foreground",children:"Extract PR row layout into a shared ListMenu"})]}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"feature/list-menu -> main"})]}),e.jsxs(s,{active:!0,className:"px-3 py-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"#41"}),e.jsx("span",{className:"min-w-0 flex-1 truncate text-sm font-medium text-foreground",children:"Selected row uses the primary left border"})]}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"selected/detail row"})]})]}),e.jsxs(i,{children:[e.jsxs(n,{children:[e.jsx("span",{className:"text-sm font-semibold text-foreground",children:"Todos"}),e.jsx("span",{className:"ml-auto text-xs tabular-nums text-muted-foreground",children:"1"})]}),e.jsx(s,{selected:!0,className:"flex items-stretch px-3 py-2",children:e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Checked row state"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"multi-select rows use a softer state"})]})})]})]})},m=[{key:"42",title:"Extract PR row layout into a shared ListMenu",branch:"feature/list-menu"},{key:"41",title:"Selected row uses the primary left border",branch:"fix/active-row"},{key:"40",title:"Add checkbox + Shift+Click selection",branch:"feat/multi-select"},{key:"39",title:"Bulk action bar across selected rows",branch:"feat/action-bar"}];function M(){const r=b({keys:m.map(t=>t.key)});return e.jsxs(c,{selection:r,className:"w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background",children:[e.jsx(j,{actions:[{label:"Merge",onClick:t=>window.alert(`Merge #${t.join(", #")}`)},{label:"Close",variant:"destructive",onClick:t=>window.alert(`Close #${t.join(", #")}`)}]}),e.jsxs(i,{children:[e.jsxs(n,{children:[e.jsx("span",{className:"text-sm font-semibold text-foreground",children:"Pull requests"}),e.jsx("button",{type:"button",className:"ml-auto text-xs text-muted-foreground hover:text-foreground",onClick:()=>r.allSelected?r.clear():r.selectAll(),children:r.allSelected?"Deselect all":"Select all"})]}),m.map(t=>e.jsxs(s,{itemKey:t.key,className:"px-3 py-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"text-xs text-muted-foreground",children:["#",t.key]}),e.jsx("span",{className:"min-w-0 flex-1 truncate text-sm font-medium text-foreground",children:t.title})]}),e.jsxs("div",{className:"mt-1 text-xs text-muted-foreground",children:[t.branch," -> main"]})]},t.key))]})]})}const o={parameters:{docs:{description:{story:"Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."}}},render:()=>e.jsx(M,{})},d={parameters:{docs:{description:{story:"`ListMenuItem` exposes distinct row states for active detail rows, selected multi-select rows, passive rows, and caller-provided accent colors."}}},render:()=>e.jsx(c,{className:"w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background",children:e.jsxs(i,{children:[e.jsxs(n,{children:[e.jsx("span",{className:"text-sm font-semibold text-foreground",children:"Rows"}),e.jsx("span",{className:"ml-auto text-xs tabular-nums text-muted-foreground",children:"5"})]}),e.jsxs(s,{className:"px-3 py-2",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Default interactive row"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"Transparent left border with muted hover."})]}),e.jsxs(s,{active:!0,className:"px-3 py-2",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Active detail row"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"Primary border and stronger selected background."})]}),e.jsxs(s,{selected:!0,className:"px-3 py-2",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Selected checkbox row"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"Softer selected state for multi-select lists."})]}),e.jsxs(s,{accentClassName:"border-amber-500",className:"px-3 py-2",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Caller accent row"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"Domain-specific left border before selection."})]}),e.jsxs(s,{interactive:!1,className:"px-3 py-2",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:"Passive row"}),e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:"No pointer cursor or hover treatment."})]})]})})};var l,u,x;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(x=(u=a.parameters)==null?void 0:u.docs)==null?void 0:x.source}}};var f,p,h;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:'{\n  parameters: {\n    docs: {\n      description: {\n        story: "Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key."\n      }\n    }\n  },\n  render: () => <MultiSelectDemo />\n}',...(h=(p=o.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};var g,N,v;d.parameters={...d.parameters,docs:{...(g=d.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(v=(N=d.parameters)==null?void 0:N.docs)==null?void 0:v.source}}};const D=["Default","MultiSelect","RowStates"];export{a as Default,o as MultiSelect,d as RowStates,D as __namedExportsOrder,P as default};
