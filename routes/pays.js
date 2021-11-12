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

router.post("/test-send-mail", wrapAsync( async (req, res) => {

    const { body: email } = req

    //발송 리스트 생성
    const { count, rows } = await PAYS.findAndCountAll({
        order: [ '강사명' ],
        limit: Number(email.personnel)
    })

    //console.log("count", count)
    //console.log("rows", rows)

    //메일 발송
    const transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "jhoon2002@gmail.com",
            pass: "!arts3007"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    let rets = []

    //for (const [index, pay] of rows.entries()) {
    for ( let i = 0; i < rows.length; i++ ) {

        const pay = rows[i]

        //console.log(i, pay.강사명)
        const html =
            `
<div style="width: 600px">
    <div style="font-size:1.5rem; font-weight: bold; text-align:center; margin: 20px 0 0 0">
        급여 지급 명세서
    </div>
    <div style="text-align:center; margin-bottom: 20px;">(${pay.지급구분})</div>
    <table style="border-collapse: collapse; text-align:center; max-width: 100%; min-width: 100%; margin-bottom: 20px;">
        <tbody>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">소속·신분:</td>
                <td style="padding: 3px; text-align: left; width: 86%;" colspan="3">한국예술종합학교 산학협력단(예술강사)</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; font-weight: bold;">성명:</td>
                <td style="padding: 3px; text-align: left;" colspan="3">${pay.강사명}</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">학교명:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.학교명}</td>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">과목명:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.과목명}</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">지급은행:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.은행} ${pay.은행계좌번호}</td>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">지급일:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.지급일}</td>
            </tr>
        </tbody>        
    </table>
    <div style="font-size:1.2rem; font-weight: bold; text-align: center; padding:6px;">
        실 수령액: ${pay.실수령액.toLocaleString()}원
    </div>
    <div style="text-align:right; font-size: 0.8rem">(단위: 원)</div>
    <table style="border-collapse: collapse; border: 1px solid black; max-width: 100%; min-width: 100%;">
        <thead>
            <tr>
                <th colspan="2" style="background: #c2c2c2; text-align: center; border: 1px solid black; padding:6px; width: 50%;">보 &nbsp; &nbsp; &nbsp; 수</th>
                <th colspan="2" style="background: #c2c2c2; text-align: center; border: 1px solid black; padding:6px; width: 50%;">공 &nbsp; &nbsp; &nbsp; 제</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="background: #e7e7e7; border: 1px solid black; padding:6px; width: 20%; font-weight: bold;">보수계</td>
                <td style="background: #e7e7e7; text-align:right; border: 1px solid black; padding:6px; width: 30%; font-weight: bold;">${pay.강의료.toLocaleString()}</td>
                <td style="background: #e7e7e7; border: 1px solid black; padding:6px; width: 20%; font-weight: bold;">공제계</td>
                <td style="background: #e7e7e7; text-align:right; border: 1px solid black; padding:6px; width: 30%; font-weight: bold;">${pay.본인부담합계.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">강의료</td>
                <td style="text-align:right; border: 1px solid black; padding:6px;">${pay.강의료.toLocaleString()}</td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">소득세</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay.강의료.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">(시수:${pay.시수}, 단가:${pay.단가.toLocaleString()})</td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">주민세</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay.주민세.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">국민연금</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['국민연금(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">건강보험</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['건강보험(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">장기요양</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['장기요양(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">고용보험</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['고용보험(본인)'].toLocaleString()}</td>
            </tr>
        </tbody>
    </table>
</div>
`
        const ret = await transport.sendMail({
            from: "jhoon2002@gmail.com",
            //to: pay.메일주소,
            to: email.to,
            subject: email.subject,
            html: html
        })
        rets.push(ret)
    }

    transport.close()

    return res.status(200).json({
        msg: "발송 성공",
        count: rets.length
    })

}))
router.get("/send-mail", wrapAsync( async (req, res) => {
    
    //발송 리스트 생성
    const { count, rows } = await PAYS.findAndCountAll({
        order: [ '강사명' ]
    })

    console.log("count", count)
    //console.log("rows", rows)

    //메일 발송
    const transport = nodemailer.createTransport({
        service: "Gmail",
        /*host: "spam.karts.ac.kr",
        port: 995,
        secure: false,
        auth: {
            user: "cooperation@karts.ac.kr",
            pass: "(cooperation2018*"
        },*/
        auth: {
            user: "jhoon2002@gmail.com",
            pass: "!arts3007"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    let rets = []

    //for (const [index, pay] of rows.entries()) {
    for ( let i = 0; i < 2; i++ ) {

        const pay = rows[i]

        console.log(i, pay.강사명)
        const html =
            `
<div style="width: 600px">
    <div style="font-size:1.5rem; font-weight: bold; text-align:center; margin: 20px 0 0 0">
        보수 지급 명세서
    </div>
    <div style="text-align:center; margin-bottom: 20px;">(${pay.지급구분})</div>
    <table style="border-collapse: collapse; text-align:center; max-width: 100%; min-width: 100%; margin-bottom: 20px;">
        <tbody>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">소속·신분:</td>
                <td style="padding: 3px; text-align: left; width: 86%;" colspan="3">한국예술종합학교 산학협력단(예술강사)</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; font-weight: bold;">성명:</td>
                <td style="padding: 3px; text-align: left;" colspan="3">${pay.강사명}</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">학교명:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.학교명}</td>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">과목명:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.과목명}</td>
            </tr>
            <tr>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">지급은행:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.은행} ${pay.은행계좌번호}</td>
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">지급일:</td>
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.지급일}</td>
            </tr>
        </tbody>        
    </table>
    <div style="font-size:1.2rem; font-weight: bold; text-align: center; padding:6px;">
        실 수령액: ${pay.실수령액.toLocaleString()}원
    </div>
    <div style="text-align:right; font-size: 0.8rem">(단위: 원)</div>
    <table style="border-collapse: collapse; border: 1px solid black; max-width: 100%; min-width: 100%;">
        <thead>
            <tr>
                <th colspan="2" style="background: #c2c2c2; text-align: center; border: 1px solid black; padding:6px; width: 50%;">보 &nbsp; &nbsp; &nbsp; 수</th>
                <th colspan="2" style="background: #c2c2c2; text-align: center; border: 1px solid black; padding:6px; width: 50%;">공 &nbsp; &nbsp; &nbsp; 제</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="background: #e7e7e7; border: 1px solid black; padding:6px; width: 20%; font-weight: bold;">보수계</td>
                <td style="background: #e7e7e7; text-align:right; border: 1px solid black; padding:6px; width: 30%; font-weight: bold;">${pay.강의료.toLocaleString()}</td>
                <td style="background: #e7e7e7; border: 1px solid black; padding:6px; width: 20%; font-weight: bold;">공제계</td>
                <td style="background: #e7e7e7; text-align:right; border: 1px solid black; padding:6px; width: 30%; font-weight: bold;">${pay.본인부담합계.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">강의료</td>
                <td style="text-align:right; border: 1px solid black; padding:6px;">${pay.강의료.toLocaleString()}</td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">소득세</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay.강의료.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">(시수:${pay.시수}, 단가:${pay.단가.toLocaleString()})</td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">주민세</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay.주민세.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">국민연금</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['국민연금(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">건강보험</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['건강보험(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">장기요양</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['장기요양(본인)'].toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px;"></td>
                <td style="border: 1px solid black; padding:6px; padding-left: 15px;">고용보험</td>
                <td style=" text-align:right; border: 1px solid black; padding:6px;">${pay['고용보험(본인)'].toLocaleString()}</td>
            </tr>
        </tbody>
    </table>
</div>
`
        const ret = await transport.sendMail({
            from: "jhoon2002@gmail.com",
            //to: pay.메일주소,
            to: "jhoon2002@naver.com",
            subject: "[한예종산단]2021년 11월 보수 명세서 (실전02)",
            html: html
        })
        rets.push(ret)
    }

    transport.close()

    return res.status(200).json({
        msg: "발송 성공",
        rets
    })

}))
module.exports = router