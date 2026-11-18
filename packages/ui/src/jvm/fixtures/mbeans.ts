import type { MBeanAttributeValue, MBeanInfo } from "../protocol/types";

export const MBEAN_NAMES = [
  "java.lang:type=Memory",
  "java.lang:type=Runtime",
  "java.lang:name=G1 Young Generation,type=GarbageCollector",
  "java.nio:name=direct,type=BufferPool",
  "java.util.logging:type=Logging",
  'Catalina:name="http-nio-8080",type=GlobalRequestProcessor',
  "Catalina:context=/orders,host=localhost,type=Loader",
  "acme.cache:name=orders,type=Cache",
];

export const CACHE_MBEAN: MBeanInfo = {
  objectName: "acme.cache:name=orders,type=Cache",
  className: "com.example.cache.CacheMBeanImpl",
  description: "Order lookup cache",
  attributes: [
    { name: "Size", type: "long", description: "Entries currently cached", readable: true, writable: false },
    { name: "MaxEntries", type: "int", description: "Eviction threshold", readable: true, writable: true },
    { name: "Enabled", type: "boolean", readable: true, writable: true },
    { name: "EvictedBytes", type: "long", readable: true, writable: false },
    { name: "Settings", type: "javax.management.openmbean.CompositeData", readable: true, writable: true },
    { name: "Password", type: "java.lang.String", readable: false, writable: true },
  ],
  operations: [
    { name: "clear", returnType: "void", description: "Drop every entry", impact: 1, signature: [] },
    {
      name: "lookup",
      returnType: "java.lang.String",
      impact: 0,
      signature: [
        { name: "key", type: "java.lang.String", description: "Order id" },
        { name: "refresh", type: "boolean" },
      ],
    },
  ],
  notifications: [{ name: "javax.management.AttributeChangeNotification", types: ["jmx.attribute.change"] }],
};

export const CACHE_VALUES: MBeanAttributeValue[] = [
  { name: "Size", value: 1204 },
  { name: "MaxEntries", value: 5000 },
  { name: "Enabled", value: true },
  { name: "EvictedBytes", value: 3_145_728 },
  { name: "Settings", value: { ttlSeconds: 300, policy: "LRU" } },
];

export function genericMBeanInfo(objectName: string): MBeanInfo {
  return {
    objectName,
    className: "javax.management.StandardMBean",
    attributes: [{ name: "Uptime", type: "long", readable: true, writable: false }],
    operations: [],
    notifications: [],
  };
}

