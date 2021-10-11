const express = require('express')
const router = express.Router()
const xlsx = require("xlsx")
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const { PlainError } = require('../classes/errors.js')
// const User = require("../models/user.js")
const { wrapAsync } = require("../apis/util.js")
const publicdir = "public/"
const uploaddir = "files/upload/"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicdir + uploaddir)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

const { pays: PAYS } = require('../models')

//_id 와 파일명을 받아, 파일을 디스크에 저장하고 파일명을 db 에 저장
router.post("/upload", upload.single("file"), function(req, res) {
    //multer의 처리 결과는 req.file 로 받음
    //이부분 처리가 잘 안된다면, 대부분 front 에서 multi part 등 form 설정에 문제가 있는 경우임

    const workbook = xlsx.readFile(publicdir + uploaddir + req.file.originalname)

    console.log(Object.keys(workbook.Sheets))
    // const ws = workbook.Sheets["최종 (2)"]
    const sheet = workbook.SheetNames[0]
    const ws = workbook.Sheets[sheet]
    const records = xlsx.utils.sheet_to_json(ws)

    // console.log(records)
    // try {
    //     PAYS.create(
    //         {
    //             No: 1,
    //             '학교명': '오금중'
    //         }
    //     )
    // } catch (e) {
    //     console.log(e)
    // }

    try {
        for (let row of records) {
            // console.log(row)
            if (row["No"]) {
                // console.log(row)
                PAYS.create(row)
            }
        }
    } catch(e) {
        console.log(e)
    }

    // records.forEach((r, i) => {
    //     console.log(" insert into table values( " + r.No + " ) ");
    // });

    return res.status(200).json({
        msg: "업로드 완료",
        file: req.file
    })

})

//사용자 face 파일명을 받아서 삭제
router.delete("/face/:_id/:filename", wrapAsync(async function(req, res) {

    const filePath = path.join(__dirname, "../" + publicdir + facedir, req.params.filename)

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            throw new PlainError("파일에 접근할 수 없음")
        }
        if (req.params.filename === "none.svg") {
            throw new PlainError("none.svg는 삭제할 수 없음")
        }
        fs.unlink(filePath, (err) => {
            if (err) {
                throw new PlainError("파일을 삭제할 수 없음")
            }
        })
    })

    // await User.findByIdAndUpdate(req.params._id, {
    //     $set: {
    //         face: "",
    //         updated: new Date()
    //     }
    // },{ new: true })

    res.status(200).json({
        status: 200,
        msg: "삭제 완료"
    })

}))

module.exports = router