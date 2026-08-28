import{j as e,r as G}from"./iframe-CmyXO54k.js";import{A as C}from"./AccordionList-Cw8Pv10O.js";import"./preload-helper-CrzHa85r.js";import"./utils-DW-IJACk.js";import"./Icon-Cn5Qjct9.js";import"./json-schema-form-size-E77C3uZS.js";const{expect:r,userEvent:x,within:I}=__STORYBOOK_MODULE_TEST__,q={title:"Components/AccordionList",component:C,tags:["autodocs"],parameters:{docs:{description:{component:"A list of items collapsed to one row each, expanding one at a time into that item's own editor. `renderHeader` and `renderBody` are the only content the consumer supplies; the disclosure, aria pairing, arrow-key roving focus, action buttons and add row belong to the list. Every editing capability is opt-in (`allowReorder`, `allowDuplicate`, `allowRemove`, `onCreate`), so the same component serves a read-only summary list and a full editor."}}}},P=[{path:"/api/v1/users",method:"GET",upstream:"users-svc:8080"},{path:"/api/v1/events",method:"POST",upstream:"events-svc:8080"}];function n(p){const{addable:o=!0,initial:t=P,...w}=p,[v,U]=G.useState(t);return e.jsx("div",{className:"max-w-2xl",children:e.jsx(C,{items:v,onChange:U,summary:v.length===1?"1 route":`${v.length} routes`,itemLabel:({item:a})=>a.path,addLabel:"Add route",addDescription:"A route forwards one path to one upstream service.",...o?{onCreate:()=>({path:"",method:"GET",upstream:""})}:{},...w,renderHeader:({item:a,index:s})=>e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"shrink-0 text-sm font-medium",children:a.path||`Route ${s+1}`}),e.jsxs("code",{className:"truncate font-mono text-xs text-muted-foreground",children:[a.method," · ",a.upstream]})]}),renderBody:({item:a,onChange:s})=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("span",{className:"w-20 text-muted-foreground",children:"Path"}),e.jsx("input",{className:"h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm",value:a.path,onChange:h=>s({...a,path:h.target.value})})]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("span",{className:"w-20 text-muted-foreground",children:"Upstream"}),e.jsx("input",{className:"h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm",value:a.upstream,onChange:h=>s({...a,upstream:h.target.value})})]})]})})})}const l={render:()=>e.jsx(n,{addable:!1})},d={render:()=>e.jsx(n,{allowReorder:!0,allowDuplicate:!0,allowRemove:!0})},c={render:()=>e.jsx(n,{allowReorder:!0,addable:!1})},i={render:()=>e.jsx(n,{readOnly:!0,allowReorder:!0,allowRemove:!0})},u={render:()=>e.jsx(n,{initial:[]})},m={render:()=>e.jsx(n,{allowRemove:!0}),play:async({canvasElement:p,step:o})=>{const t=I(p),w=()=>t.getAllByRole("button",{expanded:!1});await o("starts with the two seeded routes",async()=>{await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(2)}),await o("the add row appends a route and opens it",async()=>{await x.click(t.getByRole("button",{name:/Add route/})),await r(t.getByRole("button",{expanded:!0})).toBeInTheDocument(),await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(3)}),await o("removing takes the named route out",async()=>{await x.click(t.getByRole("button",{name:"Remove /api/v1/users"})),await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(2)}),await o("only one row opens at a time",async()=>{await x.click(w()[0]),await r(t.getAllByRole("button",{expanded:!0})).toHaveLength(1)})}};var R,g,y;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <RouteList addable={false} />
}`,...(y=(g=l.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var b,f,A;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder allowDuplicate allowRemove />
}`,...(A=(f=d.parameters)==null?void 0:f.docs)==null?void 0:A.source}}};var B,j,L;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder addable={false} />
}`,...(L=(j=c.parameters)==null?void 0:j.docs)==null?void 0:L.source}}};var E,O,k;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <RouteList readOnly allowReorder allowRemove />
}`,...(k=(O=i.parameters)==null?void 0:O.docs)==null?void 0:k.source}}};var S,H,N;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <RouteList initial={[]} />
}`,...(N=(H=u.parameters)==null?void 0:H.docs)==null?void 0:N.source}}};var D,T,_;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(_=(T=m.parameters)==null?void 0:T.docs)==null?void 0:_.source}}};const z=["Default","WithActions","ReorderOnly","ReadOnly","Empty","AddsAndRemoves"];export{m as AddsAndRemoves,l as Default,u as Empty,i as ReadOnly,c as ReorderOnly,d as WithActions,z as __namedExportsOrder,q as default};
