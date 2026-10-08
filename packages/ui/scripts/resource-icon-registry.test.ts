import { describe, expect, it } from "vitest";
import {
  iconsByConsumerName,
  UiCloudVm,
  UiCloudVmAws,
  UiKubePod,
  UiKubePodOctagon,
} from "../src/icons";

describe("resource icon registry", () => {
  it("keeps bare icons and composed variants at distinct runtime names", () => {
    expect({
      vm: iconsByConsumerName["cloud-vm"],
      awsVm: iconsByConsumerName["cloud-vm-aws"],
      pod: iconsByConsumerName["kube-pod"],
      octagonPod: iconsByConsumerName["kube-pod-octagon"],
    }).toEqual({
      vm: UiCloudVm,
      awsVm: UiCloudVmAws,
      pod: UiKubePod,
      octagonPod: UiKubePodOctagon,
    });
  });
});
