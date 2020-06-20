// import * as pulumi from "@pulumi/pulumi";
// import * as aws from "@pulumi/aws";
// import * as awsx from "@pulumi/awsx";
import { apiUrl } from "./api/infra";
import { portalUrl } from "./portal/infra";

// Create an AWS resource (S3 Bucket)
// const bucket = new aws.s3.Bucket("my-bucket");

// // Export the name of the bucket
// export const bucketName = bucket.id;

export default { apiUrl, portalUrl };
