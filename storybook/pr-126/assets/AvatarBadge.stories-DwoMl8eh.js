import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{$s as t,n,xc as r}from"./icons-ClABX2sF.js";import{n as i,t as a}from"./AvatarBadge-BUIL13XA.js";var o,s,c,l,u,d;function f(){return(f=e((()=>{i(),n(),o={title:`Data/AvatarBadge`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"A pill that pairs an `Avatar` with a label and an optional trailing status `Icon`, with an optional multi-line comment beneath. Used for assignee/owner chips and review rows."}}},argTypes:{alt:{control:`text`},label:{control:`text`},initials:{control:`text`},avatarKind:{control:`inline-radio`,options:[`user`,`bot`,`service`]},avatarVariant:{control:`inline-radio`,options:[`duotone`,`filled`,`outline`]},size:{control:`inline-radio`,options:[`sm`,`md`,`lg`,`xl`]},comment:{control:`text`}},args:{alt:`Ada Lovelace`,label:`Ada Lovelace`,avatarKind:`user`,size:`lg`}},s={},c={args:{statusIcon:t,statusTone:`emerald`,statusTitle:`Approved`}},l={args:{statusIcon:r,statusTone:`amber`,comment:`Requested changes on the migration step before this can merge.`}},u={args:{alt:`Grace Hopper`,label:`Grace Hopper`,initials:`GH`}},d=[`Default`,`WithStatus`,`WithComment`,`Initials`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    statusIcon: UiCheckFilled,
    statusTone: "emerald",
    statusTitle: "Approved"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    statusIcon: UiWarningTriangle,
    statusTone: "amber",
    comment: "Requested changes on the migration step before this can merge."
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    alt: "Grace Hopper",
    label: "Grace Hopper",
    initials: "GH"
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{s as Default,u as Initials,l as WithComment,c as WithStatus,d as __namedExportsOrder,o as default};