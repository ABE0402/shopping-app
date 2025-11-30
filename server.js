import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";

const app = express();

// 모든 도메인에서의 요청을 허용합니다.
app.use(cors());

// 들어오는 요청의 본문을 JSON으로 파싱합니다. 모든 라우트보다 먼저 와야 합니다.
app.use(express.json({ limit: '50mb' }));
// URL-encoded 데이터(폼 데이터 등)의 크기 제한도 늘려줍니다.
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// '/api/data' 경로로 GET 요청이 오면 JSON 응답을 보냅니다.
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello CORS!" });
});

// 이미지 프록시 엔드포인트 추가
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send("Image URL is required");
  }

  // URL이 외부 경로(http로 시작)인지 로컬 경로인지 확인
  if (imageUrl.startsWith("http")) {
    // 외부 URL 처리 (기존 방식)
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      res.set("Content-Type", response.headers["content-type"]);
      res.send(response.data);
    } catch (error) {
      console.error("Error proxying external image:", error.message);
      res.status(502).send("Failed to fetch external image");
    }
  } else {
    // 로컬 파일 처리
    try {
      // __dirname은 ESM에서 기본적으로 사용할 수 없으므로, 현재 파일 위치를 기준으로 경로를 계산합니다.
      const __dirname = path.dirname(new URL(import.meta.url).pathname);
      // public 폴더 내의 이미지 파일 경로를 생성합니다. (예: /images/a.jpg -> public/images/a.jpg)
      const filePath = path.join(__dirname, "public", imageUrl);

      if (fs.existsSync(filePath)) {
        // 파일 확장자에 따라 적절한 Content-Type 설정
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
        res.set("Content-Type", mimeType);
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).send("Local image not found");
      }
    } catch (error) {
      console.error("Error reading local image:", error.message);
      res.status(500).send("Failed to read local image");
    }
  }
});

/**
 * Google Cloud Vertex AI (Imagen 2)를 사용하여 이미지를 생성하는 엔드포인트
 */
app.post("/api/generate-image", async (req, res) => {
  const { prompt, base64Image, maskImage } = req.body;
  const accessToken = process.env.GCLOUD_ACCESS_TOKEN; // gcloud auth print-access-token 으로 얻은 토큰
  const projectId = process.env.GCLOUD_PROJECT_ID; // Google Cloud 프로젝트 ID

  if (!accessToken || !projectId) {
    return res.status(500).json({ 
      error: "Google Cloud 인증 정보(Access Token, Project ID)가 서버 환경 변수에 설정되지 않았습니다." 
    });
  }

  const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen@006:predict`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
        ...(base64Image && { image: { bytesBase64Encoded: base64Image } }),
        ...(maskImage && { mask: { image: { bytesBase64Encoded: maskImage } } }),
      },
    ],
    parameters: {
      sampleCount: 1,
      // inpainting, outpainting, product-image 등 사용 사례에 따라 파라미터 추가 가능
    },
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const generatedImageBase64 = response.data?.predictions?.[0]?.bytesBase64Encoded;
    if (generatedImageBase64) {
      res.json({ base64Image: generatedImageBase64 });
    } else {
      res.status(500).json({ error: "API가 이미지를 반환하지 않았습니다.", details: response.data });
    }
  } catch (error) {
    console.error("Imagen API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Imagen API 호출 중 오류 발생", details: error.response?.data });
  }
});

const port = 3001; // 프론트엔드(3000)와 겹치지 않게 포트 변경
app.listen(port, () => console.log(`Backend server running on port ${port}`));