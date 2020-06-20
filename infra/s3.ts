import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { User } from "./iam";
import { PolicyDocument } from "@pulumi/aws/iam";

export const createS3Bucket = (name: string, user: User) => {
  const bucket = new aws.s3.Bucket(name, { acl: "private" });

  new aws.s3.BucketPolicy(`${name}-policy`, {
    bucket: bucket.bucket,
    policy: pulumi.all([bucket.arn, user.arn]).apply(([bucketArn, userArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: userArn },
            Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            Resource: [`${bucketArn}/*`]
          }
        ]
      } as PolicyDocument)
    )
  });

  return bucket;
};
