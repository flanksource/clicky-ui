import{j as f}from"./iframe-3PyLJ2TM.js";import{J as oe}from"./JsonView-B5WpSyQF.js";import"./preload-helper-BCNcasCO.js";import"./button-DwXbKSmw.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CSw9PWsW.js";import"./AccordionList-B0Y1Qj5k.js";import"./collections-CoHfwOze.js";import"./Icon-BZD3ke3N.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DlFZ3fZf.js";const s=100,S=100,b=JSON.stringify({totalRecords:s*S,batches:Object.fromEntries(Array.from({length:S},(y,h)=>[`batch-${String(h).padStart(3,"0")}`,{recordCount:s,records:Array.from({length:s},(me,ne)=>{const r=h*s+ne;return{id:`record-${String(r).padStart(5,"0")}`,service:r%2===0?"api":"worker",enabled:r%5!==0,durationMs:r*13%900,tags:["example",`batch-${h}`],description:`Record ${r} completed its scheduled work and reported its current health. `.repeat(4)}})}]))}),ce=`{
  "requestId": "run-0042",
  "service": {
    "name": "api",
    "metrics": { "ready": true, "requests": 128, "latencyMs":`,ie=`{
  "service": "api",
  "ports": [8080, 9090, { "name": "metrics", "port":`,de=`{
  "service": "worker",
  "enabled": true,
  "message": "The worker was processing a record when`,pe=['{"timestamp":"2026-01-01T09:00:00Z","service":"api","status":"healthy","requests":128}','{"timestamp":"2026-01-01T09:00:01Z","service":"worker","status":"healthy","jobs":42}','{"timestamp":"2026-01-01T09:00:02Z","service":"scheduler","status":"running","message":"Job started but the connection'].join(`
`),Te={title:"Data/JsonView",component:oe,args:{defaultOpenDepth:2,format:"yaml"},argTypes:{data:{description:"Parsed value to display. Mutually exclusive with source; strings remain literal values."},source:{control:"text",description:"Raw JSON or NDJSON text. Mutually exclusive with data; interrupted input retains completed values.",table:{type:{summary:"string"}}},inputFormat:{description:"Encoding of source: one JSON document or one JSON value per nonempty NDJSON line. Defaults to json.",control:"inline-radio",options:["json","ndjson"],table:{type:{summary:'"json" | "ndjson"'},defaultValue:{summary:"json"}}},format:{description:"Display syntax, independent of inputFormat. Defaults to YAML; JSON uses braces and quoted strings.",control:"inline-radio",options:["yaml","json"],table:{type:{summary:'"yaml" | "json"'},defaultValue:{summary:"yaml"}}},density:{description:"Override the inherited application density with compact, comfortable, or spacious rows.",control:"select",options:["compact","comfortable","spacious"],table:{type:{summary:'"compact" | "comfortable" | "spacious"'},defaultValue:{summary:"Inherited"}}}},parameters:{docs:{description:{component:'Collapsible structured-data viewer with YAML as the default format. Pass a parsed value with data, or raw text with source and inputFormat="json" or "ndjson". Cut-off input shows completed values with an incomplete warning; malformed syntax shows a diagnostic. NDJSON keeps complete records in order, ignores blank lines, and labels an incomplete final record separately. Original source stays inspectable. Set format="json" for braces and quoted strings. Density follows the application or Storybook toolbar; the density prop overrides it for one viewer.'}}}},e={args:{name:"config",data:{name:"scraper",enabled:!0,retries:3,tags:["alpha","beta"],owner:null,metadata:{created:"2026-01-01",stats:{runs:42,failures:2}}}}},t={args:{data:{a:{b:{c:{d:{e:"deep"}}}}},defaultOpenDepth:3}},a={args:{data:{obj:{},arr:[]}}},n={args:{...e.args,format:"json"}},o={args:{...e.args,density:"compact"}},c={args:{...e.args,density:"comfortable"}},i={args:{...e.args,density:"spacious"}},d={args:{defaultOpenDepth:4,data:{strings:["true","null","42","","a: b",`first
second`],"special: key":"safely quoted",services:[{name:"api",ports:[8080,9090]},{name:"worker",ports:[]}]}}},p={args:{source:b,defaultOpenDepth:1},argTypes:{source:{control:!1}},decorators:[y=>f.jsx("div",{className:"h-[32rem] overflow-auto",children:f.jsx(y,{})})],parameters:{docs:{description:{story:`10,000 deterministic records in 100 batches, ${(b.length/1024/1024).toFixed(1)} MiB of raw JSON. Expand batches, then a batch and its records. All records are retained; only expanded branches mount their children.`},source:{code:"<JsonView source={largeJsonSource} defaultOpenDepth={1} />"}}}},m={args:{source:ce,defaultOpenDepth:4},parameters:{docs:{description:{story:"The document ends inside a nested object. Completed metrics remain visible; the pending latency value is omitted. Open Original source to inspect the exact cut-off text."}}}},u={args:{source:ie,defaultOpenDepth:4},parameters:{docs:{description:{story:"The document ends inside an array item. Completed ports and the final item's completed name remain inspectable."}}}},l={args:{source:de},parameters:{docs:{description:{story:"The document ends inside a string. The unfinished message is omitted rather than presented as a completed value."}}}},g={name:"NDJSON",args:{source:pe,inputFormat:"ndjson",defaultOpenDepth:3},parameters:{docs:{description:{story:"Two complete log records followed by an interrupted third record. Completed records retain their order; recovered fields from line 3 are shown separately with an incomplete label."}}}};var w,O,v;e.parameters={...e.parameters,docs:{...(w=e.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    name: "config",
    data: {
      name: "scraper",
      enabled: true,
      retries: 3,
      tags: ["alpha", "beta"],
      owner: null,
      metadata: {
        created: "2026-01-01",
        stats: {
          runs: 42,
          failures: 2
        }
      }
    }
  }
}`,...(v=(O=e.parameters)==null?void 0:O.docs)==null?void 0:v.source}}};var j,T,x;t.parameters={...t.parameters,docs:{...(j=t.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    data: {
      a: {
        b: {
          c: {
            d: {
              e: "deep"
            }
          }
        }
      }
    },
    defaultOpenDepth: 3
  }
}`,...(x=(T=t.parameters)==null?void 0:T.docs)==null?void 0:x.source}}};var J,D,N;a.parameters={...a.parameters,docs:{...(J=a.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    data: {
      obj: {},
      arr: []
    }
  }
}`,...(N=(D=a.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var C,A,M;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    format: "json"
  }
}`,...(M=(A=n.parameters)==null?void 0:A.docs)==null?void 0:M.source}}};var k,E,q;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "compact"
  }
}`,...(q=(E=o.parameters)==null?void 0:E.docs)==null?void 0:q.source}}};var V,F,R;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "comfortable"
  }
}`,...(R=(F=c.parameters)==null?void 0:F.docs)==null?void 0:R.source}}};var _,$,B;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "spacious"
  }
}`,...(B=($=i.parameters)==null?void 0:$.docs)==null?void 0:B.source}}};var L,Y,P;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    defaultOpenDepth: 4,
    data: {
      strings: ["true", "null", "42", "", "a: b", "first\\nsecond"],
      "special: key": "safely quoted",
      services: [{
        name: "api",
        ports: [8080, 9090]
      }, {
        name: "worker",
        ports: []
      }]
    }
  }
}`,...(P=(Y=d.parameters)==null?void 0:Y.docs)==null?void 0:P.source}}};var Z,H,I;p.parameters={...p.parameters,docs:{...(Z=p.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    source: largeJsonSource,
    defaultOpenDepth: 1
  },
  argTypes: {
    source: {
      control: false
    }
  },
  decorators: [Story => <div className="h-[32rem] overflow-auto">
        <Story />
      </div>],
  parameters: {
    docs: {
      description: {
        story: \`10,000 deterministic records in 100 batches, \${(largeJsonSource.length / 1024 / 1024).toFixed(1)} MiB of raw JSON. Expand batches, then a batch and its records. All records are retained; only expanded branches mount their children.\`
      },
      source: {
        code: "<JsonView source={largeJsonSource} defaultOpenDepth={1} />"
      }
    }
  }
}`,...(I=(H=p.parameters)==null?void 0:H.docs)==null?void 0:I.source}}};var U,z,G;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    source: truncatedObjectSource,
    defaultOpenDepth: 4
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside a nested object. Completed metrics remain visible; the pending latency value is omitted. Open Original source to inspect the exact cut-off text."
      }
    }
  }
}`,...(G=(z=m.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var K,Q,W;u.parameters={...u.parameters,docs:{...(K=u.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    source: truncatedArraySource,
    defaultOpenDepth: 4
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside an array item. Completed ports and the final item's completed name remain inspectable."
      }
    }
  }
}`,...(W=(Q=u.parameters)==null?void 0:Q.docs)==null?void 0:W.source}}};var X,ee,re;l.parameters={...l.parameters,docs:{...(X=l.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    source: truncatedStringSource
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside a string. The unfinished message is omitted rather than presented as a completed value."
      }
    }
  }
}`,...(re=(ee=l.parameters)==null?void 0:ee.docs)==null?void 0:re.source}}};var se,te,ae;g.parameters={...g.parameters,docs:{...(se=g.parameters)==null?void 0:se.docs,source:{originalSource:`{
  name: "NDJSON",
  args: {
    source: ndjsonSource,
    inputFormat: "ndjson",
    defaultOpenDepth: 3
  },
  parameters: {
    docs: {
      description: {
        story: "Two complete log records followed by an interrupted third record. Completed records retain their order; recovered fields from line 3 are shown separately with an incomplete label."
      }
    }
  }
}`,...(ae=(te=g.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};const xe=["MixedTypes","DeepNested","EmptyContainers","Json","Compact","Comfortable","Spacious","YamlStringsAndSequences","VeryLargeJson","TruncatedJson","TruncatedArray","TruncatedString","Ndjson"];export{c as Comfortable,o as Compact,t as DeepNested,a as EmptyContainers,n as Json,e as MixedTypes,g as Ndjson,i as Spacious,u as TruncatedArray,m as TruncatedJson,l as TruncatedString,p as VeryLargeJson,d as YamlStringsAndSequences,xe as __namedExportsOrder,Te as default};
