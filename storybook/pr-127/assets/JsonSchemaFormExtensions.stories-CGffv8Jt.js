import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./JsonSchemaForm-BICYrXQF.js";function a(e){return e}function o(){return(o=e((()=>{})))()}function s({field:e,value:t,onChange:n,fieldId:r,readOnly:i}){let a=(e.schema.examples??[]).filter(e=>typeof e==`string`);return(0,l.jsx)(`div`,{id:r,role:`radiogroup`,"aria-label":e.label,"data-example-color":!0,className:`flex items-center gap-2`,children:a.map(e=>(0,l.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":t===e,"aria-label":e,disabled:i,onClick:()=>n(e),style:{backgroundColor:e},className:t===e?`size-6 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background`:`size-6 rounded-full border border-border`},e))})}function c({field:e,value:t,onChange:n,fieldId:r,readOnly:i}){let{minimum:a,maximum:o,multipleOf:s}=e.schema,c=s??1,u=typeof t==`number`?t:a??0,d=e=>Math.min(o??e,Math.max(a??e,e));return(0,l.jsxs)(`div`,{id:r,role:`group`,"aria-label":e.label,"data-example-stepper":!0,className:`inline-flex items-center gap-2`,children:[(0,l.jsx)(`button`,{type:`button`,"aria-label":`Decrease`,disabled:i||a!==void 0&&u<=a,onClick:()=>n(d(u-c)),className:`size-7 rounded-md border border-input bg-background text-sm disabled:opacity-50`,children:`−`}),(0,l.jsx)(`output`,{"aria-label":`${e.label} value`,className:`min-w-8 text-center text-sm tabular-nums`,children:u}),(0,l.jsx)(`button`,{type:`button`,"aria-label":`Increase`,disabled:i||o!==void 0&&u>=o,onClick:()=>n(d(u+c)),className:`size-7 rounded-md border border-input bg-background text-sm disabled:opacity-50`,children:`+`})]})}var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{o(),l=n(),u=[{value:`ada`,label:`Ada Lovelace`},{value:`grace`,label:`Grace Hopper`},{value:`linus`,label:`Linus Torvalds`}],d=e=>e.messages.map((e,t)=>(0,l.jsx)(`p`,{className:`text-xs text-destructive`,children:e.message},t)),f=({children:e})=>(0,l.jsx)(`div`,{"data-example-cards":!0,className:`grid gap-3 md:grid-cols-2`,children:e}),p=e=>(0,l.jsxs)(`section`,{"data-example-card":e.field.key,className:`col-span-full flex flex-col gap-2 rounded-md border border-border bg-card p-3 md:col-span-1`,children:[(0,l.jsx)(`div`,{className:`text-sm font-medium`,children:e.label}),e.value,d(e)]}),m=({children:e})=>(0,l.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:e}),h=e=>(0,l.jsxs)(`div`,{"data-example-chips":e.field.key,className:`col-span-full flex flex-col gap-1 rounded-2xl border border-dashed border-border p-3`,children:[(0,l.jsx)(`div`,{className:`text-sm font-medium`,children:e.label}),e.value,d(e)]}),g=a({name:`example`,formats:{color:s,stepper:c},lookups:{"ext:team-members":async({query:e})=>u.filter(t=>t.label.toLowerCase().includes(e.toLowerCase()))},layouts:{cards:{Grid:f,Row:p},chips:{Grid:m,Row:h}},slots:{Title:({title:e})=>(0,l.jsx)(`h2`,{"data-example-title":!0,className:`text-lg font-semibold`,children:e})},pre:[e=>e.key===`name`?{...e,badge:`id`}:e],post:[(e,t)=>e.format===`color`?{...t,label:(0,l.jsxs)(l.Fragment,{children:[t.label,(0,l.jsx)(`span`,{"data-example-color-mark":!0,"aria-hidden":!0,children:`●`})]})}:t]})})))()}var v,y,b,x,S;function C(){return(C=e((()=>{v=`object`,y=`Service`,b=[`name`,`owner`],x={name:{type:`string`,title:`Name`},color:{type:`string`,title:`Accent`,format:`color`,examples:[`#0ea5e9`,`#22c55e`,`#f97316`],default:`#0ea5e9`},owner:{type:`string`,title:`Owner`,"x-clicky-lookup":{url:`ext:team-members`,filter:`id`}},replicas:{type:`integer`,title:`Replicas`,format:`stepper`,minimum:1,maximum:10,multipleOf:1},endpoints:{type:`array`,title:`Endpoints`,"x-layout":`chips`,items:{type:`string`,format:`uri`}},notes:{type:`string`,title:`Notes`,format:`md`}},S={type:v,title:y,"x-clicky-extensions":[{ref:`examples/form-extensions/extension.tsx`}],"x-order":[`name`,`color`,`owner`,`replicas`,`endpoints`,`notes`],required:b,properties:x}})))()}var w,T,E,D,O;function k(){return(k=e((()=>{w=`checkout-api`,T=`#0ea5e9`,E=[`https://checkout.example.com`,`https://checkout.internal.example.com`],D=`Handles **checkout** for the storefront.`,O={name:w,color:T,owner:`ada`,replicas:3,endpoints:E,notes:D}})))()}function A(){let[e,t]=(0,j.useState)(O);return(0,M.jsxs)(`div`,{className:`max-w-3xl space-y-4`,children:[(0,M.jsx)(i,{title:`Service`,schema:S,value:e,onChange:t,layout:{mode:`cards`},extensionLoader:R,persistPreferences:!1}),(0,M.jsx)(`output`,{"data-testid":`value`,className:`block whitespace-pre-wrap font-mono text-xs`,children:JSON.stringify(e)})]})}var j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{j=t(),r(),_(),C(),k(),M=n(),{expect:N,fireEvent:P,userEvent:F,waitFor:I,within:L}=__STORYBOOK_MODULE_TEST__,R=async e=>{if(!(`ref`in e)||e.ref!==`examples/form-extensions/extension.tsx`)throw Error(`unexpected extension source ${JSON.stringify(e)}`);return g},z={title:`Extensions/FormExtension`,component:A,parameters:{docs:{description:{component:"`extensions` on `JsonSchemaForm` takes `FormExtension` bundles (`defineFormExtension`). Registering a built-in format or layout name, or the same name from two extensions, throws. An unregistered `format` (such as `uri`) still renders as before; an unregistered layout name throws."}}}},B={play:async({canvasElement:e})=>{let t=L(e);await t.findByRole(`radiogroup`,{name:`Accent`});let n=()=>JSON.parse(t.getByTestId(`value`).textContent??`{}`);N(e.querySelector(`[data-example-title]`)).toHaveTextContent(`Service`),N(e.querySelector(`[data-example-cards]`)).toBeInTheDocument(),N(e.querySelector(`[data-example-card="name"]`)).toBeInTheDocument(),N(e.querySelector(`[data-example-chips="endpoints"]`)).toBeInTheDocument(),N(e.querySelector(`[data-example-card="endpoints"]`)).not.toBeInTheDocument(),N(e.querySelector(`[data-example-card="name"]`)).toHaveTextContent(`id`);let r=t.getByRole(`radiogroup`,{name:`Accent`});N(L(r).getAllByRole(`radio`)).toHaveLength(3),await F.click(L(r).getByRole(`radio`,{name:`#22c55e`})),await I(()=>N(n().color).toBe(`#22c55e`)),N(e.querySelectorAll(`[data-example-color-mark]`)).toHaveLength(1);let i=t.getByRole(`group`,{name:`Replicas`});await F.click(L(i).getByRole(`button`,{name:`Increase`})),await I(()=>N(n().replicas).toBe(4)),P.keyDown(t.getByRole(`combobox`,{name:/Owner/}),{key:`ArrowDown`}),N(await L(document.body).findByText(`Grace Hopper`)).toBeInTheDocument(),await F.keyboard(`{Escape}`);let a=e.querySelector(`[data-example-chips="endpoints"]`);N(L(a).getByPlaceholderText(`Add tag…`)).toHaveAttribute(`type`,`text`),N(e.querySelector(`[data-example-card="notes"]`)).toBeInTheDocument(),N(e.querySelectorAll(`[data-example-color]`)).toHaveLength(1)}},V=[`Example`],B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // the declared extension loads first (Loading, then the form)
    await canvas.findByRole("radiogroup", {
      name: "Accent"
    });
    const output = () => JSON.parse(canvas.getByTestId("value").textContent ?? "{}") as Record<string, unknown>;

    // slots: Title
    expect(canvasElement.querySelector("[data-example-title]")).toHaveTextContent("Service");

    // layouts, form level: layout.mode "cards"
    expect(canvasElement.querySelector("[data-example-cards]")).toBeInTheDocument();
    expect(canvasElement.querySelector('[data-example-card="name"]')).toBeInTheDocument();

    // layouts, field level: endpoints use x-layout "chips"
    expect(canvasElement.querySelector('[data-example-chips="endpoints"]')).toBeInTheDocument();
    expect(canvasElement.querySelector('[data-example-card="endpoints"]')).not.toBeInTheDocument();

    // pre: the id badge on name
    expect(canvasElement.querySelector('[data-example-card="name"]')).toHaveTextContent("id");

    // formats: color swatches, committing a pick; post: the marker on the label
    const swatches = canvas.getByRole("radiogroup", {
      name: "Accent"
    });
    expect(within(swatches).getAllByRole("radio")).toHaveLength(3);
    await userEvent.click(within(swatches).getByRole("radio", {
      name: "#22c55e"
    }));
    await waitFor(() => expect(output().color).toBe("#22c55e"));
    expect(canvasElement.querySelectorAll("[data-example-color-mark]")).toHaveLength(1);

    // formats: stepper bounded by minimum/maximum
    const stepper = canvas.getByRole("group", {
      name: "Replicas"
    });
    await userEvent.click(within(stepper).getByRole("button", {
      name: "Increase"
    }));
    await waitFor(() => expect(output().replicas).toBe(4));

    // lookups: owner is served by the extension's ext:team-members handler
    fireEvent.keyDown(canvas.getByRole("combobox", {
      name: /Owner/
    }), {
      key: "ArrowDown"
    });
    expect(await within(document.body).findByText("Grace Hopper")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");

    // formats: uri is not registered by any extension, so its items still use the stock tag input
    const chips = canvasElement.querySelector<HTMLElement>('[data-example-chips="endpoints"]')!;
    expect(within(chips).getByPlaceholderText("Add tag…")).toHaveAttribute("type", "text");

    // formats: md is reserved and stays the built-in editor, not an extension control
    expect(canvasElement.querySelector('[data-example-card="notes"]')).toBeInTheDocument();
    expect(canvasElement.querySelectorAll("[data-example-color]")).toHaveLength(1);
  }
}`,...B.parameters?.docs?.source}}}})))()}H();export{B as Example,V as __namedExportsOrder,z as default};