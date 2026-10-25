import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./CommandForm-D98dGuwt.js";var r,i,a,o,s,c,l;function u(){return(u=e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i=[{name:`name`,in:`query`,required:!0,description:`Service name`,schema:{type:`string`}},{name:`force`,in:`query`,description:`Skip drain`,schema:{type:`boolean`}}],a=[{name:`cluster`,in:`path`,required:!0,description:`Cluster id`,schema:{type:`string`}},{name:`name`,in:`query`,required:!0,description:`Node name`,schema:{type:`string`}},{name:`instanceType`,in:`query`,description:`EC2 instance type`,schema:{type:`string`,default:`m6i.large`}},{name:`region`,in:`query`,description:`AWS region`,schema:{type:`string`,enum:[`us-east-1`,`us-west-2`,`eu-west-1`]}},{name:`az`,in:`query`,description:`Availability zone`,schema:{type:`string`}},{name:`diskGb`,in:`query`,description:`Root disk size in GB`,schema:{type:`integer`,default:100}},{name:`memoryGb`,in:`query`,description:`Memory in GB`,schema:{type:`integer`}},{name:`vcpus`,in:`query`,description:`Virtual CPUs`,schema:{type:`integer`}},{name:`spot`,in:`query`,description:`Use spot instances`,schema:{type:`boolean`,default:!1}},{name:`labels`,in:`query`,description:`Repeatable key=value labels`,schema:{type:`array`}},{name:`taints`,in:`query`,description:`Repeatable taints`,schema:{type:`array`}},{name:`ami`,in:`query`,description:`Custom AMI id`,schema:{type:`string`}},{name:`subnet`,in:`query`,description:`Subnet id`,schema:{type:`string`}},{name:`ttl`,in:`query`,description:`Auto-terminate after duration (e.g. 24h)`,schema:{type:`string`}}],o={title:`Clicky-RPC/CommandForm`,component:n,parameters:{docs:{description:{component:`Renders an OpenAPI operation's parameters as a form. It switches from a stacked layout (label above the input) to an inline layout (label beside the input) once there are 6 or more visible fields.`}}}},s={args:{parameters:i,onExecute:r(),isPending:!1,method:`post`,path:`/api/v1/services/{name}/restart`,accept:`application/json`}},c={args:{parameters:a,onExecute:r(),isPending:!1,method:`post`,path:`/api/v1/clusters/{cluster}/nodes`,accept:`application/json`}},l=[`StackedLayout`,`InlineLayout`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    parameters: FEW_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/services/{name}/restart",
    accept: "application/json"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    parameters: MANY_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/clusters/{cluster}/nodes",
    accept: "application/json"
  }
}`,...c.parameters?.docs?.source}}}})))()}u();export{c as InlineLayout,s as StackedLayout,l as __namedExportsOrder,o as default};