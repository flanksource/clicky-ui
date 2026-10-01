import{r as w,j as n}from"./iframe-Cz62D_iz.js";import{J as f}from"./JsonSchemaForm-CbGXSkOr.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-DkXLnjJN.js";import"./DropdownMenu-CSiL2JEe.js";import"./floating-ui.react-B3VArII0.js";import"./index-CwDukIsd.js";import"./index-D1QWHGI5.js";import"./button-Da_C00l5.js";import"./index-CPURVhFy.js";import"./loading-CpNJyOux.js";import"./DropdownMenuSubmenu-DbLMIeXR.js";import"./modalStack-BS9FGIbV.js";import"./zIndex-BGbNBNA8.js";import"./Properties-B1Ulbj5-.js";import"./IconButton-BRduhpjC.js";import"./HoverCard-BugDtYi2.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-CvxqKJ19.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CNDOvUSy.js";import"./FilterPill-DTfRv4Z5.js";import"./DateField-BncnpdDR.js";import"./DatePicker-BOTtv-NE.js";import"./DateTimePicker-CJvLUyFc.js";import"./SegmentedControl-1VLDNc0s.js";import"./TreePickerField-B8wI19f_.js";import"./Tree-Bay9xJbM.js";import"./TreeNode-BYnedoGr.js";import"./AccordionList-BIoJbx8c.js";import"./InputField-DauBAM0d.js";import"./use-hotkey-D6jmYKfm.js";import"./ListMenu-DVyCN53q.js";import"./Markdown-CnTdsY9m.js";import"./Callout-kqNFF0Oz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-IdrdyxjQ.js";import"./CodeDiff-CWL3DUpA.js";import"./HighlightedTokens-DQPWohiH.js";import"./JsonView-MYgqOyIx.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const ce={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("the 3-column array opens as a grid, the 7-column one as item rows", async () => {
      await expect(canvas.getAllByRole("table")).toHaveLength(1);
    });
    await step("the view menu switches the grid to the stack form", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "View options for Beneficiaries"
      }));
      await userEvent.click(within(document.body).getByRole("menuitem", {
        name: "Stack form"
      }));
      await expect(canvas.queryByRole("table")).toBeNull();
    });
  }
}`,...(u=(l=i.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var y,d,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const le=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,le as __namedExportsOrder,ce as default};
