import{J as y}from"./JsonSchemaForm-BLiMJNcQ.js";import"./iframe-BsAqiW63.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";import"./Icon-Dyy6aaqa.js";import"./DropdownMenu-CRLAXTiF.js";import"./floating-ui.react-C__wji9y.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./format-2niohfpq.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-qlF4Wnfg.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BKuWHLhN.js";import"./FilterPill-Bzw0s4Xn.js";import"./DateField-CgvwTfO5.js";import"./DatePicker-DrZpenEB.js";import"./DateTimePicker-Bx8fiptj.js";import"./SegmentedControl-CKXvowSa.js";import"./TreePickerField-DK9uVoie.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./InputField-DDv98Cn3.js";import"./use-hotkey-BcWYTy9O.js";import"./ListMenu-ojNBp5xm.js";import"./Markdown-DuzdQE_P.js";import"./ConfirmDialog-Dy2NjZjp.js";import"./Callout-DsXXS4Pz.js";import"./callout-tones-EFt49BYo.js";import"./router-BgYu87PQ.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";const{expect:g,userEvent:s,waitFor:w,within:i}=__STORYBOOK_MODULE_TEST__,c=["groupName","groupDate","groupDescription"],m=["category","loanOverride","classDate","classDescription","loanType","className","classAction"],o=(t,r)=>Object.fromEntries(t.map(a=>[a,{readOnly:r}])),f=[{when:{const:"00"},patch:{currentGroup:{readOnly:!0}},set:{currentGroup:"00000000-0000-0000-0000-000000000000"}},{when:{const:"00"},patch:{...o(c,!0),classAction:{readOnly:!1}},set:{groupName:"",groupDate:"",groupDescription:"",classAction:"00"}},{when:{const:"01"},hide:["benefitsTitle"],patch:{...o(m,!0),...o(c,!1),currentGroup:{readOnly:!0}},set:{category:"",currentGroup:"00000000-0000-0000-0000-000000000000",loanOverride:"00",classDate:"",classDescription:"",loanType:"00",className:"",classAction:"00"}},{when:{const:"02"},hide:["benefitsTitle"],patch:{...o(m,!0),...o(c,!1),currentGroup:{readOnly:!1}},set:{category:"",loanOverride:"00",classDate:"",classDescription:"",loanType:"00",className:"",classAction:"00"}}],e=t=>({type:"string",title:t}),b={type:"object",properties:{groupAction:{type:"string",title:"Group action",enum:["00","01","02"],"x-enum-labels":{"00":"-- Please select --","01":"Add","02":"Update"},"x-query":{type:"SQL",sql:"Select '00' CodeValue, '-- Please select --' ShortDescription Union Select CodeValue, ShortDescription From Codes Where CodeName = 'UserOption'"},"x-on-change":f},currentGroup:e("Current group"),groupName:e("Group name"),groupDate:{type:"string",format:"date",title:"Group date"},groupDescription:e("Group description"),benefitsTitle:e("Benefits"),category:e("Category"),loanOverride:e("Loan override"),classDate:{type:"string",format:"date",title:"Class date"},classDescription:e("Class description"),loanType:e("Loan type"),className:e("Class name"),classAction:e("Class action")}},ge={title:"JsonSchemaForm/Debug",component:y,args:{onChange:()=>{}}},n={args:{schema:b,value:{groupAction:"01"},preferencesStorageKey:"storybook-json-schema-form-debug-large"},parameters:{docs:{description:{story:"A field whose debug card outgrows a hover card. Listener rows gather the fields a listener sets to one value or patches one way (`readOnly: true` → seven fields) so each listener stays a few rows. The card clamps behind **Show more**, and **Open in dialog** shows the full details in a modal that stays open after the hover card closes."}}},play:async({canvasElement:t,step:r})=>{const a=i(t),p=i(document.body);await r("Turn on Debug",async()=>{await s.click(a.getByRole("button",{name:"Form display options"})),await s.click(await p.findByRole("menuitemcheckbox",{name:/Show hidden fields/}))}),await r("The group action card is clamped behind Show more",async()=>{await s.hover(await a.findByRole("button",{name:"Debug groupAction"}));const h=await p.findByTestId("json-schema-form-debug-card");await w(()=>g(i(h).getByRole("button",{name:"Show more"})).toBeInTheDocument())})}};var l,d,u;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};const we=["LargeField"];export{n as LargeField,we as __namedExportsOrder,ge as default};
