const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://jandj21c:${process.env.DATABASE_MONGO_PW}@clustercoco.8amuo.mongodb.net/?retryWrites=true&w=majority&appName=ClusterCoco`;
const dbName = 'coco_data';

let db;

// MongoDB 연결 초기화
async function connectToMongoDB() {
  try {
    const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        autoSelectFamily: false // 로컬에서 ip6 로 붙는 문제 해결
      });

    await client.connect();
    console.log('[mongoDB] 클라우드에 연결 성공');
    db = client.db(dbName);

    // 테이블(컬렉션) 생성 및 Primary Key 설정
    const collection = db.collection('cmc_icon_info');
    await collection.createIndex({ symbol: 1 }, { unique: true });
    console.log('[mongoDB] cmc_icon_info 컬렉션 초기화 완료');

  } catch (error) {
    console.error('-------- [mongoDB] 연결 실패: --------', error);
  }
}

// 데이터 삽입 함수
async function insertData(data) {
  try {
    const collection = db.collection('cmc_icon_info');
    const result = await collection.insertOne(data);
    console.log('[mongoDB] 데이터 삽입 성공:', result.insertedId);
    return result;
  } catch (error) {
    console.error('-------- [mongoDB] 데이터 삽입 실패: --------', error);
    throw error;
  }
}

// 데이터 조회 함수 (symbol로 logoUrl 가져오기)
async function readData(symbol) {
  try {
    const collection = db.collection('cmc_icon_info');
    const data = await collection.findOne({ symbol }, { projection: { logoUrl: 1, _id: 0 } });
    if (data) {
      console.log('[mongoDB] 데이터 조회 성공:', data.logoUrl);
      return data.logoUrl;
    } else {
      console.log('[mongoDB] 해당 symbol에 대한 데이터가 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('-------- [mongoDB] 데이터 조회 실패: --------', error);
    throw error;
  }
}

// MongoDB 연결 실행
connectToMongoDB();

// 함수 export
module.exports = {
  insertData,
  readData,
};
