const constant = require('../util/ads.constant');
const Ads = require('../models/Ads.model')

const create = async (req, res) => {
   
    try {
       console.log('create add')
        const fileName = req.files[0].filename ;         
        let obj = {
            adsTitle: req.body.adsTitle ? req.body.adsTitle : undefined,
            redirectLink: req.body.redirectLink ? req.body.redirectLink : undefined,
            advertiseAs: req.body.advertiseAs ? req.body.advertiseAs : undefined,
            status: req.body.status ? req.body.status : undefined
        }
        if (req.body.advertiseAs == constant.adsType.image) {
            obj[constant.field.advertiseImage] = "/uploads/" + fileName
        }
        else {
            obj[constant.field.advertiseVideo] = "/uploads/" + fileName
        }
        const ad = await Ads.create(obj);
        return res.status(201).send({
            error_code : 200,
            message: `Ad with ${req.body.advertiseAs} got created`
        })


    } catch (err) {
        console.log('Error inside create of Ads Controller', err);
        res.status(500).send({
            error_code : 500,
            message: "Internal Server Error"
        })
    }
}

const getad = async (req, res) => {
    try {
        const { search = '', dateRange, startDate, endDate } = req.query;
        const filter = {};

        // Apply search query if provided
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Apply date range filter if provided
        if (dateRange) {
            switch (dateRange) {
                case 'today':
                    filter.createdAt = { $gte: new Date().setHours(0, 0, 0), $lte: new Date() };
                    break;
                case 'yesterday':
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    filter.createdAt = {
                        $gte: new Date(yesterday).setHours(0, 0, 0),
                        $lte: new Date(yesterday).setHours(23, 59, 59)
                    };
                    break;
                case 'last7days':
                    filter.createdAt = { $gte: new Date().setDate(new Date().getDate() - 7), $lte: new Date() };
                    break;
                case 'last30days':
                    filter.createdAt = { $gte: new Date().setDate(new Date().getDate() - 30), $lte: new Date() };
                    break;
                case 'thisMonth':
                    filter.createdAt = {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                    };
                    break;
                case 'lastMonth':
                    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
                    filter.createdAt = { $gte: lastMonthStart, $lte: lastMonthEnd };
                    break;
                case 'customRange':
                    if (startDate && endDate) {
                        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
                    }
                    break;
                default:
                    break;
            }
        }

        // Fetch total count of ads matching the filter criteria
        const totalCount = await Ads.countDocuments(filter);

        // Perform pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch paginated ads
        const ads = await Ads.find(filter).skip(skip).limit(limit);

        return res.status(200).json({
            error_code: 200,
            message: 'Ads retrieved successfully',
            ads: ads,
            page: page,
            limit: limit,
            total_count: totalCount
        });
    } catch (err) {
        console.log('Error inside getad Controller', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



const updateAds = async(req,res) => {
    try{
        const ad = await Ads.findById(req.params.id);
        let obj = {
            adsTitle: req.body.adsTitle ? req.body.adsTitle : undefined,
            redirectLink: req.body.redirectLink ? req.body.redirectLink : undefined,
            status: req.body.status ? req.body.status : undefined
        }
        if(req.body.advertiseAs)
        {
            const fileName = req.files[0].filename ; 
            if (req.body.advertiseAs == constant.adsType.image) {
                obj[constant.field.advertiseImage] = "/uploads/" + fileName
                delete ad.advertiseVideo;
            }
            else {
                obj[constant.field.advertiseVideo] = "/uploads/" + fileName
                delete ad.advertiseImage;
            }
        }
        await ad.updateOne(obj);
        res.status(201).send({
            error_code : 200,
            message : 'Ads got updated'
        })


    }catch(err){
        console.log('Error inside updateAds Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const deletead = async(req,res) => {
    try{
        let id = req.params.id;
        await Ads.deleteOne({_id :id});
       return  res.status(201).send({
            error_code : 200,
            message : 'ads got deleted'
        })

    }catch(err){
        console.log('Error Occured inside deletead of ads Controller',err);
         return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
         })
    }
};

const updateAdsTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { adsTiming } = req.body; // Assuming adsTiming is provided in minutes

        // Find the advertisement by ID
        const ad = await Ads.findById(id);

        // If the advertisement is not found, return 404 Not Found
        if (!ad) {
            return res.status(404).json({ error_code: 404, message: 'Advertisement not found' });
        }

        // Update the advertisement's show timing
        ad.adsTime = adsTiming; // Assuming adsTiming is in minutes
        await ad.save();

        // Send success response
        return res.status(200).json({ error_code: 200, message: 'Advertisement show timing updated successfully' });
    } catch (err) {
        console.error('Error inside updateAdsTime Controller:', err);
        return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
    }
};


// const updateAdsStatus = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the advertisement by ID
//         const ad = await Ads.findById(id);

//         // If the advertisement is not found, return 404 Not Found
//         if (!ad) {
//             return res.status(404).json({ error_code: 404, message: 'Advertisement not found' });
//         }

//         // Toggle the advertisement status between active and inactive
//         ad.status = ad.status === constant.status.active ? constant.status.inactive : constant.status.active;
//         await ad.save();

//         // Send success response
//         return res.status(200).json({ error_code: 200, message: 'Advertisement status updated successfully' });
//     } catch (err) {
//         console.error('Error inside updateAdsStatus Controller:', err);
//         return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
//     }
// };

const updateAdsStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const adsData = await Ads.findById(id);
        if (!adsData) {
            return res.status(400).send({
                error_code: 400,
                message: 'Ads not found'
            });
        }

        adsData.status = adsData.status === 'activate' ? 'deactivate' : 'activate';

        await adsData.save();
        res.status(200).send({
            message: `ads status toggled successfully to ${adsData.status}`,
            adsData: adsData
        });
    } catch (err) {
        console.error('Error inside update ', err);
        res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


module.exports = {
    create,
    getad,
    updateAds,
    deletead,
    updateAdsTime,
    // updateAdsStatus
    updateAdsStatus
}