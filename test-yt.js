const ytSearch = require('yt-search');
ytSearch('sabilulungan audio').then(res => {
    console.log(res.videos[0].videoId);
    console.log(res.videos[0].url);
});
