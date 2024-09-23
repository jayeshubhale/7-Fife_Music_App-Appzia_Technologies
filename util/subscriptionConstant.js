module.exports = {
    duration : {
        day : 'Day',
        month : 'Month',
        year : 'Year',
      
    },
    status : {
        activate : 'activate',
        deactivate : 'deactivate'

    },
    priceCalculate : (offer,price) => {
         if(offer==0) return price;
         let offerPrice = (offer/100) * price;
         return Math.floor(price - offerPrice);
    },
    getSubscription : (subscription) => {
        let sr = 1;
        let subs = [];
        subscription.forEach(sub => {
              subs.push({
                subscriptionId : sub._id,
                serialNumber : sr++,
                planTitle : sub.subscriptionTitle,
                validity : sub.validity.count +' '+sub.validity.duration,
                amount : sub.price,
                adfree : sub.adfree ,
                download : sub.download,
                description : sub.description,
                offer : sub.offer,
                status : sub.status,
                createdDate : sub.createdAt
              })
        })
        return subs;
    }
}
