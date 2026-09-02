import{j as s}from"./iframe-z_87u_i8.js";import{C as i}from"./Callout-D-BNIDCr.js";import{C as D}from"./callout-tones-DN7X2Ehz.js";import"./preload-helper-CF8-vpnN.js";import"./utils-DW-IJACk.js";const{expect:S,within:j}=__STORYBOOK_MODULE_TEST__,G={title:"Data/Callout",component:i,args:{variant:"note",children:"Access reviews run twice a year, in January and July."},parameters:{docs:{description:{component:'An emphasised aside. The five named tones mirror GitHub\'s alert types, so a document can use `<CalloutBox variant="caution">` in MDX and `> [!CAUTION]` in plain markdown and get the same box either way. `Markdown` renders authored `<CalloutBox>` tags through this component when `callouts` is set, and `MdxEditorField` edits them in place when `callouts` is enabled.'}}}},r={render:()=>s.jsxs("div",{children:[D.map(e=>s.jsx(i,{variant:e,children:`A ${e} callout, labelled with its own tone name.`},e)),s.jsx(i,{children:"An untinted default callout draws no header row at all."})]}),play:async({canvasElement:e})=>{const _=j(e);await S(_.getByText("Caution")).toBeInTheDocument()}},t={args:{variant:"caution",badge:"BCR-08",label:"Gap",source:"Policy Owner",children:"Recovery time objectives are stated but not yet evidenced by a test."}},a={args:{variant:"warning",emphasis:!0,label:"TO BE AUTHORED",children:"This section has no approved text yet and must not be published."}},n={args:{variant:"warning",icon:"important",label:"TODO",children:"Run the first tabletop exercise and retain the record."}},o={args:{variant:"tip",title:"Rotate before the deadline",children:"Keys rotate on a 90-day cycle; the register tracks the next due date."}};var c,d,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(l=(d=r.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var p,u,m,h,y;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: "caution",
    badge: "BCR-08",
    label: "Gap",
    source: "Policy Owner",
    children: "Recovery time objectives are stated but not yet evidenced by a test."
  }
}`,...(m=(u=t.parameters)==null?void 0:u.docs)==null?void 0:m.source},description:{story:"The annotation style the policy corpus uses: identifier, label and attribution on one row.",...(y=(h=t.parameters)==null?void 0:h.docs)==null?void 0:y.description}}};var b,v,g,T,w;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    emphasis: true,
    label: "TO BE AUTHORED",
    children: "This section has no approved text yet and must not be published."
  }
}`,...(g=(v=a.parameters)==null?void 0:v.docs)==null?void 0:g.source},description:{story:"A blocking callout takes the full border instead of the left rule.",...(w=(T=a.parameters)==null?void 0:T.docs)==null?void 0:w.description}}};var O,x,f,C,E;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    icon: "important",
    label: "TODO",
    children: "Run the first tabletop exercise and retain the record."
  }
}`,...(f=(x=n.parameters)==null?void 0:x.docs)==null?void 0:f.source},description:{story:"The glyph is named independently of the tone, for an amber note that reads as a question.",...(E=(C=n.parameters)==null?void 0:C.docs)==null?void 0:E.description}}};var A,R,B;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: "tip",
    title: "Rotate before the deadline",
    children: "Keys rotate on a 90-day cycle; the register tracks the next due date."
  }
}`,...(B=(R=o.parameters)==null?void 0:R.docs)==null?void 0:B.source}}};const H=["Tones","Annotation","Emphasis","IconOverride","WithTitle"];export{t as Annotation,a as Emphasis,n as IconOverride,r as Tones,o as WithTitle,H as __namedExportsOrder,G as default};
