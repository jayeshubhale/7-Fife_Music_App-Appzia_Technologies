
module.exports = {
    objectConverter : (payment) => {
    let result = [];
    let srNo = 1;
    payment.forEach((pay) => {
        result.push({
            serialNo: srNo++,
            DateTime: pay.createdAt,
            userName: pay.userName,
            planName : pay.planName,
            mainAmount : pay.mainAmount,
            offer : pay.offer,
            finalAmount : pay.finalAmount,
            transactionID : pay.paymentId,
            paymentMode : pay.paymentMethod
        })
    })
    console.log(result)
        return result
}
}

