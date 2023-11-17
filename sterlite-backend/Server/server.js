// require("dotenv").config();
// const express = require('express');
// const app = express();
// const cors = require('cors');
// const port = 7000;
// const { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand ,ListObjectsV2Command} = require("@aws-sdk/client-s3");
// // const { fromIni } = require("@aws-sdk/credential-provider-ini");

// // Initialize the S3 client
// const s3Client = new S3Client(
//   {
//     region: "ap-south-1",
//     credentials: {
//       accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
//       secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
//     },
//   } // Use your profile name or specify credentials directly
// );

// // Enable CORS and Express middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Code to post an image to the S3 bucket
// app.post("/copyImage", async (req, res) => {
//   try {
//     const { defect, identifier } = req.body;

//     const bucketName = 'cvsterlite';
//     const fileName = identifier.split('/').pop();
//     const identifierArray = identifier.split('/');
//     const identifierJetson = identifierArray[identifierArray.length - 4];
//     const identifierDate = identifierArray[identifierArray.length - 3];

//     const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
//     const targetKey = `Sterlite_Deployment/Seggregation/${defect}/${identifierJetson}/${identifierDate}/${fileName}`;

//     const copyParams = {
//       Bucket: bucketName,
//       CopySource: `${bucketName}/${sourceKey}`,
//       Key: targetKey,
//     };

//     await s3Client.send(new CopyObjectCommand(copyParams));

//     res.status(200).json({ message: "Image copied successfully" });
//   } catch (error) {
//     console.error("Error copying image", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Code to move and delete an image
// app.post("/moveAndDeleteImage", async (req, res) => {
//   try {
//     const { identifier } = req.body;
//     const bucketName = 'cvsterlite';
//     const fileName = identifier.split('/').pop();
//     const identifierArray = identifier.split('/');
//     const identifierJetson = identifierArray[identifierArray.length - 4];
//     const identifierDate = identifierArray[identifierArray.length - 3];

//     // Construct the sourceKey and targetKey for copying
//     const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
//     const targetKey = `Sterlite_Deployment/Seggregation/Deleted/${identifierJetson}/${identifierDate}/${fileName}`;

//     // Copy the image from the source to the deleted folder
//     const copyParams = {
//       Bucket: bucketName,
//       CopySource: `${bucketName}/${sourceKey}`,
//       Key: targetKey,
//     };

//     await s3Client.send(new CopyObjectCommand(copyParams));

//     // Delete the image from the source folder
//     const deleteParams = {
//       Bucket: bucketName,
//       Key: sourceKey,
//     };

//     await s3Client.send(new DeleteObjectCommand(deleteParams));

//     res.status(200).json({ message: "Image moved and deleted successfully" });
//   } catch (error) {
//     console.error("Error moving and deleting image", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Code to delete an image
// app.delete("/deleteImage/:identifier", async (req, res) => {
//   try {
//     const identifier = req.params.identifier;
//     const bucketName = 'cvsterlite';
//     const fileName = identifier.split('/').pop();
//     const identifierArray = identifier.split('/');
//     const identifierJetson = identifierArray[identifierArray.length - 4];
//     const identifierDate = identifierArray[identifierArray.length - 3];

//     // Construct the sourceKey for deletion
//     const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;

//     // Define the key for the object to be deleted
//     const key = sourceKey;

//     // Delete the image from the S3 bucket
//     const deleteParams = {
//       Bucket: bucketName,
//       Key: key,
//     };

//     await s3Client.send(new DeleteObjectCommand(deleteParams));

//     res.status(200).json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting image", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// app.get('/image/:jetson/:date', async (req, res) => {
//     const { jetson, date } = req.params;
//     const bucketName = 'cvsterlite';
  
//     const fileKey = `Sterlite_Deployment/dashboard/${jetson}/${date}/`;
  
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
  
//     try {
//       const data = await s3Client.send(new GetObjectCommand(getObjectParams));
//       const image = data.Body;
//       res.contentType(data.ContentType);
//       res.send(image);
//     } catch (error) {
//       console.error('Error fetching image:', error);
//       res.status(404).json({ error: 'File not found' });
//     }
//   });
// app.get('/images/:jetson/:date', async (req, res) => {
//     const { jetson, date } = req.params;
//     const bucketName = 'cvsterlite';
  
//     const prefix = `Sterlite_Deployment/dashboard/${jetson}/${date}/`;
  
//     const listParams = {
//       Bucket: bucketName,
//       Prefix: prefix,
//     };
  
//     try {
//       const data = await s3Client.send(new ListObjectsV2Command(listParams));
//       console.log("data",data)
//       const imageKeys = data.Contents.map(object => object.Key);
//       res.json({ images: imageKeys });
//     } catch (error) {
//       console.error('Error listing objects:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = 7000;
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId:process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
  });

// creating the aws s3 instance  
  const s3 = new AWS.S3();

// enabling cors and express  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended : true })); 


//code to post an image to the s3 bucket

app.post("/copyImage", async(req, res) =>{
    try{
        const { defect, identifier } = req.body; // defect and imageUrl parameters are requested/fetched from the body,i.e, from the FE
        
    // check for invalid defects
    
    // if(!["Patch","Dent","Loose Wire","Black Wire"].includes(defect)){
    //     return res.status(400).json({error: 'Invalid Defect'});
    // }

    // defining the s3 bucket

    const bucketName = 'cvsterlite';

    // Extract the file name from the image URL
    const fileName = identifier.split('/').pop();
    const identifierArray = identifier.split('/');
    const identifierJetson = identifierArray[identifierArray.length - 4];
    const identifierDate = identifierArray[identifierArray.length - 3];


    // construct the sourceKey and targetKey
    
    const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
    console.log("Source Key",sourceKey);
    const targetKey = `Sterlite_Deployment/Seggregation/${defect}/${identifierJetson}/${identifierDate}/${fileName}`;
    console.log(targetKey);
    // Copy the image from the source to the target location

    const copyParams = {
        Bucket : bucketName,
        CopySource : `${bucketName}/${sourceKey}`,
        Key : targetKey,
    };

    await s3.copyObject(copyParams).promise();

    res.status(200).json({ message: "Image copied Succesfully" });
    } catch(error){
        console.error("Error copying image", error);
        res.status(500).json({ error: 'Internal Server Error'});
        // console.log("Error Status",res.statusCode);
    }
    

});
app.post("/moveAndDeleteImage", async (req, res) => {
  try {
      const { identifier } = req.body; // Image parameter requested/fetched from the body
      console.log(identifier)
      // Define the S3 bucket
      const bucketName = 'cvsterlite';

      // Extract the file name from the image URL
      const fileName = identifier.split('/').pop();
      const identifierArray = identifier.split('/');
      const identifierJetson = identifierArray[identifierArray.length - 4];
      const identifierDate = identifierArray[identifierArray.length - 3];

      // Construct the sourceKey and targetKey for copying
      const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
      const targetKey = `Sterlite_Deployment/Seggregation/Deleted/${identifierJetson}/${identifierDate}/${fileName}`;

      // Copy the image from the source to the deleted folder
      const copyParams = {
          Bucket: bucketName,
          CopySource: `${bucketName}/${sourceKey}`,
          Key: targetKey,
      };

     await s3.copyObject(copyParams).promise();

      // Delete the image from the source folder
      const deleteParams = {
          Bucket: bucketName,
          Key: sourceKey,
      };

      await s3.deleteObject(deleteParams).promise();

      res.status(200).json({ message: "Image moved and deleted successfully" });
  } catch (error) {
      console.error("Error moving and deleting image", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete("/deleteImage/:identifier", async (req, res) => {
    try {
      const identifier = req.params.identifier; // Image identifier passed as a URL parameter
      console.log(identifier);
      const fileName = identifier.split('/').pop();
      const identifierArray = identifier.split('/');
      const identifierJetson = identifierArray[identifierArray.length - 4];
      const identifierDate = identifierArray[identifierArray.length - 3];

      // Construct the sourceKey and targetKey for copying
      const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
      // Define the S3 bucket
      const bucketName = 'cvsterlite';
  
      // Construct the key for the object to be deleted
      const key = sourceKey;
  
      // Delete the image from the S3 bucket
      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };
  
      await s3.deleteObject(deleteParams).promise();
  
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// code to get a specific image from the bucket based on the get request parameters
  app.get('/image/:jetson/:date', (req, res) =>{
        const { jetson, date } = req.params;
        // const shiftInfo = shifts[shift];

        const bucketName = 'cvsterlite';
        // const timeString = `${shiftInfo.startTime}-${shiftInfo.endTime}`;

        const fileKey = `Sterlite_Deployment/dashboard/${jetson}/${date}/`;

        const params = {
            Bucket: bucketName,
            Key: fileKey,
            // ContentType: "application/json",
        };

        // Set CORS Headers

        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
        );

        s3.getObject(params, (err, data) =>{
            if(err){
                console.error('Error fetching image:', err);
                res.status(404).json({ error: 'File not found' });
            } else{
                res.contentType(data.ContentType);
                res.send(data.Body);
                console.log( res.send(data.Body))
                console.error('Error fetching image:', err);

            }
        });
  });

// code to get the list of images from the bucket based on the get request parameters
  app.get('/images/:jetson/:date', (req, res) =>{
    const { jetson, date } = req.params;
    const bucketName = 'cvsterlite';
    // const shiftInfo = shifts[shift];
    // const timeString = `${shiftInfo.startTime}-${shiftInfo.endTime}`;

    const prefix = `Sterlite_Deployment/dashboard/${jetson}/${date}/`;

    const params = {
        Bucket: bucketName,
        Prefix: prefix
    };

    s3.listObjectsV2(params, (err, data) =>{
        if(err){
            console.error('Error listing objects:', err);
            res.status(500).json({ error : 'Internal Server Error' });
        } else{
            const imageKeys = data.Contents.map(objects => objects.Key);
            res.json({ images: imageKeys });
        }
    });
  });

  app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
  });



   









































