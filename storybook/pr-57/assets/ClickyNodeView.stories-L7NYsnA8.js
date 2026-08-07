import{j as o}from"./iframe-D67R8bbl.js";import{a as b}from"./Clicky-D0RgpgsU.js";import{b as v}from"./Clicky.fixtures-DVhrZ9FN.js";import"./preload-helper-DOqJbnTS.js";import"./queryClient-oA7bqceF.js";import"./suspense-CSF7qThl.js";import"./useQuery-Dzc8SiVb.js";import"./FilterForm-CflEM87z.js";import"./button-B2bNDku0.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-DP1-eLX0.js";import"./TimeRange-Ab17F-yg.js";import"./floating-ui.react-BtRXUcG_.js";import"./index-C_dsp8ua.js";import"./index-oLIJbLP-.js";import"./Icon-00lqZtC6.js";import"./modalStack-C9QH0czZ.js";import"./zIndex-BGbNBNA8.js";import"./select-CdiVheQc.js";import"./FilterPill-sHOUOS6w.js";import"./types-BHfRQr8X.js";import"./DataTable-CaeoLlDX.js";import"./SortableHeader-DxNelsAH.js";import"./Modal-1Le8WqYW.js";import"./FilterBar-Duk6_79F.js";import"./Combobox-CeAjpFOD.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-kTuYkj_o.js";import"./MultiSelect-KOsHntV-.js";import"./RangeSlider-D2ibsQzf.js";import"./Timestamp-D-NcJsOp.js";import"./TagList-9QOGAv__.js";import"./Badge-CHwM5g8P.js";import"./HoverCard-CmT1a-0w.js";import"./Properties-CtT3PEHb.js";import"./IconButton-BuzR3ewI.js";import"./DropdownMenu-CDTUpdji.js";import"./DropdownMenuSubmenu-2o-p-5ar.js";import"./StatusDot-B10hZu0f.js";import"./Tree-OUiJW__0.js";import"./TreeNode-tbuSp1Aa.js";import"./ObjectGraph-BRa1u6ZT.js";import"./ExecutionTree-C_qhmmiv.js";import"./CodeBlock-CPSY-gS6.js";import"./CodeDiff-TZc5ReZ3.js";import"./SegmentedControl-CXLCk4s0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BbHOU84J.js";import"./RenderedStackTrace-B173wpFU.js";const f={kind:"text",children:[{kind:"badge",badgeLabel:"region",badgeValue:"us-east",badgeColor:"#0f766e"},{kind:"text",text:" "},{kind:"text",text:"cluster is accepting traffic"}]},ye={title:"Data/Clicky/NodeView",component:b,args:{node:f},parameters:{docs:{description:{component:"Lower-level Clicky renderer for a single node. Use it when the host already owns the surrounding document chrome and only needs to render one Clicky AST node."}}}},e={render:y=>o.jsx("div",{className:"rounded-md border border-border bg-background p-density-3",children:o.jsx(b,{...y})})},t={args:{node:{kind:"code",language:"json",source:JSON.stringify({requests:12492,errors:3},null,2)}}},n={args:{node:v}},r={args:{node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}}};var i,a,d;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="rounded-md border border-border bg-background p-density-3">
      <ClickyNodeView {...args} />
    </div>
}`,...(d=(a=e.parameters)==null?void 0:a.docs)==null?void 0:d.source}}};var s,m,p;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    node: {
      kind: "code",
      language: "json",
      source: JSON.stringify({
        requests: 12492,
        errors: 3
      }, null, 2)
    }
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var c,l,k;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    node: clickyMarkdownBlocksNode
  }
}`,...(k=(l=n.parameters)==null?void 0:l.docs)==null?void 0:k.source}}};var x,u,g;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    node: {
      kind: "list",
      unstyled: true,
      items: [{
        kind: "admonition",
        severity: "note",
        label: {
          kind: "text",
          text: "Note"
        },
        content: {
          kind: "text",
          text: "Board approval is tracked separately."
        }
      }, {
        kind: "admonition",
        severity: "info",
        label: {
          kind: "text",
          text: "Information"
        },
        content: {
          kind: "text",
          text: "Comparatives use the prior reporting pack."
        }
      }, {
        kind: "admonition",
        severity: "tip",
        label: {
          kind: "text",
          text: "Tip"
        },
        content: {
          kind: "text",
          text: "Attach the signed trial balance before export."
        }
      }, {
        kind: "admonition",
        severity: "warning",
        label: {
          kind: "text",
          text: "Warning"
        },
        content: {
          kind: "text",
          text: "Manual review is required for this note."
        }
      }, {
        kind: "admonition",
        severity: "danger",
        label: {
          kind: "text",
          text: "Danger"
        },
        content: {
          kind: "text",
          text: "Publication is blocked until cash reconciles."
        }
      }]
    }
  }
}`,...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const ve=["Default","CodeNode","MarkdownBlocks","AdmonitionSeverities"];export{r as AdmonitionSeverities,t as CodeNode,e as Default,n as MarkdownBlocks,ve as __namedExportsOrder,ye as default};
