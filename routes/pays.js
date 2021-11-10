const express = require('express')
const router = express.Router()
const { pays: PAYS } = require("../models")
const { wrapAsync } = require("../apis/util.js")
const { PlainError } = require('../classes/errors.js')
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

// 검색 내역을 받아 카운트와 사용자 배열을 반환
router.get("/", wrapAsync(async (req, res) => {

    let whereArr = []
    if (req.query["search.강사명"]) {
        whereArr.push( { "강사명": { [Op.like]: '%' + req.query["search.강사명"] + '%' } } )
    }
    if (req.query["search.학교명"]) {
        whereArr.push( { "학교명": { [Op.like]: '%' + req.query["search.학교명"] + '%' } } )
    }
    if (req.query["search.과목명"]) {
        whereArr.push( { "과목명": { [Op.like]: '%' + req.query["search.과목명"] + '%' } } )
    }
    if (req.query["search.지급구분"]) {
        whereArr.push( { "지급구분": { [Op.like]: '%' + req.query["search.지급구분"] + '%' } } )
    }

    let whereObj = {}
    if (whereArr.length > 0) {
        whereObj = {
            [Op.or]: whereArr
        }
    }

    //order
    let sort = {
        fields: req.query.sortBy,
        descs: req.query.sortDesc
    }

    let order = {}
    let sorter = []  // [ [ 필드명, 'DESC' ],... ]
    let fields = sort.fields
    let descs = sort.descs
    if (fields) {
        for (let [index, field] of fields.entries()) {
            sorter.push([ field, descs[index] === "true" ? 'ASC' : 'DESC' ])
        }
    }
    order = sorter

    const { count, rows } = await PAYS.findAndCountAll({
        attributes: ["id", "지급구분", "지급일", "No", "강사명", "학교명", "과목명", "강의료", "본인부담합계", "실수령액", "메일주소", "created"],
        where: whereObj,
        order: order,
        offset: ((req.query.page * 1) - 1) * (req.query.itemsPerPage * 1),
        limit: req.query.itemsPerPage * 1
    })

    //console.log(count)
    //console.log(rows)

    return res.status(200).json({
        totalPages: parseInt((count - 1) / (req.query.itemsPerPage * 1) ) + 1,
        count: count,
        items: rows
    })
}))

// pays 삭제
router.delete("/", wrapAsync(async (req, res) => {
    await PAYS.destroy({
        truncate: true
    })
    return res.status(200).json({
        msg: "모든 데이터 삭제"
    })
}))

router.get("/send-mail", wrapAsync( async (req, res) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "spam.karts.ac.kr",
        port: 995,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "cooperation", // generated ethereal user
            pass: "암호..", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "jhoon@karts.ac.kr", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}))
module.exports = router