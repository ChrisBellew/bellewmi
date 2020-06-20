import * as awsx from "@pulumi/awsx";

// export const vpc = new awsx.ec2.Vpc("bellewmi", {
//   numberOfAvailabilityZones: 2,
//   subnets: [{ type: "public", name: "public" }, { type: "private", name: "app" }, { type: "isolated", name: "db" }]
// });

// export const publicSubnetIds = vpc.publicSubnetIds;
// export const appSubnetIds = vpc.privateSubnetIds;
// export const dbSubnetIds = vpc.isolatedSubnetIds;

export const vpc = new awsx.ec2.Vpc("bellewmi", {
  numberOfAvailabilityZones: 2,
  subnets: [
    { type: "public", name: "public" },
    { type: "private", name: "app" },
    { type: "isolated", name: "db" }
  ]
});

export const getDatabaseAvailabilityZones = () => {
  // This didnt used to be a promise?
  return vpc.getSubnets("isolated").map(x => x.subnet.availabilityZoneId);
};
