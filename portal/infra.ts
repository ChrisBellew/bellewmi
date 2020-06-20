import * as awsx from "@pulumi/awsx";
import { vpc } from "../infra/vpc";
import { cluster, repository } from "../infra/ecs";

const image = repository.buildAndPushImage("./portal");

const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer("portal-loadbalancer", {
  vpc,
  external: true,
  securityGroups: cluster.securityGroups
});
const port = 80;

const web = alb.createListener("portal", {
  port,
  protocol: "HTTP",
  external: true
});

new awsx.ecs.FargateService("portal", {
  cluster,
  taskDefinitionArgs: {
    cpu: "256",
    memory: "512",
    container: {
      image,
      portMappings: [web]
    }
  },
  desiredCount: 1
});

export const portalUrl = web.endpoint.hostname.apply(host => `http://${host}:${port}`);
