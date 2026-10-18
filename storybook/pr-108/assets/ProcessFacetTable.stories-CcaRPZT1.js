import{j as m}from"./iframe-CKgGkAV6.js";import{p as A,l as I,a as K}from"./fixtures-C3TGvGxW.js";import{P as L}from"./ProcessFacetTable-CpQ6ya09.js";import"./preload-helper-D6IOlyYr.js";import"./DataTable-vloyht7y.js";import"./SortableHeader-Ry5ldV7u.js";import"./utils-DW-IJACk.js";import"./loading-CVVM6inm.js";import"./router-BaKFvvG8.js";import"./Modal-CyMxnyK7.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./Icon-zT9BHEU_.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DpLc6Jkd.js";import"./floating-ui.react-DvrmiGRg.js";import"./FilterPill-CvKT4WAZ.js";import"./filter-bar-multi-Dt__OFRf.js";import"./Combobox-Ce8evdZR.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BbQkUMe4.js";import"./MultiSelect-C-Y1qLAG.js";import"./RangeSlider-BaY40EZu.js";import"./TimeRange-j9ZOOMTL.js";import"./select-eS4vf-VP.js";import"./WorkloadPicker-BWVZwiTh.js";import"./NamespacePicker-BlJZooVo.js";import"./index-UgZ8RgH0.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C0FbbUfZ.js";import"./TagList-DXVHXee-.js";import"./Badge-DNVG-Ar4.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D6AhenUg.js";import"./Properties-aB4NtyEt.js";import"./IconButton-_EDmsPTs.js";import"./DropdownMenu-BmZ28lfR.js";import"./DropdownMenuSubmenu-j0TnzvxK.js";import"./format-2niohfpq.js";import"./JsonView-CkPnotjI.js";import"./AccordionList-5bOCqJVe.js";import"./collections-CoHfwOze.js";import"./StatusDot-Cc34Nx7R.js";import"./process-tree-BV4Gc7wn.js";const{expect:M,within:Y}=__STORYBOOK_MODULE_TEST__,r=(e,R=12)=>I(K.filter(U=>U.tick<=R),"101:100",e),Ie={title:"Data/Traces/ProcessFacetTable",component:L,args:{facet:"openFiles",reading:r("openFiles")},decorators:[e=>m.jsx("div",{className:"max-w-3xl rounded-md border border-border p-density-3",children:m.jsx(e,{})})],parameters:{docs:{description:{component:"One facet of a process as the trace stored it, in a filterable table: the latest stored list of its open files, sockets, listening ports or connections (with the time that list was read), or the environment recorded on its `process_tree` node. Nothing is fetched."}}}},t={play:async({canvasElement:e})=>{await M(Y(e).getByText("/dev/null")).toBeInTheDocument()}},o={args:{facet:"sockets",reading:r("sockets",8)}},s={args:{facet:"ports",reading:r("ports")}},n={args:{facet:"connections",reading:r("connections",8)}},a={args:{facet:"sockets",reading:r("sockets",12)}},i={args:{reading:void 0}},c={args:{facet:"env",environment:A}},p={args:{facet:"env",error:"permission denied reading the environment of pid 102"}};var d,g,l;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
