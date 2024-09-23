const baseURL = require("../util/baseURL");


module.exports = {
    adsType : {
        image : 'Image',
        video : 'Video'
    },
    
    status : {
        active : 'active',
        deactive : 'deactive'
    },
    field : {
        advertiseVideo : 'advertiseVideo',
        advertiseImage : 'advertiseImage',
        advertiseAs : 'advertiseAs'
    },
    adsGenerator: (ads, req) => {
        let baseUrl = baseURL.generateBaseUrl(req);
        let result = [];
        let srNO = 1;
        ads.forEach((ad) => {
            console.log(ad.advertiseVideo)
            result.push({
                srNO: srNO++,
                Title: ad.adsTitle,
                Link: ad.redirectLink,
                Advertise: ad.advertiseImage ? baseUrl + ad.advertiseImage : baseUrl + ad.advertiseVideo,
                Status: ad.status,
                Id: ad._id
            })
        });
        return result;
    }
}