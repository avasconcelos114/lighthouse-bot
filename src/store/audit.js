const mongoose = require('mongoose');
const utils = require('../utils');

const schema = new mongoose.Schema({
    createdDate: Number, // unix timestamp
    userId: String, // id of person who ran an audit
    report: String, // json formatted string of report object
});

const AuditModel = mongoose.model('Audit', schema);

async function createAudit(userId, report) {
    const newAudit = new AuditModel({
        createdDate: utils.common.generateTimestamp(),
        userId: userId,
        report: report,
    });

    const data = await newAudit.save();
    return data;
}

async function getAuditReport(id) {
    const audit = await AuditModel.findById(id);
    const report = JSON.parse(audit.report);
    return report;
}

module.exports = {
    createAudit,
    getAuditReport,
};
