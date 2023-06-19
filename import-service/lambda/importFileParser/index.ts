import { S3Event } from 'aws-lambda';
import * as csvParser from 'csv-parser';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const importFileParser = async (event: S3Event): Promise<void> => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  const s3Stream = s3
    .getObject({
      Bucket: bucketName,
      Key: objectKey,
    })
    .createReadStream();

  s3Stream
    .pipe(csvParser())
    .on('data', (data: any) => {
      console.log('Record:', data);
    })
    .on('error', (error: any) => {
      console.error('Error:', error);
    })
    .on('end', async () => {
      try {
        await s3
          .copyObject({
            Bucket: bucketName,
            CopySource: `${bucketName}/${objectKey}`,
            Key: objectKey.replace('uploaded', 'parsed'),
          })
          .promise();

        await s3
          .deleteObject({
            Bucket: bucketName,
            Key: objectKey,
          })
          .promise();
      } catch (error) {
        console.error('Error while moving the file:', error);
      }
    });
};
