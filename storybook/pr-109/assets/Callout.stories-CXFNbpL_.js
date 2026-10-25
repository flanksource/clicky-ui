import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{o as n,t as r}from"./callout-tones-DAF7DRxN.js";import{n as i,t as a}from"./Callout-CuMjtCp0.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),n(),o=t(),{expect:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`Data/Callout`,component:a,args:{variant:`note`,children:`Access reviews run twice a year, in January and July.`},parameters:{docs:{description:{component:'An emphasised aside. The five named tones mirror GitHub\'s alert types, so a document can use `<CalloutBox variant="caution">` in MDX and `> [!CAUTION]` in plain markdown and get the same box either way. `Markdown` renders authored `<CalloutBox>` tags through this component when `callouts` is set, and `MdxEditorField` edits them in place when `callouts` is enabled.'}}}},u={render:()=>(0,o.jsxs)(`div`,{children:[r.map(e=>(0,o.jsx)(a,{variant:e,children:`A ${e} callout, labelled with its own tone name.`},e)),(0,o.jsx)(a,{children:`An untinted default callout draws no header row at all.`})]}),play:async({canvasElement:e})=>{let t=c(e);await s(t.getByText(`Caution`)).toBeInTheDocument()}},d={args:{variant:`caution`,badge:`BCR-08`,label:`Gap`,source:`Policy Owner`,children:`Recovery time objectives are stated but not yet evidenced by a test.`}},f={args:{variant:`warning`,emphasis:!0,label:`TO BE AUTHORED`,children:`This section has no approved text yet and must not be published.`}},p={args:{variant:`warning`,icon:`important`,label:`TODO`,children:`Run the first tabletop exercise and retain the record.`}},m={args:{variant:`tip`,title:`Rotate before the deadline`,children:`Keys rotate on a 90-day cycle; the register tracks the next due date.`}},h=[`Tones`,`Annotation`,`Emphasis`,`IconOverride`,`WithTitle`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      {CALLOUT_TONES.map(tone => <Callout key={tone} variant={tone}>
          {\`A \${tone} callout, labelled with its own tone name.\`}
        </Callout>)}
      <Callout>An untinted default callout draws no header row at all.</Callout>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Caution")).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "caution",
    badge: "BCR-08",
    label: "Gap",
    source: "Policy Owner",
    children: "Recovery time objectives are stated but not yet evidenced by a test."
  }
}`,...d.parameters?.docs?.source},description:{story:`The annotation style the policy corpus uses: identifier, label and attribution on one row.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    emphasis: true,
    label: "TO BE AUTHORED",
    children: "This section has no approved text yet and must not be published."
  }
}`,...f.parameters?.docs?.source},description:{story:`A blocking callout takes the full border instead of the left rule.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    icon: "important",
    label: "TODO",
    children: "Run the first tabletop exercise and retain the record."
  }
}`,...p.parameters?.docs?.source},description:{story:`The glyph is named independently of the tone, for an amber note that reads as a question.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "tip",
    title: "Rotate before the deadline",
    children: "Keys rotate on a 90-day cycle; the register tracks the next due date."
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{d as Annotation,f as Emphasis,p as IconOverride,u as Tones,m as WithTitle,h as __namedExportsOrder,l as default};