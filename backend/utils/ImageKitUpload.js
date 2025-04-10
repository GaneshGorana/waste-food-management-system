import ImageKit from "imagekit";
const imageKitUpload = new ImageKit({
    publicKey: `${process.env.IMAGE_KIT_PUBLIC_KEY}`,
    privateKey: `${process.env.IMAGE_KIT_PRIVATE_KEY}`,
    urlEndpoint: `${process.env.IMAGE_KIT_URL_ENDPOINT}`
});
export default imageKitUpload;