import pinataSDK from "@pinata/sdk";
import path from "node:path";
import fs from "node:fs";
import { vars } from "hardhat/config";

type TokenUriMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: {
    traitType: "Cuteness";
    value: 100;
  };
};

const pinataApiKey = vars.get("PINATA_API_KEY");
const pinataApiSecret = vars.get("PINATA_API_SECRET");
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function uploadTokenImages(imagesDirPath: string) {
  const fullImagesPath = path.resolve(__dirname, "../", imagesDirPath);
  const files = fs.readdirSync(fullImagesPath);
  const responses = [];
  console.log("Uploading to Pinata!");

  for (const fileName of files) {
    console.log(`Working on ${fileName}...`);
    const readableFileStream = fs.createReadStream(path.join(fullImagesPath, fileName));

    try {
      const response = await pinata.pinFileToIPFS(readableFileStream, {
        pinataMetadata: { name: fileName },
      });
      responses.push(response);
    } catch (error) {
      console.error(error);
    }
  }

  return { responses, files };
}

async function uploadTokenUriMetadata(metadata: TokenUriMetadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);

    return response;
  } catch (error) {
    console.error(error);
  }
}

export { uploadTokenImages, uploadTokenUriMetadata, type TokenUriMetadata };
