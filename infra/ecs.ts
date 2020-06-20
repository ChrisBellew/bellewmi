import * as awsx from "@pulumi/awsx";
import { vpc } from "./vpc";

export const repository = new awsx.ecr.Repository("bellewmi");

export const cluster = new awsx.ecs.Cluster("cluster", { vpc });
