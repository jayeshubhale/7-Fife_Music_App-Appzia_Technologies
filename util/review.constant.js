module.exports = {
    status : {
        publish : 'publish',
        unpublish : 'unpublish'
    },
    objectConverter : (reviews) => {
        let result = [];
        let srNo = 1;
        reviews.forEach((rev) => {
           result.push({
              serialNo : srNo++,
              DateTime : rev.createdAt,
              userName : rev.userName,
              review : rev.review,
              reply : rev.reply,
              status : rev.status
           })


        })
        return result;
    }
}