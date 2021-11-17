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
        attributes: ["id", "지급구분", "지급일", "No", "강사명", "학교명", "과목명", "강의료", "본인부담합계", "실수령액", "메일주소", "created", '발송결과'],
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

router.get("/mailing", wrapAsync( async (req, res) => {
    const { count, rows } = await PAYS.findAndCountAll({
        order: [ '강사명' ],
        offset: req.query.offset,
        limit: Number(req.query.limit)
    })

    return res.status(200).json({
        count: count,
        pays: rows
    })
}))

router.post("/test-send-mail", wrapAsync( async (req, res) => {

    //emailResultCount = 0

    //app.io.on("connection", socket => {
    //    setInterval(() => {
    //        socket.broadcast.emit("newdata", resultCount)
    //    }, 1000)
    //})

    const { body: email } = req

    const offset = Number(email.offset) || 0

    //발송 리스트 생성
    const { count, rows } = await PAYS.findAndCountAll({
        order: [ '강사명' ],
        offset: offset,
        limit: Number(email.limit),
        raw: true
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

    emailResultCount = 0
    emailTotalCount = rows.length

    //for (const [index, pay] of rows.entries()) {
    for ( let i = 0; i < rows.length; i++ ) {

        const pay = rows[i]

        // null 값 0으로 변경
        for (let key in pay) {
            //console.log(key, pay[key])
            if (pay[key] === null) {
                pay[key] = 0
            }
        }

        let account = pay['은행계좌번호']
        if (account) {
            account = account.substr(account.length-4, 4)
        }
        account = '****' + account

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
                <td style="padding: 3px; text-align: left; width: 14%; font-weight: bold;">소속:</td>
                <td style="padding: 3px; text-align: left; width: 86%;" colspan="3">한국예술종합학교 산학협력단 예술강사</td>
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
                <td style="padding: 3px; text-align: left; width: 36%;">${pay.은행} ${account}</td>
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
                <td style=" text-align:right; border: 1px solid black; padding:6px;">(시수:${pay.시수} × 단가:${pay.단가.toLocaleString()})</td>
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
    <div style="margin-top: 10px;">※본 메일은 회신이 불가하오니, 문의 사항은 02-746-9058으로 연락주시기 바랍니다.</div>
</div>
`
        const ret = await transport.sendMail({
            from: "jhoon2002@gmail.com",
            to: email.to,
            subject: email.subject,
            html: html
        })
        //rets.push(ret)
        emailResultCount++

        console.log("emailResultCount", emailResultCount)

        await PAYS.update({ 발송결과: '테스트 완료' }, {
            where: {
                id: pay.id
            }
        })

    }

    transport.close()

    return res.status(200).json({
        msg: "발송 성공",
        count: rets.length
    })

}))

router.get('/some-stream', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    });

    // Heartbeat every 30s to keep-alive
    //setInterval(function() {
    //    res.write(' \n');
    //    res.emit('drain');
    //}, 30 * 1000);

    setInterval(function() {
        res.write(JSON.stringify({ foo: 9999 * Math.random() }) + '\n');
        res.emit('drain');
    }, 3 * 1000);

});


module.exports = router