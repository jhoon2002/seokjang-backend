/* models/pays.js */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('pay', {
        no: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        sheet_no: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        school_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        year_month: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tuition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        income_tax: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jumin_tax: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pension: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        emp_ins: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        deduction: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        net_pay: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pay_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        calc: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
    })
}