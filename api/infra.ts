import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";
import { vpc, getDatabaseAvailabilityZones } from "../infra/vpc";
import { cluster, repository } from "../infra/ecs";

const image = repository.buildAndPushImage("./api");

const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer("api-loadbalancer", {
  vpc,
  external: true,
  securityGroups: cluster.securityGroups
});
const port = 3001;

const web = alb.createListener("api", {
  port,
  protocol: "HTTPS",
  certificateArn: "arn:aws:acm:ap-southeast-2:628893746801:certificate/168c0194-e596-43ec-99a2-de9626453df7",
  external: true,
  targetGroup: alb.createTargetGroup("api-targets", {
    vpc,
    targetType: "ip",
    port: 3001,
    protocol: "HTTP"
  })
});

new awsx.ecs.FargateService("api", {
  cluster,
  taskDefinitionArgs: {
    cpu: "1024",
    memory: "2048",
    container: {
      image,
      portMappings: [web]
    }
  },
  desiredCount: 1
});

export const apiUrl = web.endpoint.hostname.apply(host => `http://${host}:${port}`);

const passwordGenerator = new random.RandomPassword("databaseAdminPassword", {
  length: 16,
  overrideSpecial: "_%@",
  special: true
});

const databaseAdminUsername = "admin";
const databaseAdminPassword = new aws.secretsmanager.SecretVersion("database-admin-password", {
  secretId: "database-admin-password",
  secretString: passwordGenerator.result
});

const databaseAvailabilityZones = getDatabaseAvailabilityZones();

const db = new aws.rds.Cluster("bellewmi-db", {
  availabilityZones: databaseAvailabilityZones,
  backupRetentionPeriod: 300,
  clusterIdentifier: "bellewmi-db",
  databaseName: "bellewmi",
  engine: "aurora-postgresql",
  masterUsername: databaseAdminUsername,
  masterPassword: passwordGenerator.result,
  storageEncrypted: true
});

const [masterAz, otherAzs] = databaseAvailabilityZones;
const defaultInstance = new aws.rds.Instance("default", {
  allocatedStorage: 20,
  engine: "aurora-postgresql",
  engineVersion: "11.4",
  instanceClass: "db.t2.micro",
  name: "bellewmi-db-" + masterAz,
  password: passwordGenerator.result,
  storageType: "gp2",
  username: databaseAdminUsername
});

databaseAvailabilityZones.map(az => {
  const defaultInstance = new aws.rds.Instance("default", {
    allocatedStorage: 20,
    engine: "mysql",
    engineVersion: "5.7",
    instanceClass: "db.t2.micro",
    name: "mydb",
    parameterGroupName: "default.mysql5.7",
    password: "foobarbaz",
    storageType: "gp2",
    username: "foo"
  });
});
