import { test,expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('User Story 2', () => {
    /*
    As an Anonymous user,
    I want to attach a zip file containing multiple images,
    And I want each of these uploaded images to have a permanent link.
    */

   let zipEndpoint = "/api/zip";
   let zipMimeType = "application/zip";
   let imageMimeType = "image/png";

    test("TC03 - Upload zip file containing image file only", async ({request}) => {
        let response;
        await test.step("POST " + {zipEndpoint}, async () => {
            const zipFile = fs.readFileSync("./test-data/zip-data/image.zip")
            response = await request.post(zipEndpoint, {
                headers: {
                },
                multipart: {
                    file: {
                        name: "image.zip",
                        mimeType: zipMimeType,
                        buffer: zipFile,
                    }
                },
            });
        });

        await test.step("Validate status code - {200}",async () => {
            expect.soft(response.status()).toBe(200);
        });

        await test.step("Validate response body have {images} attribute with length 2",async () => {
            let jsonData = await response.json();
            expect.soft(jsonData.images).toBeInstanceOf(Array);
            expect.soft(jsonData.images.length).toBe(2);
        });

        await test.step("Validate {images} have url",async () => {
            let jsonData = await response.json();
            let regex = /https:\/\/assessement\.onrender\.com\/images\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]+/i;
            jsonData.images.forEach(element => {
                expect.soft(element).toMatch(regex);
            });
        });

        await test.step("Validate {images} have url",async () => {
            let jsonData = await response.json();
            jsonData.images.forEach( async element => {
                let res = await request.get(element);
                expect.soft(res.status()).toBe(200);
            });
        });




    });

    test("TC04 - Upload zip file containing non-image file only", async ({request}) => {
        let response;
        await test.step("POST " + {zipEndpoint},async () => {
            const zipFile = fs.readFileSync("./test-data/zip-data/non-image.zip")
            response = await request.post(zipEndpoint, {
                headers: {
                },
                multipart: {
                    file: {
                        name: "non-image.zip",
                        mimeType: zipMimeType,
                        buffer: zipFile,
                    }
                },
            });
            console.log(response);
        });

        await test.step("Validate status code - {500}",async () => {
            expect.soft(response.status()).toBe(500);
        });

        await test.step("Validate response body have {images} attribute = {no image found in zip file}",async () => {
            let jsonData = await response.json();
            expect.soft(jsonData.err).toBe("no image found in zip file");
        });
    });

    test("TC05 - Upload zip file containing mix of image and non-image file", async ({request}) => {
        let response;
        await test.step("POST " + {zipEndpoint},async () => {
            const zipFile = fs.readFileSync("./test-data/zip-data/mix.zip")
            response = await request.post(zipEndpoint, {
                headers: {
                },
                multipart: {
                    file: {
                        name: "mix.zip",
                        mimeType: zipMimeType,
                        buffer: zipFile,
                    }
                },
            });
        });

        await test.step("Validate status code - {200}", async () => {
            expect.soft(response.status()).toBe(200);
        });

        await test.step("Validate response body have {images} attribute with length 2", async () => {
            let jsonData = await response.json();
            expect.soft(jsonData.images).toBeInstanceOf(Array);
            expect.soft(jsonData.images.length).toBe(2);
        });

        await test.step("Validate {images} have url", async () => {
            let jsonData = await response.json();
            let regex = /https:\/\/assessement\.onrender\.com\/images\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[A-Za-z]+/i;
            jsonData.images.forEach(element => {
                expect.soft(element).toMatch(regex);
            });
        });

        await test.step("GET the url in {images}",async () => {
            let jsonData = await response.json();
            jsonData.images.forEach( async element => {
                let res = await request.get(element);
                expect.soft(res.status()).toBe(200);
            });
        });
    });

    test("TC06 - Upload non-zip file", async ({request}) => {
        let response;
        await test.step("POST " + {zipEndpoint},async () => {
            const file = fs.readFileSync("./test-data/non-image-data/pdf-sample.pdf")
            response = await request.post(zipEndpoint, {
                headers: {
                },
                multipart: {
                    file: {
                        name: "pdf-sample.pdf",
                        mimeType: zipMimeType,
                        buffer: file,
                    }
                },
            });
            console.log(response);
        });

        await test.step("Validate status code - {403}",async () => {
            expect.soft(response.status()).toBe(403); 
        });

        await test.step("Validate response body to have {err} attribute - {File isn' a zip}", async () => {
            let jsonData = await response.json();
            console.log(jsonData);
            expect.soft(jsonData.err).toBe("File isn' a zip"); 
        });
    });
})