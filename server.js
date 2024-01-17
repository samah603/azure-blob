const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const app = express();
const port = process.env.PORT || 3000;

const sasUrl = ''; // Replace with your SAS URL
const blobServiceClient = new BlobServiceClient(sasUrl);

const containerName = ''; // Replace with your blob Container Name 
const containerClient = blobServiceClient.getContainerClient(containerName);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send(`
    <h1>File Upload Example</h1>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file">
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const blobName = req.file.originalname;
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.upload(req.file.buffer, req.file.buffer.length);
  res.redirect('/');
});

app.get('/download/:blobName', async (req, res) => {
  const blobName = req.params.blobName;
  const blobClient = containerClient.getBlockBlobClient(blobName);
  const downloadedData = await blobClient.downloadToBuffer();
  res.send(downloadedData.toString());
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
