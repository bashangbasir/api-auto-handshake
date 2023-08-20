import { test,expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('User Story 1', () => {

    /*
    As an Anonymous user,
    I want to attach a picture to the Service,
    And I want to have a permanent link to this picture,
    Otherwise, I want to be rejected and informed if the file is not a picture.
    */

    let response;
    var imageFiles: Array<string> = [];
    var nonImageFiles: Array<string> = [];
    let imageEndpoint = '/api/image';
    let imageMimeType = 'image/png';

    //READ IMAGEFILES DATA 
    var imageFiles_ =  fs.readdirSync("./test-data/image-data/");
    for(var i in imageFiles_) {
        var name = './test-data/image-data/' + imageFiles_[i];
        imageFiles.push(name);
    }

    //READ NON-IMAGEFILES DATA 
    var nonImageFiles_ =  fs.readdirSync("./test-data/non-image-data/");
    for(var i in nonImageFiles_) {
        var name = './test-data/non-image-data/' + nonImageFiles_[i];
        nonImageFiles.push(name);
    }

    
    //FIRST TEST CASE
    for(const imageFile of imageFiles){
        test(`TC01 - Upload image file  ${imageFile}`, async ({request}) => {
            let url;
            await test.step('POST ' + {imageEndpoint}, async () => {
                const image = fs.readFileSync(imageFile);
                
                response = await request.post(imageEndpoint, {
                    headers: {
                    },
                    multipart: {
                        file: {
                            name: imageFile,
                            mimeType: imageMimeType,
                            buffer: image,
                        }
                    },
                });
            });

            await test.step('Validate response - {200}', async () => {
                expect.soft(response.status()).toBe(200);
            });

            await test.step('Validate response body contains {image} attribute }', async () => {
                const responseData = await response.json();
                url = responseData.image;
                let regex = /https:\/\/assessement\.onrender\.com\/images\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]+/i;
                expect.soft(responseData.image).toMatch(regex)
            });

            await test.step('Get the image back by url', async () => {
                response = await request.get(url);
                expect.soft(response.status()).toBe(200);
            });
        })
    }

    //SECOND TEST CASE
    for(const nonImagefile of nonImageFiles){
        test(`TC02 - Upload non image file  ${nonImagefile}`, async ({request}) => {
            let url;
            await test.step('POST ' + {imageEndpoint}, async () => {
                const image = fs.readFileSync(nonImagefile);
                
                response = await request.post(imageEndpoint, {
                    headers: {
                    },
                    multipart: {
                        file: {
                            name: nonImagefile,
                            mimeType: imageMimeType,
                            buffer: image,
                        }
                    },
                });
            });

            await test.step("Validate response - {403}", async () => {
                expect.soft(response.status()).toBe(403);
            });

            await test.step("Validate response body got err  - {File is'n an image}", async () => {
                const responseData = await response.json();
                expect(responseData.err).toBe("File isn' an image");
            });

        })
    }

})