import{J as y}from"./JsonSchemaForm-CbGXSkOr.js";import"./iframe-Cz62D_iz.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-DkXLnjJN.js";import"./DropdownMenu-CSiL2JEe.js";import"./floating-ui.react-B3VArII0.js";import"./index-CwDukIsd.js";import"./index-D1QWHGI5.js";import"./button-Da_C00l5.js";import"./index-CPURVhFy.js";import"./loading-CpNJyOux.js";import"./DropdownMenuSubmenu-DbLMIeXR.js";import"./modalStack-BS9FGIbV.js";import"./zIndex-BGbNBNA8.js";import"./Properties-B1Ulbj5-.js";import"./IconButton-BRduhpjC.js";import"./HoverCard-BugDtYi2.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-CvxqKJ19.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CNDOvUSy.js";import"./FilterPill-DTfRv4Z5.js";import"./DateField-BncnpdDR.js";import"./DatePicker-BOTtv-NE.js";import"./DateTimePicker-CJvLUyFc.js";import"./SegmentedControl-1VLDNc0s.js";import"./TreePickerField-B8wI19f_.js";import"./Tree-Bay9xJbM.js";import"./TreeNode-BYnedoGr.js";import"./AccordionList-BIoJbx8c.js";import"./InputField-DauBAM0d.js";import"./use-hotkey-D6jmYKfm.js";import"./ListMenu-DVyCN53q.js";import"./Markdown-CnTdsY9m.js";import"./Callout-kqNFF0Oz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-IdrdyxjQ.js";import"./CodeDiff-CWL3DUpA.js";import"./HighlightedTokens-DQPWohiH.js";import"./JsonView-MYgqOyIx.js";const{expect:g,userEvent:s,waitFor:w,within:i}=__STORYBOOK_MODULE_TEST__,c=["groupName","groupDate","groupDescription"],l=["category","loanOverride","classDate","classDescription","loanType","className","classAction"],o=(t,a)=>Object.fromEntries(t.map(r=>[r,{readOnly:a}])),f=[{when:{const:"00"},patch:{currentGroup:{readOnly:!0}},set:{currentGroup:"00000000-0000-0000-0000-000000000000"}},{when:{const:"00"},patch:{...o(c,!0),classAction:{readOnly:!1}},set:{groupName:"",groupDate:"",groupDescription:"",classAction:"00"}},{when:{const:"01"},hide:["benefitsTitle"],patch:{...o(l,!0),...o(c,!1),currentGroup:{readOnly:!0}},set:{category:"",currentGroup:"00000000-0000-0000-0000-000000000000",loanOverride:"00",classDate:"",classDescription:"",loanType:"00",className:"",classAction:"00"}},{when:{const:"02"},hide:["benefitsTitle"],patch:{...o(l,!0),...o(c,!1),currentGroup:{readOnly:!1}},set:{category:"",loanOverride:"00",classDate:"",classDescription:"",loanType:"00",className:"",classAction:"00"}}],e=t=>({type:"string",title:t}),b={type:"object",properties:{groupAction:{type:"string",title:"Group action",enum:["00","01","02"],"x-enum-labels":{"00":"-- Please select --","01":"Add","02":"Update"},"x-query":{type:"SQL",sql:"Select '00' CodeValue, '-- Please select --' ShortDescription Union Select CodeValue, ShortDescription From Codes Where CodeName = 'UserOption'"},"x-on-change":f},currentGroup:e("Current group"),groupName:e("Group name"),groupDate:{type:"string",format:"date",title:"Group date"},groupDescription:e("Group description"),benefitsTitle:e("Benefits"),category:e("Category"),loanOverride:e("Loan override"),classDate:{type:"string",format:"date",title:"Class date"},classDescription:e("Class description"),loanType:e("Loan type"),className:e("Class name"),classAction:e("Class action")}},pe={title:"JsonSchemaForm/Debug",component:y,args:{onChange:()=>{}}},n={args:{schema:b,value:{groupAction:"01"},preferencesStorageKey:"storybook-json-schema-form-debug-large"},parameters:{docs:{description:{story:"A field whose debug card outgrows a hover card. Listener rows gather the fields a listener sets to one value or patches one way (`readOnly: true` → seven fields) so each listener stays a few rows. The card clamps behind **Show more**, and **Open in dialog** shows the full details in a modal that stays open after the hover card closes."}}},play:async({canvasElement:t,step:a})=>{const r=i(t),p=i(document.body);await a("Turn on Debug",async()=>{await s.click(r.getByRole("button",{name:"Form display options"})),await s.click(await p.findByRole("menuitemcheckbox",{name:/Show hidden fields/}))}),await a("The group action card is clamped behind Show more",async()=>{await s.hover(await r.findByRole("button",{name:"Debug groupAction"}));const h=await p.findByTestId("json-schema-form-debug-card");await w(()=>g(i(h).getByRole("button",{name:"Show more"})).toBeInTheDocument())})}};var m,d,u;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    schema: largeFieldSchema,
    value: {
      groupAction: "01"
    },
    preferencesStorageKey: "storybook-json-schema-form-debug-large"
  },
  parameters: {
    docs: {
      description: {
        story: "A field whose debug card outgrows a hover card. Listener rows gather the fields a listener sets to one value or patches one way (\`readOnly: true\` → seven fields) so each listener stays a few rows. The card clamps behind **Show more**, and **Open in dialog** shows the full details in a modal that stays open after the hover card closes."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("Turn on Debug", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Form display options"
      }));
      await userEvent.click(await body.findByRole("menuitemcheckbox", {
        name: /Show hidden fields/
      }));
    });
    await step("The group action card is clamped behind Show more", async () => {
      await userEvent.hover(await canvas.findByRole("button", {
        name: "Debug groupAction"
      }));
      const card = await body.findByTestId("json-schema-form-debug-card");
      await waitFor(() => expect(within(card).getByRole("button", {
        name: "Show more"
      })).toBeInTheDocument());
    });
  }
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};const le=["LargeField"];export{n as LargeField,le as __namedExportsOrder,pe as default};
