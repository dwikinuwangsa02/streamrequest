const { TikTokLiveConnection } = require('tiktok-live-connector');

let tiktokConnection = new TikTokLiveConnection('pissss113', {});

tiktokConnection.connect().then(state => {}).catch(err => {});

tiktokConnection.on('chat', data => {
    console.log("CONTENT:", data.content);
    console.log("USER NICKNAME:", data.user?.nickname);
    console.log("USER AVATAR:", data.user?.avatarThumb?.urlList?.[0] || data.user?.avatarThumb);
    console.log("USER ID:", data.user?.id);
    process.exit(0);
});
