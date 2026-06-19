import{C as c}from"./CommandForm-5Sz0Jwqy.js";import"./iframe-CmW1bXIL.js";import"./preload-helper-ByUaG9M2.js";import"./button-Cbf2D1Lj.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./Icon-DgKWNfUH.js";import"./types-BHfRQr8X.js";import"./UiClose-BWsNrAoC.js";const{fn:p}=__STORYBOOK_MODULE_TEST__,m=[{name:"name",in:"query",required:!0,description:"Service name",schema:{type:"string"}},{name:"force",in:"query",description:"Skip drain",schema:{type:"boolean"}}],u=[{name:"cluster",in:"path",required:!0,description:"Cluster id",schema:{type:"string"}},{name:"name",in:"query",required:!0,description:"Node name",schema:{type:"string"}},{name:"instanceType",in:"query",description:"EC2 instance type",schema:{type:"string",default:"m6i.large"}},{name:"region",in:"query",description:"AWS region",schema:{type:"string",enum:["us-east-1","us-west-2","eu-west-1"]}},{name:"az",in:"query",description:"Availability zone",schema:{type:"string"}},{name:"diskGb",in:"query",description:"Root disk size in GB",schema:{type:"integer",default:100}},{name:"memoryGb",in:"query",description:"Memory in GB",schema:{type:"integer"}},{name:"vcpus",in:"query",description:"Virtual CPUs",schema:{type:"integer"}},{name:"spot",in:"query",description:"Use spot instances",schema:{type:"boolean",default:!1}},{name:"labels",in:"query",description:"Repeatable key=value labels",schema:{type:"array"}},{name:"taints",in:"query",description:"Repeatable taints",schema:{type:"array"}},{name:"ami",in:"query",description:"Custom AMI id",schema:{type:"string"}},{name:"subnet",in:"query",description:"Subnet id",schema:{type:"string"}},{name:"ttl",in:"query",description:"Auto-terminate after duration (e.g. 24h)",schema:{type:"string"}}],R={title:"Clicky-RPC/CommandForm",component:c,parameters:{docs:{description:{component:"Renders an OpenAPI operation's parameters as a form. It switches from a stacked layout (label above the input) to an inline layout (label beside the input) once there are 6 or more visible fields."}}}},e={args:{parameters:m,onExecute:p(),isPending:!1,method:"post",path:"/api/v1/services/{name}/restart",accept:"application/json"}},t={args:{parameters:u,onExecute:p(),isPending:!1,method:"post",path:"/api/v1/clusters/{cluster}/nodes",accept:"application/json"}};var n,a,r;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    parameters: FEW_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/services/{name}/restart",
    accept: "application/json"
  }
}`,...(r=(a=e.parameters)==null?void 0:a.docs)==null?void 0:r.source}}};var s,i,o;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    parameters: MANY_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/clusters/{cluster}/nodes",
    accept: "application/json"
  }
}`,...(o=(i=t.parameters)==null?void 0:i.docs)==null?void 0:o.source}}};const S=["StackedLayout","InlineLayout"];export{t as InlineLayout,e as StackedLayout,S as __namedExportsOrder,R as default};
