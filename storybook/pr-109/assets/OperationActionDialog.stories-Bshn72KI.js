import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./OperationActionDialog-aeNr32yk.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{t(),r={path:`/api/v1/services/{name}/restart`,method:`post`,operation:{operationId:`restartService`,summary:`Restart service`,description:`Trigger a graceful restart of the named service. Useful for picking up rotated config.`,tags:[`services`],parameters:[{name:`name`,in:`path`,required:!0,description:`Service identifier`,schema:{type:`string`}},{name:`force`,in:`query`,description:`Skip the graceful drain step`,schema:{type:`boolean`,default:!1}}],responses:{202:{description:`Accepted`}}}},i={path:`/api/v1/widgets/{id}`,method:`delete`,operation:{operationId:`deleteWidget`,summary:`Delete widget`,description:`Permanently remove a widget. This is irreversible.`,tags:[`widgets`],parameters:[{name:`id`,in:`path`,required:!0,description:`Widget id`,schema:{type:`string`}}],responses:{204:{description:`Deleted`}}}},a={path:`/api/v1/clusters/{cluster}/nodes`,method:`post`,operation:{operationId:`provisionNode`,summary:`Provision node`,description:`Provision a new node in the cluster. Many parameters cover sizing, networking, and lifecycle.`,tags:[`clusters`],parameters:[{name:`cluster`,in:`path`,required:!0,description:`Cluster id`,schema:{type:`string`}},{name:`name`,in:`query`,required:!0,description:`Node name`,schema:{type:`string`}},{name:`instanceType`,in:`query`,description:`EC2 instance type`,schema:{type:`string`,default:`m6i.large`}},{name:`region`,in:`query`,description:`AWS region`,schema:{type:`string`,enum:[`us-east-1`,`us-west-2`,`eu-west-1`]}},{name:`az`,in:`query`,description:`Availability zone`,schema:{type:`string`}},{name:`diskGb`,in:`query`,description:`Root disk size in GB`,schema:{type:`integer`,default:100}},{name:`memoryGb`,in:`query`,description:`Memory in GB`,schema:{type:`integer`}},{name:`vcpus`,in:`query`,description:`Virtual CPUs`,schema:{type:`integer`}},{name:`spot`,in:`query`,description:`Use spot instances`,schema:{type:`boolean`,default:!1}},{name:`labels`,in:`query`,description:`Repeatable key=value labels`,schema:{type:`array`}},{name:`taints`,in:`query`,description:`Repeatable taints`,schema:{type:`array`}},{name:`ami`,in:`query`,description:`Custom AMI id`,schema:{type:`string`}},{name:`subnet`,in:`query`,description:`Subnet id`,schema:{type:`string`}},{name:`ttl`,in:`query`,description:`Auto-terminate after duration (e.g. 24h)`,schema:{type:`string`}}],responses:{202:{description:`Accepted`}}}},o={async getOpenAPISpec(){return{openapi:`3.0.0`,info:{title:`demo`,version:`0`},paths:{}}},async executeCommand(e,t,n){await new Promise(e=>setTimeout(e,600));let r=`${t.toUpperCase()} ${e} ${JSON.stringify(n)}`;return{success:!0,message:`Command accepted`,stdout:`Pretending to run:\n  ${r}\n\nResult: ok`,exit_code:0,cli:r,contentType:`text/plain`,input:{args:[],flags:n}}}},s={title:`Clicky-RPC/OperationActionDialog`,component:n,parameters:{docs:{description:{component:`Modal launcher used by clicky-rpc surfaces to execute an OpenAPI operation. These stories use a stubbed client that fakes a 600ms round-trip and returns a plain-text result.`}}}},c={args:{operation:r,client:o,initialValues:{name:`billing-api`},label:`Restart billing-api`}},l={args:{operation:i,client:o,initialValues:{id:`wgt_42`},label:`Delete wgt_42`}},u={args:{operation:a,client:o,initialValues:{cluster:`prod-eu`},label:`Provision node`}},d=[`ServiceAction`,`Destructive`,`ManyFields`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    operation: RESTART_OPERATION,
    client: FAKE_CLIENT,
    initialValues: {
      name: "billing-api"
    },
    label: "Restart billing-api"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    operation: DELETE_OPERATION,
    client: FAKE_CLIENT,
    initialValues: {
      id: "wgt_42"
    },
    label: "Delete wgt_42"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    operation: PROVISION_OPERATION,
    client: FAKE_CLIENT,
    initialValues: {
      cluster: "prod-eu"
    },
    label: "Provision node"
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{l as Destructive,u as ManyFields,c as ServiceAction,d as __namedExportsOrder,s as default};