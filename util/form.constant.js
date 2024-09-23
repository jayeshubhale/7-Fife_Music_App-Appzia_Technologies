module.exports = {
    objectConverter : (forms) => {
        let result = [];
        let srNO = 1;
        forms.forEach((form)=> {
         result.push({
            serialNumber : srNO++,
            Date : form.createdAt,
            userName : form.userName,
            subject : form.subject,
            message : form.message,
            reply : form.reply
        })

        })
        return result;
    }
}