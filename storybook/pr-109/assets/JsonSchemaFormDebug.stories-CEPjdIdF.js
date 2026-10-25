import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./JsonSchemaForm-Bj4HmcqQ.js";var r,i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),{expect:r,userEvent:i,waitFor:a,within:o}=__STORYBOOK_MODULE_TEST__,s=[`groupName`,`groupDate`,`groupDescription`],c=[`category`,`loanOverride`,`classDate`,`classDescription`,`loanType`,`className`,`classAction`],l=(e,t)=>Object.fromEntries(e.map(e=>[e,{readOnly:t}])),u=[{when:{const:`00`},patch:{currentGroup:{readOnly:!0}},set:{currentGroup:`00000000-0000-0000-0000-000000000000`}},{when:{const:`00`},patch:{...l(s,!0),classAction:{readOnly:!1}},set:{groupName:``,groupDate:``,groupDescription:``,classAction:`00`}},{when:{const:`01`},hide:[`benefitsTitle`],patch:{...l(c,!0),...l(s,!1),currentGroup:{readOnly:!0}},set:{category:``,currentGroup:`00000000-0000-0000-0000-000000000000`,loanOverride:`00`,classDate:``,classDescription:``,loanType:`00`,className:``,classAction:`00`}},{when:{const:`02`},hide:[`benefitsTitle`],patch:{...l(c,!0),...l(s,!1),currentGroup:{readOnly:!1}},set:{category:``,loanOverride:`00`,classDate:``,classDescription:``,loanType:`00`,className:``,classAction:`00`}}],d=e=>({type:`string`,title:e}),f={type:`object`,properties:{groupAction:{type:`string`,title:`Group action`,enum:[`00`,`01`,`02`],"x-enum-labels":{"00":`-- Please select --`,"01":`Add`,"02":`Update`},"x-query":{type:`SQL`,sql:`Select '00' CodeValue, '-- Please select --' ShortDescription Union Select CodeValue, ShortDescription From Codes Where CodeName = 'UserOption'`},"x-on-change":u},currentGroup:d(`Current group`),groupName:d(`Group name`),groupDate:{type:`string`,format:`date`,title:`Group date`},groupDescription:d(`Group description`),benefitsTitle:d(`Benefits`),category:d(`Category`),loanOverride:d(`Loan override`),classDate:{type:`string`,format:`date`,title:`Class date`},classDescription:d(`Class description`),loanType:d(`Loan type`),className:d(`Class name`),classAction:d(`Class action`)}},p={title:`JsonSchemaForm/Debug`,component:n,args:{onChange:()=>void 0}},m={args:{schema:f,value:{groupAction:`01`},preferencesStorageKey:`storybook-json-schema-form-debug-large`},parameters:{docs:{description:{story:"A field whose debug card outgrows a hover card. Listener rows gather the fields a listener sets to one value or patches one way (`readOnly: true` → seven fields) so each listener stays a few rows. The card clamps behind **Show more**, and **Open in dialog** shows the full details in a modal that stays open after the hover card closes."}}},play:async({canvasElement:e,step:t})=>{let n=o(e),s=o(document.body);await t(`Turn on Debug`,async()=>{await i.click(n.getByRole(`button`,{name:`Form display options`})),await i.click(await s.findByRole(`menuitemcheckbox`,{name:/Show hidden fields/}))}),await t(`The group action card is clamped behind Show more`,async()=>{await i.hover(await n.findByRole(`button`,{name:`Debug groupAction`}));let e=await s.findByTestId(`json-schema-form-debug-card`);await a(()=>r(o(e).getByRole(`button`,{name:`Show more`})).toBeInTheDocument())})}},h=[`LargeField`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}}})))()}g();export{m as LargeField,h as __namedExportsOrder,p as default};