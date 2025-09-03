const { GetObjectCommand,S3Client } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');
// Configure AWS SDK
// AWS.config.update({
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   region: process.env.BUCKET_REGION,
// });
s3 = new S3Client({
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
});
module.exports = {
 getBase64Image : async (keys) => {
    try {
      console.log('keys',keys)
    
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: keys,
      });
  
      const response = await s3.send(command);

      if (!response.Body) {
        throw new Error(`S3 response.Body is null. Key: ${keys}`);
      }
  
      // Convert ReadableStream to Buffer
      const streamToBuffer = async (stream) => {
        return new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        });
      };
  
      const buffer = await streamToBuffer(response.Body);
  
      // Convert buffer to Base64
      const base64Image = buffer.toString("base64");
  
      // Construct Data URI (optional)
      const mimeType = response.ContentType;

      return {
        // id: id,
        base64: `data:${mimeType};base64,${base64Image}`,
      };
        
      } catch (error) {
        console.error('Error fetching the image from S3:', error);
        throw error;
      }
}
}