import{j as e,r as $}from"./iframe-DxH86FBA.js";import{A as I}from"./AccordionList-CD0seW3U.js";import"./preload-helper-CwXsRPHT.js";import"./collections-CoHfwOze.js";import"./utils-DW-IJACk.js";import"./Icon-w2YOVKhv.js";import"./json-schema-form-size-E77C3uZS.js";const{expect:r,userEvent:g,within:F}=__STORYBOOK_MODULE_TEST__,X={title:"Components/AccordionList",component:I,tags:["autodocs"],parameters:{docs:{description:{component:"A list of items collapsed to one row each, expanding one at a time into that item's own editor. `renderHeader` and `renderBody` are the only content the consumer supplies; the disclosure, aria pairing, arrow-key roving focus, action buttons and add row belong to the list. Every editing capability is opt-in (`allowReorder`, `allowDuplicate`, `allowRemove`, `onCreate`), so the same component serves a read-only summary list and a full editor."}}}},K=[{path:"/api/v1/users",method:"GET",upstream:"users-svc:8080"},{path:"/api/v1/events",method:"POST",upstream:"events-svc:8080"}];function o(x){const{addable:n=!0,initial:t=K,...h}=x,[v,P]=$.useState(t);return e.jsx("div",{className:"max-w-2xl",children:e.jsx(I,{items:v,onChange:P,summary:v.length===1?"1 route":`${v.length} routes`,itemLabel:({item:a})=>a.path,addLabel:"Add route",addDescription:"A route forwards one path to one upstream service.",...n?{onCreate:()=>({path:"",method:"GET",upstream:""})}:{},...h,renderHeader:({item:a,index:s})=>e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"shrink-0 text-sm font-medium",children:a.path||`Route ${s+1}`}),e.jsxs("code",{className:"truncate font-mono text-xs text-muted-foreground",children:[a.method," · ",a.upstream]})]}),renderBody:({item:a,onChange:s})=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("span",{className:"w-20 text-muted-foreground",children:"Path"}),e.jsx("input",{className:"h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm",value:a.path,onChange:w=>s({...a,path:w.target.value})})]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("span",{className:"w-20 text-muted-foreground",children:"Upstream"}),e.jsx("input",{className:"h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm",value:a.upstream,onChange:w=>s({...a,upstream:w.target.value})})]})]})})})}const l={render:()=>e.jsx(o,{addable:!1})},d={render:()=>e.jsx(o,{allowReorder:!0,allowDuplicate:!0,allowRemove:!0})},c={render:()=>e.jsx(o,{allowReorder:!0,addable:!1})},i={render:()=>e.jsx(o,{readOnly:!0,allowReorder:!0,allowRemove:!0})},u={render:()=>e.jsx(o,{initial:[]})},m={render:()=>e.jsx(o,{addable:!1,toolbar:e.jsx("button",{type:"button",className:"rounded px-2 text-xs text-muted-foreground hover:bg-accent",children:"Export"})})},p={render:()=>e.jsx(o,{allowRemove:!0}),play:async({canvasElement:x,step:n})=>{const t=F(x),h=()=>t.getAllByRole("button",{expanded:!1});await n("starts with the two seeded routes",async()=>{await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(2)}),await n("the add row appends a route and opens it",async()=>{await g.click(t.getByRole("button",{name:/Add route/})),await r(t.getByRole("button",{expanded:!0})).toBeInTheDocument(),await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(3)}),await n("removing takes the named route out",async()=>{await g.click(t.getByRole("button",{name:"Remove /api/v1/users"})),await r(t.getAllByRole("button",{name:/^Remove/})).toHaveLength(2)}),await n("only one row opens at a time",async()=>{await g.click(h()[0]),await r(t.getAllByRole("button",{expanded:!0})).toHaveLength(1)})}};var R,b,y;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <RouteList addable={false} />
}`,...(y=(b=l.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var f,A,j;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder allowDuplicate allowRemove />
}`,...(j=(A=d.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var B,L,E;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <RouteList allowReorder addable={false} />
}`,...(E=(L=c.parameters)==null?void 0:L.docs)==null?void 0:E.source}}};var O,k,N;i.parameters={...i.parameters,docs:{...(O=i.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <RouteList readOnly allowReorder allowRemove />
}`,...(N=(k=i.parameters)==null?void 0:k.docs)==null?void 0:N.source}}};var S,T,H;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <RouteList initial={[]} />
}`,...(H=(T=u.parameters)==null?void 0:T.docs)==null?void 0:H.source}}};var D,_,C;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <RouteList addable={false} toolbar={<button type="button" className="rounded px-2 text-xs text-muted-foreground hover:bg-accent">
          Export
        </button>} />
}`,...(C=(_=m.parameters)==null?void 0:_.docs)==null?void 0:C.source}}};var W,U,G;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(G=(U=p.parameters)==null?void 0:U.docs)==null?void 0:G.source}}};const Z=["Default","WithActions","ReorderOnly","ReadOnly","Empty","WithToolbar","AddsAndRemoves"];export{p as AddsAndRemoves,l as Default,u as Empty,i as ReadOnly,c as ReorderOnly,d as WithActions,m as WithToolbar,Z as __namedExportsOrder,X as default};
