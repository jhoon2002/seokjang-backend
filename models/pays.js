/* models/pays.js */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('pay', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        No: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        "학교명": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "지급구분": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "강사명": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "과목명": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "시수": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "단가": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "강의료": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "소득세": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "주민세": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "국민연금(본인)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "국민연금(기관)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "건강보험(본인)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "장기요양(본인)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "건강보험(기관)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "고용보험(본인)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "고용보험(기관)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "산재보험(기관)": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "본인부담합계": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "실수령액": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "기관부담합계": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "4대보험공제계": {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        "은행": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "은행계좌번호": {
            type: DataTypes.STRING,
            allowNull: true,
        },
        "지급일": {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        "비고": {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
    })
}