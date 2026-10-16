import{j as m}from"./iframe-BUpmsD4_.js";import{p as A,l as I,a as K}from"./fixtures-C3TGvGxW.js";import{P as L}from"./ProcessFacetTable-DVsipD_d.js";import"./preload-helper-PGaPgbNH.js";import"./DataTable-D0ZAr8Wn.js";import"./SortableHeader-DzqJplk3.js";import"./utils-DW-IJACk.js";import"./loading-BVCwDMQn.js";import"./router-ivxbOHGV.js";import"./Modal-D_AIawBk.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./Icon-DTAROQQs.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D1B1BCNq.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./FilterPill-ZhMJAiFw.js";import"./filter-bar-multi-EJU47-mi.js";import"./Combobox-CaQ5ogPs.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B_Xf9fMG.js";import"./MultiSelect-DOVvlLhk.js";import"./RangeSlider-u6TDUAHA.js";import"./TimeRange-DLbdylta.js";import"./select-CBErET8H.js";import"./WorkloadPicker-BqShn2mb.js";import"./NamespacePicker-BYq-r1wS.js";import"./index-DuJeJ7XF.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Ca1ZM5fk.js";import"./TagList-DnAzIPxU.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-CJMlbbGv.js";import"./Properties-CzvVSyin.js";import"./IconButton-CdsDTQWb.js";import"./DropdownMenu-LyJi-wEU.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./format-2niohfpq.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./StatusDot-CD9gWk6p.js";import"./process-tree-BV4Gc7wn.js";const{expect:M,within:Y}=__STORYBOOK_MODULE_TEST__,r=(e,R=12)=>I(K.filter(U=>U.tick<=R),"101:100",e),Ie={title:"Data/Traces/ProcessFacetTable",component:L,args:{facet:"openFiles",reading:r("openFiles")},decorators:[e=>m.jsx("div",{className:"max-w-3xl rounded-md border border-border p-density-3",children:m.jsx(e,{})})],parameters:{docs:{description:{component:"One facet of a process as the trace stored it, in a filterable table: the latest stored list of its open files, sockets, listening ports or connections (with the time that list was read), or the environment recorded on its `process_tree` node. Nothing is fetched."}}}},t={play:async({canvasElement:e})=>{await M(Y(e).getByText("/dev/null")).toBeInTheDocument()}},o={args:{facet:"sockets",reading:r("sockets",8)}},s={args:{facet:"ports",reading:r("ports")}},n={args:{facet:"connections",reading:r("connections",8)}},a={args:{facet:"sockets",reading:r("sockets",12)}},i={args:{reading:void 0}},c={args:{facet:"env",environment:A}},p={args:{facet:"env",error:"permission denied reading the environment of pid 102"}};var d,g,l;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("/dev/null")).toBeInTheDocument();
  }
}`,...(l=(g=t.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var u,f,v;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    facet: "sockets",
    reading: reading("sockets", 8)
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var h,S,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    facet: "ports",
    reading: reading("ports")
  }
}`,...(x=(S=s.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var E,k,F;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    facet: "connections",
    reading: reading("connections", 8)
  }
}`,...(F=(k=n.parameters)==null?void 0:k.docs)==null?void 0:F.source}}};var T,b,y;a.parameters={...a.parameters,docs:{...(T=a.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    facet: "sockets",
    reading: reading("sockets", 12)
  }
}`,...(y=(b=a.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var _,w,O;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    reading: undefined
  }
}`,...(O=(w=i.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};var B,P,j;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    facet: "env",
    environment: processEnvFixture
  }
}`,...(j=(P=c.parameters)==null?void 0:P.docs)==null?void 0:j.source}}};var C,D,N;p.parameters={...p.parameters,docs:{...(C=p.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    facet: "env",
    error: "permission denied reading the environment of pid 102"
  }
}`,...(N=(D=p.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};const Ke=["OpenFiles","Sockets","Ports","Connections","EmptyAfterClosing","NothingStored","Environment","EnvironmentUnreadable"];export{n as Connections,a as EmptyAfterClosing,c as Environment,p as EnvironmentUnreadable,i as NothingStored,t as OpenFiles,s as Ports,o as Sockets,Ke as __namedExportsOrder,Ie as default};
