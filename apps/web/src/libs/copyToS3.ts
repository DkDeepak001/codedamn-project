import { s3 } from "./s3";

type copyS3FolderType = {
  baseCodeUrl: string,
  projectName: string,
  userId: string
}


export const copyS3Folder = async ({ baseCodeUrl, projectName, userId }: copyS3FolderType) => {
  try {
    const initalPrefix = `${baseCodeUrl}`;
    const baseCode = await s3.listObjects({
      Prefix: initalPrefix,
      Bucket: process.env.AWS_BUCKET_NAME!
    }).promise()
    if (baseCode.Contents) {
      await Promise.all(baseCode.Contents.map(async (file) => {
        const desination = file.Key?.replace(initalPrefix, `code/${userId}/${projectName}`);
        await s3.copyObject({
          Bucket: process.env.AWS_BUCKET_NAME!,
          CopySource: `${process.env.AWS_BUCKET_NAME}/${file.Key}`!,
          Key: desination!,
        }).promise()
        console.log(`Copied ${file.Key} to ${desination}`);
      }))
      return `s3://${process.env.AWS_BUCKET_NAME}/code/${userId}/${projectName}`
    }

  } catch (error) {
    console.log(error)
  }
}

