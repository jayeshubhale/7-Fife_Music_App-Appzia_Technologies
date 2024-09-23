

module.exports = {
    adsSettingGenerator : (setting) => {
        let obj = {}
        setting.forEach((set) => {
            obj["minutes"] = set.adsTiming.minutes,
            obj["seconds"] = set.adsTiming.seconds,
            obj["Status"]  = set.adsStatus
        })
        return obj;
    }
}