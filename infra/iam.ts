import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PolicyDocument } from "@pulumi/aws/iam";

export type User = ReturnType<typeof createUser>;

export const createUser = (name: string) => {
  const user = new aws.iam.User(name);
  const accessKey = new aws.iam.AccessKey(name, {
    user: user.name
  });

  const policy = new aws.iam.Policy(name, {
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["s3:ListAllMyBuckets"],
          Resource: ["arn:aws:s3:::*"]
        }
      ]
    } as PolicyDocument)
  });

  new aws.iam.PolicyAttachment(name, { users: [user], policyArn: policy.arn });

  const secret = new aws.secretsmanager.Secret(name);
  new aws.secretsmanager.SecretVersion(name, {
    secretId: secret.id,
    secretString: pulumi.all([accessKey.id, accessKey.secret]).apply(([accessKeyId, secretAccessKey]) =>
      JSON.stringify({
        accessKeyId,
        secretAccessKey
      })
    )
  });

  return pulumi
    .all([user.arn, accessKey.id, accessKey.secret])
    .apply(([arn, accessKeyId, secretAccessKey]) => ({ arn, accessKeyId, secretAccessKey }));
};
