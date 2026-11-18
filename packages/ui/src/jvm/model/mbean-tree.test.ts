import { describe, expect, it } from "vitest";
import { buildMBeanBrowserTree, parseObjectName } from "./mbean-tree";

const RESOURCE =
  'Catalina:class=javax.sql.DataSource,context=/orders,host=localhost,name="ORDERSDS",resourcetype=Context,type=Resource';
const DATA_SOURCE = 'Catalina:class=javax.sql.DataSource,context=/orders,host=localhost,name="ORDERSDS",type=DataSource';

describe("buildMBeanBrowserTree", () => {
  it("groups by domain and type property, using name as the leaf label", () => {
    expect(
      buildMBeanBrowserTree([
        "openejb.management:DataSource=ORDERSDS,ObjectType=datasources",
        RESOURCE,
        "openejb.management:J2EEApplication=<empty>,J2EEServer=openejb,j2eeType=Resource,name=Billing.Out",
        DATA_SOURCE,
        'TopLink:Name="Session(primary,readonly)",Type=Configuration',
        "acme.jmx:name=notificationPublisher",
      ]),
    ).toEqual([
      {
        domain: "acme.jmx",
        count: 1,
        types: [{ type: "Untyped", mbeans: [{ objectName: "acme.jmx:name=notificationPublisher", label: "notificationPublisher", metadata: "" }] }],
      },
      {
        domain: "Catalina",
        count: 2,
        types: [
          {
            type: "DataSource",
            mbeans: [{ objectName: DATA_SOURCE, label: "ORDERSDS", metadata: "class=javax.sql.DataSource, context=/orders, host=localhost" }],
          },
          {
            type: "Resource",
            mbeans: [
              {
                objectName: RESOURCE,
                label: "ORDERSDS",
                metadata: "class=javax.sql.DataSource, context=/orders, host=localhost, resourcetype=Context",
              },
            ],
          },
        ],
      },
      {
        domain: "openejb.management",
        count: 2,
        types: [
          {
            type: "datasources",
            mbeans: [{ objectName: "openejb.management:DataSource=ORDERSDS,ObjectType=datasources", label: "ORDERSDS", metadata: "" }],
          },
          {
            type: "Resource",
            mbeans: [
              {
                objectName: "openejb.management:J2EEApplication=<empty>,J2EEServer=openejb,j2eeType=Resource,name=Billing.Out",
                label: "Billing.Out",
                metadata: "J2EEApplication=<empty>, J2EEServer=openejb",
              },
            ],
          },
        ],
      },
      {
        domain: "TopLink",
        count: 1,
        types: [
          {
            type: "Configuration",
            mbeans: [{ objectName: 'TopLink:Name="Session(primary,readonly)",Type=Configuration', label: "Session(primary,readonly)", metadata: "" }],
          },
        ],
      },
    ]);
  });

  it("falls back to the first remaining property without repeating it in metadata", () => {
    expect(buildMBeanBrowserTree(["java.lang:type=Memory", "Catalina:context=/orders,host=localhost,type=Loader"])).toEqual([
      {
        domain: "Catalina",
        count: 1,
        types: [
          { type: "Loader", mbeans: [{ objectName: "Catalina:context=/orders,host=localhost,type=Loader", label: "/orders", metadata: "host=localhost" }] },
        ],
      },
      { domain: "java.lang", count: 1, types: [{ type: "Memory", mbeans: [{ objectName: "java.lang:type=Memory", label: "Memory", metadata: "" }] }] },
    ]);
  });

  it("sorts untyped MBeans after typed ones within a domain", () => {
    const [domain] = buildMBeanBrowserTree(["acme:name=b", "acme:type=Zeta,name=z", "acme:type=Alpha,name=a"]);
    expect(domain?.types.map((group) => group.type)).toEqual(["Alpha", "Zeta", "Untyped"]);
  });

  it("rejects malformed ObjectNames instead of dropping them", () => {
    expect(() => buildMBeanBrowserTree(["missing-colon"])).toThrow('Invalid MBean ObjectName "missing-colon": expected domain:key=value');
    expect(() => buildMBeanBrowserTree(["acme:"])).toThrow("expected domain:key=value");
    expect(() => buildMBeanBrowserTree(["acme:novalue"])).toThrow("expected key=value property");
    expect(() => buildMBeanBrowserTree(['acme:name="unterminated,type=Worker'])).toThrow("unterminated quoted value");
  });
});

describe("parseObjectName", () => {
  it("keeps commas and escaped quotes inside quoted values", () => {
    expect(parseObjectName('acme:name="a,b \\"c\\"",type=Pool')).toEqual({
      domain: "acme",
      properties: [
        { key: "name", value: '"a,b \\"c\\""', raw: 'name="a,b \\"c\\""' },
        { key: "type", value: "Pool", raw: "type=Pool" },
      ],
    });
  });
});
