const PlayList = require('../models/playlist.model');


const repeatedSongs = async(req,res,next) => {
    try{
        
        const playlist = await PlayList.findById(req.params.id);
        console.log(playlist);
        if(!playlist.songs == undefined) return next();
        for(let i=0;i<playlist.songs.length;i++)
        {
            let value = playlist.songs[i];
            const strValue = `${value}`
            const cleanValue = strValue.replace(/new ObjectId\("(.*)"\)/, '$1');
            if(req.body.song==cleanValue) return res.status(400).send({
                message : 'Song already present in playlist'
            })
        
        }
         next();

    }catch(err){
        console.log('Error inside repeatedSongs Middleware',err);
        return res.status(500).send({
            message : "Internal Server Error"
        })
    }
}


module.exports = {
    repeatedSongs
}