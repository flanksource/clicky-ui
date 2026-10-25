import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./AccordionList-CVjIgIRR.js";function a(e){let{addable:t=!0,initial:n=f,...r}=e,[a,c]=(0,o.useState)(n);return(0,s.jsx)(`div`,{className:`max-w-2xl`,children:(0,s.jsx)(i,{items:a,onChange:c,summary:a.length===1?`1 route`:`${a.length} routes`,itemLabel:({item:e})=>e.path,addLabel:`Add route`,addDescription:`A route forwards one path to one upstream service.`,...t?{onCreate:()=>({path:``,method:`GET`,upstream:``})}:{},...r,renderHeader:({item:e,index:t})=>(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`span`,{className:`shrink-0 text-sm font-medium`,children:e.path||`Route ${t+1}`}),(0,s.jsxs)(`code`,{className:`truncate font-mono text-xs text-muted-foreground`,children:[e.method,` · `,e.upstream]})]}),renderBody:({item:e,onChange:t})=>(0,s.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,s.jsxs)(`label`,{className:`flex items-center gap-2 text-sm`,children:[(0,s.jsx)(`span`,{className:`w-20 text-muted-foreground`,children:`Path`}),(0,s.jsx)(`input`,{className:`h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm`,value:e.path,onChange:n=>t({...e,path:n.target.value})})]}),(0,s.jsxs)(`label`,{className:`flex items-center gap-2 text-sm`,children:[(0,s.jsx)(`span`,{className:`w-20 text-muted-foreground`,children:`Upstream`}),(0,s.jsx)(`input`,{className:`h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm`,value:e.upstream,onChange:n=>t({...e,upstream:n.target.value})})]})]})})})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Components/AccordionList`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"A list of items collapsed to one row each, expanding one at a time into that item's own editor. `renderHeader` and `renderBody` are the only content the consumer supplies; the disclosure, aria pairing, arrow-key roving focus, action buttons and add row belong to the list. Every editing capability is opt-in (`allowReorder`, `allowDuplicate`, `allowRemove`, `onCreate`), so the same component serves a read-only summary list and a full editor."}}}},f=[{path:`/api/v1/users`,method:`GET`,upstream:`users-svc:8080`},{path:`/api/v1/events`,method:`POST`,upstream:`events-svc:8080`}],p={render:()=>(0,s.jsx)(a,{addable:!1})},m={render:()=>(0,s.jsx)(a,{allowReorder:!0,allowDuplicate:!0,allowRemove:!0})},h={render:()=>(0,s.jsx)(a,{allowReorder:!0,addable:!1})},g={render:()=>(0,s.jsx)(a,{readOnly:!0,allowReorder:!0,allowRemove:!0})},_={render:()=>(0,s.jsx)(a,{initial:[]})},v={render:()=>(0,s.jsx)(a,{addable:!1,toolbar:(0,s.jsx)(`button`,{type:`button`,className:`rounded px-2 text-xs text-muted-foreground hover:bg-accent`,children:`Export`})})},y={render:()=>(0,s.jsx)(a,{allowRemove:!0}),play:async({canvasElement:e,step:t})=>{let n=u(e),r=()=>n.getAllByRole(`button`,{expanded:!1});await t(`starts with the two seeded routes`,async()=>{await c(n.getAllByRole(`button`,{name:/^Remove/})).toHaveLength(2)}),await t(`the add row appends a route and opens it`,async()=>{await l.click(n.getByRole(`button`,{name:/Add route/})),await c(n.getByRole(`button`,{expanded:!0})).toBeInTheDocument(),await c(n.getAllByRole(`button`,{name:/^Remove/})).toHaveLength(3)}),await t(`removing takes the named route out`,async()=>{await l.click(n.getByRole(`button`,{name:`Remove /api/v1/users`})),await c(n.getAllByRole(`button`,{name:/^Remove/})).toHaveLength(2)}),await t(`only one row opens at a time`,async()=>{await l.click(r()[0]),await c(n.getAllByRole(`button`,{expanded:!0})).toHaveLength(1)})}},b=[`Default`,`WithActions`,`ReorderOnly`,`ReadOnly`,`Empty`,`WithToolbar`,`AddsAndRemoves`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList addable={false} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder allowDuplicate allowRemove />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder addable={false} />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList readOnly allowReorder allowRemove />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList initial={[]} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList addable={false} toolbar={<button type="button" className="rounded px-2 text-xs text-muted-foreground hover:bg-accent">
          Export
        </button>} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <RouteList allowRemove />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const rows = () => canvas.getAllByRole("button", {
      expanded: false
    });
    await step("starts with the two seeded routes", async () => {
      await expect(canvas.getAllByRole("button", {
        name: /^Remove/
      })).toHaveLength(2);
    });
    await step("the add row appends a route and opens it", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /Add route/
      }));
      await expect(canvas.getByRole("button", {
        expanded: true
      })).toBeInTheDocument();
      await expect(canvas.getAllByRole("button", {
        name: /^Remove/
      })).toHaveLength(3);
    });
    await step("removing takes the named route out", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Remove /api/v1/users"
      }));
      await expect(canvas.getAllByRole("button", {
        name: /^Remove/
      })).toHaveLength(2);
    });
    await step("only one row opens at a time", async () => {
      await userEvent.click(rows()[0]!);
      await expect(canvas.getAllByRole("button", {
        expanded: true
      })).toHaveLength(1);
    });
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{y as AddsAndRemoves,p as Default,_ as Empty,g as ReadOnly,h as ReorderOnly,m as WithActions,v as WithToolbar,b as __namedExportsOrder,d as default};