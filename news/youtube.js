require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');

// GCC API

const API_KEY = process.env.GOOGLE_API_KEY;

// 채널의 이름
const CHANNEL_USERNAME = '@algoran'; 

// 알고란 유튜브 채널 아이디 하드코딩
const ALGORAN_CHANNEL_ID = `UC7uFGmwzzXok18RdOh9FDfQ`;

let lastVideoId = ''; // 마지막으로 확인한 영상 ID 저장

// 채널 ID 가져오기
async function getChannelId(username) {
  const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${CHANNEL_USERNAME}&type=channel&key=${API_KEY}`;
  //const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${API_KEY}`;
  const response = await axios.get(url);

  if (!response.data.items || response.data.items.length === 0) {
    throw new Error('채널 ID를 찾을 수 없습니다. 사용자 이름을 확인하세요.');
  }

  const channelId = response.data.items[0]?.id.channelId;
  return channelId;
}

// 최신 영상 가져오기
async function getLatestVideo(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&key=${API_KEY}`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  const video = response.data.items[0];
  return {
    videoId: video.id.videoId,
    title: video.snippet.title,
    publishTime: video.snippet.publishTime,
  };
}

// 새로운 영상 확인
async function checkForNewVideos() {
  console.log('새 영상 확인 중...');
  try {
    // 채널 아이디 모르는 경우 처리 로직
    // const channelId = await getChannelId(CHANNEL_USERNAME);
    // if (!channelId) {
    //   console.error('채널 ID를 가져오지 못했습니다.');
    //   return;
    // }

    // console.log(`채널 아이디는 ${channelId} 입니다.`);

    const latestVideo = await getLatestVideo(ALGORAN_CHANNEL_ID);

    if (!lastVideoId)
    {
      console.log(`확인된 알고란 최근 영상아이디 : ${latestVideo.videoId}`);

      lastVideoId = latestVideo.videoId;
      return null;
    }

    if (latestVideo.videoId !== lastVideoId) {
      lastVideoId = latestVideo.videoId;
      console.log(`새로운 영상이 업로드되었습니다!`);
      console.log(`제목: ${latestVideo.title}`);
      console.log(`URL: https://www.youtube.com/watch?v=${latestVideo.videoId}`);
      console.log(`업로드 시간: ${latestVideo.publishTime}`);
      return {
        isNew: true,
        video: {
          title: latestVideo.title,
          url: `https://www.youtube.com/watch?v=${latestVideo.videoId}`,
          publishTime: latestVideo.publishTime,
        },
      };
    } else {
      console.log('새로운 영상이 없습니다.');
      return { isNew: false };
    }
  } catch (error) {
    console.error('유튜브 모니터링 오류 발생:', error.message);
    return { isNew: false, error: error.message };
  }
}

// 5분마다 실행 (Cron 스케줄러)
function startVideoCheckScheduler() {
    // 첫1회
    //console.log('유튜브 영상 업로드 검사...');
    //checkForNewVideos();

    // 5분마다
    cron.schedule('*/30 * * * *', () => {
        console.log('유튜브 영상 업로드 검사...');
        checkForNewVideos();
    });
}

// 외부 호출을 위한 함수 및 Scheduler Export
module.exports = { checkForNewVideos, startVideoCheckScheduler };
