const express = require('express')
const router = express.Router()
const { pays: PAYS } = require("../models")
const { wrapAsync } = require("../apis/util.js")
const { PlainError } = require('../classes/errors.js')
const { Op } = require("sequelize");

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

    const { count, rows } = await PAYS.findAndCountAll({
        attributes: ["id", "지급구분", "No", "강사명", "학교명", "과목명", "강의료", "본인부담합계", "실수령액"],
        where: whereObj,
        offset: ((req.query.page * 1) - 1) * (req.query.itemsPerPage * 1),
        limit: req.query.itemsPerPage * 1
    })

    console.log(count)
    console.log(rows)

    return res.status(200).json({
        totalPages: parseInt((count - 1) / (req.query.itemsPerPage * 1) ) + 1,
        count: count,
        items: rows
    })
}))

module.exports = router