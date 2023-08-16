import imagemin from "imagemin"
import imageminWebp from "imagemin-webp"
import * as fs from "fs"

fs.readdir("./assets/", async (err, files) => {
    for (const dirName of files){
        await imagemin([`./assets/${dirName}/*.{jpg,jpeg,png}`], {
            destination: `./public/images/${dirName}`,
            plugins: [imageminWebp({ quality: 100 })],
        })
    }
})
