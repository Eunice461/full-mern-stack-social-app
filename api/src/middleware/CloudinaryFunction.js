const {cloudinary} = require('../services/Cloudinary');
const fs = require('fs')



const uploadCloudinary = async (fileToUpload)=>{
    const uploadResponse = await cloudinary.uploader.upload(fileToUpload, {
        upload_preset: 'ml_default',
        }, function(result, err){
            if(err){
                console.log(err)
               //delete file from local server storage
                return console.log('failed to upload')
            }
            //delete file from local server storage
                fs.unlinkSync(fileToUpload);
                return result 
        });
        fs.unlinkSync(fileToUpload);  
        return uploadResponse
};

const deleteCloudinary = async (fileToDelete) =>{
    const deleteResponse = await cloudinary.uploader.destroy(fileToDelete, function(result, err){
        if(err){
                //delete file from local server storage
               return console.log(err)
        }
        //delete file from local server storage
               
                return console.log(result, 'file deleted')
    })
   
    return deleteResponse
}

//delete multiple files

const deleteAllFiles = async (filesToDelete) =>{
    const deleteAllFilesResponse = await cloudinary.api.delete_resources(filesToDelete, function(result, err){
        if(err){
            console.log(err)
            return console.log('deleting all images failed')
        }

        return result
    });
    return deleteAllFilesResponse
}

module.exports = { uploadCloudinary, deleteCloudinary, deleteAllFiles}